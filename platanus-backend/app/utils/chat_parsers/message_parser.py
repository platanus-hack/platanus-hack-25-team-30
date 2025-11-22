from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ParsedMessage(BaseModel):
    timestamp: datetime
    sender: str
    message_text: str

class MessagesParser(ABC):

    @abstractmethod
    def parse(self) -> List[ParsedMessage]:
        pass

    @classmethod
    @abstractmethod
    def parse_time(cls, message: str) -> Optional[datetime]:
        pass

    @classmethod
    @abstractmethod
    def parse_sender(cls, message: str) -> Optional[str]:
        pass

    @classmethod
    @abstractmethod
    def parse_message_text(cls, message: str) -> Optional[str]:
        pass
