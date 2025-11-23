import os
from typing import Annotated

import jwt
from fastapi import Header, HTTPException, Request

from .db import User

JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret-change-me")
JWT_ALGORITHM = "HS256"


async def get_token_header(x_token: Annotated[str, Header()]):
    if x_token != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")


async def user_token_to_user(user_token: str):
    """Decode JWT token and convert to User object."""
    print(user_token)
    try:
        payload = jwt.decode(user_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("username")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await User.get_or_none(username=username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_user_token_header(
    request: Request, user_token: Annotated[str, Header()] = ""
):
    # Skip authentication for public routes
    if request.url.path.startswith("/users"):
        return None
    if user_token == "":
        raise HTTPException(status_code=400, detail="User-Token header required")
    # Convert token to user object
    user = await user_token_to_user(user_token)
    return user
