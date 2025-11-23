from datetime import datetime, timedelta
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db import ContactStatsCache, Person, Record, User
from app.dependencies import get_user_token_header
from app.utils.llm.client import (
    analyze_last_conversation_topic,
    analyze_relationship_health,
    get_instructor_client,
)


class ContactStats(BaseModel):
    health_score: int
    health_status: str
    total_interactions: int
    last_interaction_date: Optional[datetime]
    last_conversation_topic: str
    response_time_median_min: Optional[float]
    communication_balance: Optional[float]


router = APIRouter(prefix="/{person_id}/stats", tags=["stats"])


@router.get("", response_model=ContactStats)
async def get_person(
    person_id: int,
    user: Annotated[User, Depends(get_user_token_header)],
):
    # Check if cached stats exist
    cached_stats = await ContactStatsCache.filter(
        person_id=person_id, person__user_id=user.id
    ).first()

    if cached_stats:
        return ContactStats(
            health_score=cached_stats.health_score,
            health_status=cached_stats.health_status,
            total_interactions=cached_stats.total_interactions,
            last_interaction_date=cached_stats.last_interaction_date,
            last_conversation_topic=cached_stats.last_conversation_topic,
            response_time_median_min=cached_stats.response_time_median_min,
            communication_balance=cached_stats.communication_balance,
        )

    # No cache exists, calculate stats
    person = await Person.filter(id=person_id, user_id=user.id).first()
    records = await Record.filter(person_id=person_id, person__user__id=user.id).all()

    # Calculate basic metrics first
    total_interactions = len(records)
    last_interaction_date = await calculate_last_interaction_date(person_id, user)
    response_time_median_min = await calculate_response_time_median_min(
        person_id, user
    )
    communication_balance = await calculate_communication_balance(person_id, user)

    # Prepare message history for LLM
    message_history = [
        {"sent_from": r.sent_from, "message_text": r.message_text}
        for r in sorted(records, key=lambda r: r.time)
    ]

    # Use LLM for health score and topic analysis
    try:
        client = get_instructor_client()

        # Analyze health score
        health_analysis = analyze_relationship_health(
            client=client,
            first_name=person.first_name if person else "Contacto",
            relationship_type=person.relationship_type if person else "Desconocido",
            message_history=message_history,
            user_name=user.username,
            total_interactions=total_interactions,
            response_time_median_min=response_time_median_min,
            communication_balance=communication_balance,
        )
        health_score = health_analysis.health_score
        health_status = health_analysis.health_status

        # Analyze last conversation topic
        topic_analysis = analyze_last_conversation_topic(
            client=client,
            first_name=person.first_name if person else "Contacto",
            message_history=message_history,
        )
        last_conversation_topic = topic_analysis.topic

    except Exception:
        # Fallback to placeholder values if LLM fails
        health_score = 50
        health_status = "Sin analizar"
        last_conversation_topic = "General Chat"

    # Save to cache
    await ContactStatsCache.create(
        person_id=person_id,
        health_score=health_score,
        health_status=health_status,
        last_conversation_topic=last_conversation_topic,
        total_interactions=total_interactions,
        last_interaction_date=last_interaction_date,
        response_time_median_min=response_time_median_min,
        communication_balance=communication_balance,
    )

    return ContactStats(
        health_score=health_score,
        health_status=health_status,
        total_interactions=total_interactions,
        last_interaction_date=last_interaction_date,
        last_conversation_topic=last_conversation_topic,
        response_time_median_min=response_time_median_min,
        communication_balance=communication_balance,
    )


async def calculate_last_interaction_date(
    person_id: int, user: User
) -> Optional[datetime]:
    record = await Record.filter(person_id=person_id, person__user__id=user.id).latest(
        "time"
    )

    if not record:
        return None

    return record.time


async def calculate_response_time_median_min(
    person_id: int, user: User
) -> Optional[float]:
    records = await Record.filter(person_id=person_id, person__user__id=user.id).all()

    if len(records) < 2:
        return None

    records.sort(key=lambda r: r.time)

    p1 = 0
    p2 = 1
    response_times: List[timedelta] = []

    while p2 < len(records):
        p1_record = records[p1]
        p2_record = records[p2]
        if p2 - p1 > 1 and p1_record.sent_from != p2_record.sent_from:
            p1 = p2 - 1

        if p1_record.sent_from == p2_record.sent_from:
            p2 += 1
            continue

        diff = p2_record.time - p1_record.time

        response_times.append(diff)

        p1 += 1
        p2 += 1

    median_response_time = sorted(
        [diff.total_seconds() / 60 for diff in response_times]
    )[len(response_times) // 2]

    return median_response_time


async def calculate_communication_balance(
    person_id: int, user: User
) -> Optional[float]:
    records = await Record.filter(person_id=person_id, person__user__id=user.id).all()

    if not records:
        return 0.0

    sent_count = sum(1 for r in records if r.sent_from == "user")
    received_count = sum(1 for r in records if r.sent_from != "user")

    if received_count == 0:
        return 1.0

    return sent_count / received_count
