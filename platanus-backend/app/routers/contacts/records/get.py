from typing import Annotated, List

from fastapi import APIRouter, Depends

from app.db import Record, User
from app.dependencies import get_user_token_header
from app.routers.contacts.records.models import ChatMessage

router = APIRouter(prefix="/{person_id}/records", tags=["records"])


@router.get("", response_model=List[ChatMessage])
async def get_chats_for_person(
    person_id: int,
    user: Annotated[User, Depends(get_user_token_header)],
) -> List[ChatMessage]:
    db_records = await Record.filter(
        person_id=person_id, person__user__id=user.id
    ).all()

    chat_messages = []
    for db_record in db_records:
        source = db_record.source
        if source not in ["whatsapp"]:
            raise NotImplementedError(f"Chat source {db_record.source} not implemented")
        chat_message = ChatMessage(
            sent_from=db_record.sent_from,
            source=source,  # type: ignore
            time=db_record.time,
        )

        chat_messages.append(chat_message)

    return chat_messages
