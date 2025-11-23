from fastapi import APIRouter

from .records.get import router as records_router

router = APIRouter(prefix="/contacts", tags=["contacts"])
router.include_router(records_router, tags=[])
