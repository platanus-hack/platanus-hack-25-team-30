from typing import Annotated

from fastapi import Header, HTTPException, Request

from .db import User


async def get_token_header(x_token: Annotated[str, Header()]):
    if x_token != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")


async def user_token_to_user(user_token: str):
    """Convert user token (username) to User object."""
    user = await User.get_or_none(username=user_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user token")
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
