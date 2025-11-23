import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db import Person, Record, User
from app.utils.llm.client import (
    chat_with_person,
    create_person_system_prompt,
    get_instructor_client,
)

from .models import WebSocketErrorMessage, WebSocketOutgoingMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


async def authenticate_websocket(token: str) -> User | None:
    """Authenticate user from WebSocket query parameter."""
    if not token:
        print("No token provided")
        return None
    user = await User.get_or_none(username=token)
    return user


async def get_person_with_records(
    person_id: int, user: User
) -> tuple[Person | None, list[dict]]:
    """Fetch person and their message records."""
    person = await Person.get_or_none(id=person_id, user=user)
    if not person:
        return None, []

    records = await Record.filter(person=person).order_by("time").all()
    message_history = [
        {
            "sent_from": record.sent_from,
            "message_text": record.message_text,
            "time": record.time.isoformat(),
        }
        for record in records
    ]
    return person, message_history


@router.websocket("/{person_id}")
async def chat_websocket(websocket: WebSocket, person_id: int, token: str = ""):
    """
    WebSocket endpoint for chatting with a person.

    Connect with: ws://host/chat/{person_id}?token={user_token}

    Send messages as JSON: {"message": "Hello!"}
    Receive responses as JSON: {"response": "Hi there!", "person_id": 123}
    """
    # Authenticate user
    user = await authenticate_websocket(token)
    if not user:
        await websocket.close(code=4001, reason="Authentication required")
        return

    # Fetch person and validate ownership
    person, message_history = await get_person_with_records(person_id, user)
    if not person:
        await websocket.close(code=4004, reason="Person not found")
        return

    # Accept the connection
    await websocket.accept()
    logger.info(
        f"WebSocket connected: user={user.username}, person={person.first_name}"
    )

    # Initialize instructor client
    client = get_instructor_client()

    # Create system prompt with person context
    system_prompt = create_person_system_prompt(
        first_name=person.first_name,
        last_name=person.last_name,
        relationship_type=person.relationship_type,
        personality_tags=person.personality_tags or [],
        notes=person.notes or "",
        birthday=str(person.birthday),
        message_history=message_history,
        user_name=user.username,
    )

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()

            try:
                message_data = json.loads(data)
                user_message = message_data.get("message", "")

                if not user_message:
                    error_response = WebSocketErrorMessage(
                        error="Message cannot be empty"
                    )
                    await websocket.send_text(error_response.model_dump_json())
                    continue

                # Get response from LLM
                llm_response = chat_with_person(
                    client=client,
                    system_prompt=system_prompt,
                    user_message=user_message,
                )

                # Send response back
                response = WebSocketOutgoingMessage(
                    response=llm_response.message,
                    person_id=person_id,
                )
                await websocket.send_text(response.model_dump_json())

            except json.JSONDecodeError:
                error_response = WebSocketErrorMessage(error="Invalid JSON format")
                await websocket.send_text(error_response.model_dump_json())
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                error_response = WebSocketErrorMessage(
                    error="Failed to process message"
                )
                await websocket.send_text(error_response.model_dump_json())

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: user={user.username}")
