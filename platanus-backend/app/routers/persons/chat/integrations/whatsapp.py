from fastapi import APIRouter, UploadFile

router = APIRouter(prefix="/integrations/whatsapp", tags=["integrations, whatsapp"])


@router.post("/upload")
async def upload_whatsapp_chat(file: UploadFile):
    pass
