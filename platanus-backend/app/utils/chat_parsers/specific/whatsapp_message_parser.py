import logging
import re
from datetime import datetime
from typing import List, Optional, override

from ..message_parser import MessagesParser, ParsedMessage

logger = logging.getLogger(__name__)


class WhatsAppMessagesParser(MessagesParser):
    time_pattern = re.compile(r"\[(.*?)\]")
    message_pattern = re.compile(r": (.*)")
    user_pattern = re.compile(r"\](.*?):")

    merged_messages: List[str]

    def __init__(self, raw_messages: List[str]):
        messages = raw_messages
        self.merged_messages = self._merge_messages(messages)

    def _merge_messages(self, messages: List[str]) -> List[str]:
        merged_messages = []
        for message in messages:
            message = message.replace("\u202f", " ")
            message = message.replace("\u200e", "")
            if not message:
                logger.info("Skipping empty message")
                continue
            if message[0] == "[":
                merged_messages.append(message)
            else:
                merged_messages[-1] += message + "\n"
        return merged_messages

    @override
    def parse(self) -> List[ParsedMessage]:
        parsed_messages: List[ParsedMessage] = []
        for message in self.merged_messages:
            parsed_message = self._parse_message(message)
            if parsed_message is None:
                logger.info(f"Skipping unparseable message: {message}")
                continue
            parsed_messages.append(parsed_message)
        return parsed_messages

    def _parse_message(self, message: str) -> Optional[ParsedMessage]:
        parsed_time = self._parse_time(message)
        parsed_sender = self._parse_sender(message)
        parsed_text = self._parse_message_text(message)
        if not parsed_time or not parsed_sender or not parsed_text:
            return None
        return ParsedMessage(
            timestamp=parsed_time, sender=parsed_sender, message_text=parsed_text
        )

    @classmethod
    def _parse_time(cls, message: str) -> Optional[datetime]:
        time_match = cls.time_pattern.search(message)
        if not time_match:
            logger.warning(f"Time pattern not found in message: {message}")
            return None
        time_str = time_match.group(1)
        try:
            parsed_time = datetime.strptime(time_str, "%d-%m-%y, %I:%M:%S %p")
        except Exception:
            logger.warning(f"Failed to parse time string: {time_str}")
            return None
        return parsed_time

    @classmethod
    def _parse_sender(cls, message: str) -> Optional[str]:
        user_match = cls.user_pattern.search(message)
        if not user_match:
            logger.warning("User pattern not found in message")
            return None
        user_str = user_match.group(1)
        if not isinstance(user_str, str):
            logger.warning("Parsed user is not a string")
            return None
        return user_str.strip()

    @classmethod
    def _parse_message_text(cls, message) -> Optional[str]:
        message_match = cls.message_pattern.search(message)
        if not message_match:
            logger.warning("Message text pattern not found in message")
            return None
        message_str = message_match.group(1)
        return message_str.strip()
