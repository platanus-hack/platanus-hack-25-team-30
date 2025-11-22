from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, field_validator


class ParsedMessage(BaseModel):
    timestamp: datetime
    sender: str
    message_text: str


class ParsedChat(BaseModel):
    messages: List[ParsedMessage]
    source: Literal["whatsapp"]

    @property
    def participants(self) -> List[str]:
        found_senders = set()
        for message in self.messages:
            found_senders.add(message.sender)

        return list(found_senders)

    @field_validator("messages", mode="after")
    @classmethod
    def _check_has_messages(cls, v: List[ParsedMessage]) -> List[ParsedMessage]:
        if not v:
            raise ValueError("No messages were parsed from the chat.")
        return v

    @field_validator("messages", mode="after")
    @classmethod
    def _check_two_participants(cls, v: List[ParsedMessage]) -> List[ParsedMessage]:
        found_senders = set()
        for message in v:
            found_senders.add(message.sender)

        if len(found_senders) > 2:
            raise ValueError("Chat contains more than two participants.")

        return v


class MessagesParser(ABC):

    @abstractmethod
    def parse(self) -> ParsedChat:
        pass

    @classmethod
    @abstractmethod
    def _parse_time(cls, message: str) -> Optional[datetime]:
        pass

    @classmethod
    @abstractmethod
    def _parse_sender(cls, message: str) -> Optional[str]:
        pass

    @classmethod
    @abstractmethod
    def _parse_message_text(cls, message: str) -> Optional[str]:
        pass
