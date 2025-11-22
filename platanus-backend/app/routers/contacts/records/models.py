from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ChatMessage(BaseModel):
    sent_from: str
    source: Literal["whatsapp", "telegram", "custom"]
    time: datetime
