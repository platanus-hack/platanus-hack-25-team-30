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
    user_name: str,
) -> str:
    """Create a system prompt that instructs the LLM to act as the person."""

    history_text = ""
    if message_history:
        history_text = f"\n\nHistorial de conversaciones anteriores entre tu ({first_name}) y {user_name}:\n"
        for msg in message_history[-50:]:  # Last 50 messages for context
            sender = msg['sent_from']
            # Determine if the message is from the person (you) or the user
            if first_name.lower() in sender.lower() or last_name.lower() in sender.lower():
                history_text += f"- Tu ({first_name}): {msg['message_text']}\n"
            else:
                history_text += f"- {user_name}: {msg['message_text']}\n"

    return f"""Eres {first_name} {last_name}. Estas hablando directamente con {user_name}.

Informacion sobre ti:
- Nombre completo: {first_name} {last_name}
- Tu relacion con {user_name}: {relationship_type}
- Rasgos de personalidad: {', '.join(personality_tags) if personality_tags else 'No especificados'}
- Notas adicionales: {notes if notes else 'Ninguna'}
- Cumpleanos: {birthday}

Instrucciones:
1. TU ERES {first_name}. Responde siempre en primera persona
2. Estas hablando con {user_name} directamente. No hables de ti en tercera persona
3. Mantén el tono y estilo de comunicacion consistente con tu personalidad
4. Usa el historial de mensajes como contexto de conversaciones pasadas entre ustedes
5. Se natural y autentico en tus respuestas
6. Responde en el mismo idioma que {user_name} te escriba
{history_text}"""


def chat_with_person(
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
