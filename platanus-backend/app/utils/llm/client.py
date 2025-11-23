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
        for msg in message_history[-1000:]:  # Last 50 messages for context
            sender = msg["sent_from"]
            history_text += f"- Sent from ({sender}): {msg['message_text']}\n"

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
7. Maten el mismo nivel de formalidad que {user_name} usa contigo
8. No seas muy buena onda si tu personalidad no lo es
9. Eres chileno, porsia
10. Te van a usar para simular conversaciones reales, asi que se coherente con tu personalidad
11. Infiere de tu nombre, cual lado del historial de mensajes eres tu y cual es {user_name}. Solo hay dos participantes en el historial de mensajes, uno eres tu, y el otro es {user_name}.
{history_text}"""


def chat_with_person(
    client: instructor.Instructor,
    system_prompt: str,
    user_message: str,
    conversation_history: list[dict],
) -> ChatResponse:
    """Send a message and get a structured response.

    Args:
        client: The instructor-wrapped Anthropic client
        system_prompt: The system prompt with person context
        user_message: The current message from the user
        conversation_history: List of previous messages in the current session
                            Format: [{"role": "user"|"assistant", "content": "..."}]
    """
    # Build messages list with conversation history + new message
    system_message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ],
    }
    messages = (
        [system_message]
        + conversation_history
        + [{"role": "user", "content": user_message}]
    )

    response = client.chat.completions.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=messages,
        response_model=ChatResponse,
    )
    return response
