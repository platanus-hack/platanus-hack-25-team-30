import instructor
from anthropic import Anthropic
from pydantic import BaseModel, Field


class ChatResponse(BaseModel):
    """Structured response from the LLM acting as the person."""

    message: str = Field(description="The response message from the person")


class HealthScoreAnalysis(BaseModel):
    """Structured response for relationship health analysis."""

    health_score: int = Field(
        description="Score from 0-100 representing relationship health. 0 = very poor/neglected, 50 = neutral, 100 = excellent/thriving",
        ge=0,
        le=100,
    )
    health_status: str = Field(
        description="Brief status label: 'Excelente', 'Buena', 'Regular', 'Necesita atención', or 'Crítica'"
    )
    reasoning: str = Field(
        description="Brief explanation of why this score was given based on the conversation patterns"
    )


class ConversationTopicAnalysis(BaseModel):
    """Structured response for last conversation topic analysis."""

    topic: str = Field(
        description="Main topic or theme of the recent conversation in 2-5 words (in Spanish)"
    )
    summary: str = Field(description="Brief one-sentence summary of what was discussed")


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
        for msg in message_history[-250:]:  # Last 50 messages for context
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


def analyze_relationship_health(
    client: instructor.Instructor,
    first_name: str,
    relationship_type: str,
    message_history: list[dict],
    user_name: str,
    total_interactions: int,
    response_time_median_min: float | None,
    communication_balance: float | None,
) -> HealthScoreAnalysis:
    """Analyze the health of a relationship based on conversation history and metrics.

    Args:
        client: The instructor-wrapped Anthropic client
        first_name: The contact's first name
        relationship_type: The type of relationship (e.g., "Familia", "Amigo Cercano")
        message_history: List of messages with sent_from and message_text
        user_name: The user's name
        total_interactions: Total number of messages exchanged
        response_time_median_min: Median response time in minutes
        communication_balance: Ratio of sent vs received messages
    """
    # Build context from recent messages
    history_text = ""
    if message_history:
        history_text = "\n\nÚltimos mensajes de la conversación:\n"
        for msg in message_history[-50:]:  # Last 50 messages for analysis
            sender = msg["sent_from"]
            history_text += f"- {sender}: {msg['message_text']}\n"

    metrics_text = f"""
Métricas de la relación:
- Total de interacciones: {total_interactions}
- Tiempo de respuesta mediano: {f'{response_time_median_min:.1f} minutos' if response_time_median_min else 'No disponible'}
- Balance de comunicación (enviados/recibidos): {f'{communication_balance:.2f}' if communication_balance is not None else 'No disponible'}
"""

    system_prompt = f"""Eres un analista de relaciones personales. Debes evaluar la salud de la relación entre {user_name} y {first_name} ({relationship_type}).

Basándote en el historial de conversaciones y las métricas proporcionadas, evalúa:
1. Frecuencia y consistencia de la comunicación
2. Tono y sentimiento de las conversaciones
3. Balance en la comunicación (quién inicia más, quién responde más)
4. Calidad de las interacciones

Considera que:
- Un balance cercano a 0.5 indica comunicación equilibrada
- Tiempos de respuesta cortos indican mayor engagement
- Más interacciones generalmente indican una relación más activa
- El tono positivo y conversaciones significativas son indicadores de buena salud

{metrics_text}
{history_text}

Proporciona un análisis objetivo y constructivo."""

    messages = [{"role": "user", "content": system_prompt}]

    response = client.chat.completions.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=512,
        messages=messages,
        response_model=HealthScoreAnalysis,
    )
    return response


def analyze_last_conversation_topic(
    client: instructor.Instructor,
    first_name: str,
    message_history: list[dict],
) -> ConversationTopicAnalysis:
    """Analyze the topic of the most recent conversation.

    Args:
        client: The instructor-wrapped Anthropic client
        first_name: The contact's first name
        message_history: List of messages with sent_from and message_text
    """
    if not message_history:
        return ConversationTopicAnalysis(
            topic="Sin conversaciones",
            summary="No hay mensajes registrados para analizar.",
        )

    # Get the last 20 messages for topic analysis
    recent_messages = message_history[-20:]
    history_text = "\n".join(
        f"- {msg['sent_from']}: {msg['message_text']}" for msg in recent_messages
    )

    system_prompt = f"""Analiza los siguientes mensajes recientes de una conversación con {first_name} y determina el tema principal de la última conversación.

Mensajes recientes:
{history_text}

Identifica el tema principal de forma concisa (2-5 palabras) y proporciona un breve resumen de lo que se discutió."""

    messages = [{"role": "user", "content": system_prompt}]

    response = client.chat.completions.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=256,
        messages=messages,
        response_model=ConversationTopicAnalysis,
    )
    return response
