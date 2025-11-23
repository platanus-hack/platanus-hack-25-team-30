import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db import User

JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7


def create_jwt_token(username: str) -> str:
    """Create a JWT token with username and 1 week expiration."""
    payload = {
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class RegisterUser(BaseModel):
    username: str
    password: str


class LoginUser(BaseModel):
    username: str
    password: str


class LoggedInUser(BaseModel):
    id: int
    username: str
    user_token: str
    created_at: datetime


router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=LoggedInUser)
async def register_user(user: RegisterUser):
    # Check if username already exists
    existing_user = await User.filter(username=user.username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Ese usuario ya esta usado")

    # Create new user
    new_user = await User.create(username=user.username, password=user.password)

    return await login_user(
        LoginUser(username=new_user.username, password=new_user.password)
    )


@router.post("/login", tags=["users"], response_model=LoggedInUser)
async def login_user(user: LoginUser):
    db_user = await User.filter(username=user.username, password=user.password).first()
    if not db_user:
        raise HTTPException(
            status_code=404, detail="Usuario no existe o clave incorrecta"
        )

    return LoggedInUser(
        id=db_user.id,
        username=db_user.username,
        user_token=create_jwt_token(db_user.username),
        created_at=db_user.created_at,
    )
