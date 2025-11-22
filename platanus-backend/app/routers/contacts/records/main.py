from fastapi import APIRouter

from .integrations.whatsapp import router as whatsapp_router

router = APIRouter(prefix="/{person_id}/records", tags=["records"])
router.include_router(whatsapp_router)
