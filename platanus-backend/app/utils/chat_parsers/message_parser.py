from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class ParsedMessage(BaseModel):
    timestamp: datetime
    sender: str
    message_text: str


class ParsedChat(BaseModel):
    messages: List[ParsedMessage]

    @field_validator("messages", mode="after")
    @classmethod
    def check_messages_not_empty(cls, v):
        if not v:
            raise ValueError("No messages were parsed from the chat.")


class MessagesParser(ABC):

    @abstractmethod
    def parse(self) -> List[ParsedMessage]:
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
