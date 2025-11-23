import instructor
from anthropic import Anthropic
from pydantic import BaseModel, Field


class ChatResponse(BaseModel):
    """Structured response from the LLM acting as the person."""

    message: str = Field(description="The response message from the person")


def get_instructor_client() -> instructor.Instructor:
    """Create an instructor-wrapped Anthropic client."""
    return instructor.from_anthropic(Anthropic())


def create_person_system_prompt(
    first_name: str,
    last_name: str,
    relationship_type: str,
    personality_tags: list[str],
    notes: str,
    birthday: str,
    message_history: list[dict],
) -> str:
    """Create a system prompt that instructs the LLM to act as the person."""

    history_text = ""
    if message_history:
        history_text = "\n\nHistorial de mensajes recientes:\n"
        for msg in message_history[-50:]:  # Last 50 messages for context
            history_text += f"- {msg['sent_from']}: {msg['message_text']}\n"

    return f"""Eres {first_name} {last_name}. Debes responder como si fueras esta persona.

Informacion sobre ti:
- Nombre completo: {first_name} {last_name}
- Tipo de relacion con el usuario: {relationship_type}
- Rasgos de personalidad: {', '.join(personality_tags) if personality_tags else 'No especificados'}
- Notas adicionales: {notes if notes else 'Ninguna'}
- Cumpleanos: {birthday}

Instrucciones:
1. Responde siempre en primera persona, como si fueras {first_name}
2. Mantén el tono y estilo de comunicacion consistente con la personalidad descrita
3. Si hay historial de mensajes, usalo como contexto para mantener coherencia
4. Se natural y autentico en tus respuestas
5. Responde en el mismo idioma que el usuario te escriba
{history_text}"""


async def chat_with_person(
    client: instructor.Instructor,
    system_prompt: str,
    user_message: str,
) -> ChatResponse:
    """Send a message and get a structured response."""
    response = client.chat.completions.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": user_message},
        ],
        system=system_prompt,
        response_model=ChatResponse,
    )
    return response
