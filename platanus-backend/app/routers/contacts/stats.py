import random
from datetime import datetime, timedelta
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db import Record, User
from app.dependencies import get_user_token_header


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
    health_score = await calculate_health_score(person_id, user)
    health_status = await calculate_health_status(person_id, user)
    total_interactions = await calculate_total_interactions(person_id, user)
    last_interaction_date = await calculate_last_interaction_date(person_id, user)
    last_conversation_topic = await calculate_last_conversation_topic(person_id, user)
    response_time_average_min = await calculate_response_time_median_min(
        person_id, user
    )
    communication_balance = await calculate_communication_balance(person_id, user)

    return ContactStats(
        health_score=health_score,
        health_status=health_status,
        total_interactions=total_interactions,
        last_interaction_date=last_interaction_date,
        last_conversation_topic=last_conversation_topic,
        response_time_median_min=response_time_average_min,
        communication_balance=communication_balance,
    )


async def calculate_health_score(person_id: int, user: User) -> int:
    return 50


async def calculate_health_status(person_id: int, user: User) -> str:
    return "placeholder"


async def calculate_total_interactions(person_id: int, user: User) -> int:
    records = await Record.filter(person_id=person_id, person__user__id=user.id).all()

    return len(records)


async def calculate_last_interaction_date(
    person_id: int, user: User
) -> Optional[datetime]:
    record = await Record.filter(person_id=person_id, person__user__id=user.id).latest(
        "time"
    )

    if not record:
        return None

    return record.time


async def calculate_last_conversation_topic(person_id: int, user: User) -> str:
    # Placeholder implementation
    return "General Chat"


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
        return 1

    # return sent_count / received_count

    return random.uniform(0, 1)
