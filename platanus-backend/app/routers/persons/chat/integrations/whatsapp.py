import logging
from typing import List

from fastapi import APIRouter, HTTPException, UploadFile

from app.utils.chat_parsers.specific.whatsapp_message_parser import (
    WhatsAppMessagesParser,
)

router = APIRouter(prefix="/integrations/whatsapp", tags=["integrations, whatsapp"])

logger = logging.getLogger(__name__)


@router.post("/participants")
async def get_participants_from_file(file: UploadFile):
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

    content = await file.read()
    lines: List[str] = content.decode("utf-8").splitlines()
    whatsapp_parser = WhatsAppMessagesParser(raw_messages=lines)
    messages = whatsapp_parser.parse()

    return messages


@router.post("/upload")
async def upload_whatsapp_chat(file: UploadFile, sent_from: str):
    logger.info("Received WhatsApp chat upload")
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

    content = await file.read()
    lines: List[str] = content.decode("utf-8").splitlines()
    whatsapp_parser = WhatsAppMessagesParser(raw_messages=lines)
    messages = whatsapp_parser.parse()

    return messages
