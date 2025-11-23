import logging
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.db import ContactStatsCache, Record, User
from app.dependencies import get_user_token_header
from app.routers.contacts.records.utils import (
    filter_already_uploaded_records,
    parsed_chat_to_record,
)
from app.utils.chat_parsers.specific.whatsapp_message_parser import (
    WhatsAppMessagesParser,
)

router = APIRouter(prefix="/integrations/whatsapp", tags=["integrations, whatsapp"])

logger = logging.getLogger(__name__)


@router.post("/participants")
async def get_participants_from_file(file: UploadFile) -> List[str]:
    logger.info("Received request to get participants from WhatsApp chat file")
    _check_file(file)

    content = await file.read()
    lines: List[str] = content.decode("utf-8").splitlines()
    whatsapp_parser = WhatsAppMessagesParser(raw_messages=lines)
    parsed_chat = whatsapp_parser.parse()

    return parsed_chat.participants


@router.post("/upload")
async def upload_whatsapp_chat(
    person_id: int,
    file: UploadFile,
    user: Annotated[User, Depends(get_user_token_header)],
):
    logger.info("Received WhatsApp chat upload")

    _check_file(file)

    content = await file.read()
    lines: List[str] = content.decode("utf-8").splitlines()
    whatsapp_parser = WhatsAppMessagesParser(raw_messages=lines)
    parsed_chat = whatsapp_parser.parse()

    records = parsed_chat_to_record(parsed_chat=parsed_chat, person_id=person_id)

    new_records = await filter_already_uploaded_records(
        records=records, person_id=person_id, user=user
    )

    await Record.bulk_create(new_records)

    # Invalidate stats cache for this person
    await ContactStatsCache.filter(person_id=person_id).delete()

    return {"uploaded_records": len(new_records)}


def _check_file(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    if file.content_type != "text/plain":
        raise HTTPException(
            status_code=400, detail="Invalid content type. Only text/plain is accepted."
        )
    if not file.filename.endswith(".txt"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only .txt files are accepted."
        )
