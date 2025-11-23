import logging

from dotenv import load_dotenv
from fastapi import Depends, FastAPI

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

from .db import TORTOISE_ORM
from .dependencies import get_token_header, get_user_token_header
from .internal import admin
from .routers import users
from .routers.chat import router as chat_router
from .routers.contacts import create as persons

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(dependencies=[])

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://hackathon.buzeta.net",
    "https://hackathon.buzeta.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(persons.router)
app.include_router(chat_router)
app.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_token_header)],
    responses={418: {"description": "I'm a teapot"}},
)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}


register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)
