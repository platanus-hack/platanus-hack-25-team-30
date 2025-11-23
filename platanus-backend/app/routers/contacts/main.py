from fastapi import APIRouter

from .create import router as create_router
from .records.get import router as records_router
from .stats import router as stats_router

router = APIRouter(prefix="/contacts", tags=["contacts"])
router.include_router(records_router)
router.include_router(create_router)
router.include_router(stats_router)
