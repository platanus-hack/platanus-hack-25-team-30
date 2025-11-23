from pydantic import BaseModel, Field


class WebSocketIncomingMessage(BaseModel):
    """Message sent from client to server via WebSocket."""

    message: str = Field(description="The user's message to the person")


class WebSocketOutgoingMessage(BaseModel):
    """Message sent from server to client via WebSocket."""

    response: str = Field(description="The person's response")
    person_id: int = Field(description="ID of the person responding")


class WebSocketErrorMessage(BaseModel):
    """Error message sent from server to client."""

    error: str = Field(description="Error description")
