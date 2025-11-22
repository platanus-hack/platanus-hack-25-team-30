from fastapi import Depends, FastAPI
from tortoise.contrib.fastapi import register_tortoise

from .db import TORTOISE_ORM
from .dependencies import get_token_header, get_user_token_header
from .internal import admin
from .routers import users
from .routers.persons import create as persons

app = FastAPI(dependencies=[Depends(get_user_token_header)])


app.include_router(users.router)
app.include_router(persons.router)
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
