from fastapi import APIRouter

from .integrations.whatsapp import router as whatsapp_router

router = APIRouter(prefix="/chat", tags=["integrations, whatsapp"])

router.include_router(whatsapp_router)
