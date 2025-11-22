from typing import List

from app.db import Record, User
from app.utils.chat_parsers.message_parser import ParsedChat, ParsedMessage


def parsed_chat_to_record(parsed_chat: ParsedChat, user: User) -> List[Record]:
    records: List[Record] = []
    for parsed_message in parsed_chat.messages:
        records.append(
            parsed_message_to_record(
                parsed_message=parsed_message,
                user=user,
                source=parsed_chat.source,
            )
        )

    return records


def parsed_message_to_record(
    parsed_message: ParsedMessage, user: User, source: str
) -> Record:
    return Record(
        sent_from=parsed_message.sender,
        person_id=user.id,
        source=source,
        time=parsed_message.timestamp,
    )
