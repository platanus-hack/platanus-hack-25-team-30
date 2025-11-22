from datetime import date
from typing import Annotated, List, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db import Person as PersonModel
from app.db import User
from app.dependencies import get_user_token_header

from .chat.chat import router as chat_router

relationship_types = (
    "Familia",
    "Amigo Cercano",
    "Amigo",
    "Colega",
    "Romantico",
    "Conocido",
)
RELATIONSHIP_TYPES = Literal[
    "Familia",
    "Amigo Cercano",
    "Amigo",
    "Colega",
    "Romantico",
    "Conocido",
]


class Person(BaseModel):
    first_name: str
    last_name: str
    relationship_type: RELATIONSHIP_TYPES
    email: str
    phone: str
    birthday: date
    personality_tags: List[str]
    notes: str


class PersonResponse(Person):
    id: int


router = APIRouter(prefix="/persons", tags=["persons"])
router.include_router(chat_router)


@router.post("", response_model=PersonResponse)
async def create_person(
    person: Person,
    user: Annotated[User, Depends(get_user_token_header)],
):
    # Create the person in the database
    created_person = await PersonModel.create(
        user=user,
        first_name=person.first_name,
        last_name=person.last_name,
        relationship_type=person.relationship_type,
        email=person.email,
        phone=person.phone,
        birthday=person.birthday,
        personality_tags=person.personality_tags,
        notes=person.notes,
    )

    if created_person.relationship_type not in relationship_types:
        raise HTTPException(status_code=500, detail="Tipo de relacion invalida")

    return PersonResponse(
        id=created_person.id,
        first_name=created_person.first_name,
        last_name=created_person.last_name,
        relationship_type=created_person.relationship_type,
        email=created_person.email,
        phone=created_person.phone,
        birthday=created_person.birthday,
        personality_tags=created_person.personality_tags,
        notes=created_person.notes,
    )


@router.get("/", response_model=List[PersonResponse])
async def get_persons(
    user: Annotated[User, Depends(get_user_token_header)],
):
    # Fetch all persons for this user
    persons = await PersonModel.filter(user=user)

    return [get_person(person_id=person.id, user=user) for person in persons]


@router.get("/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: int,
    user: Annotated[User, Depends(get_user_token_header)],
):
    # Fetch the person from the database
    person = await PersonModel.get_or_none(id=person_id, user=user)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    if person.relationship_type not in relationship_types:
        raise HTTPException(status_code=500, detail="Tipo de relacion invalida")

    return PersonResponse(
        id=person.id,
        first_name=person.first_name,
        last_name=person.last_name,
        relationship_type=person.relationship_type,
        email=person.email,
        phone=person.phone,
        birthday=person.birthday,
        personality_tags=person.personality_tags,
        notes=person.notes,
    )
