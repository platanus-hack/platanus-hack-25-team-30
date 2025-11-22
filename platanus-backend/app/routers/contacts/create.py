import asyncio
from datetime import date
from typing import Annotated, List, Literal, Optional

from fastapi import APIRouter, Depends, File, HTTPException
from pydantic import BaseModel, Field

from app.db import Person as PersonModel
from app.db import User
from app.dependencies import get_user_token_header

from .records.get import router as records_router

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
    first_name: str = Field(examples=["Eduardo"])
    last_name: str = Field(examples=["Caceres"])
    photo: Annotated[bytes | None, File()] = Field(default=None, examples=[None])
    relationship_type: RELATIONSHIP_TYPES = Field(examples=[relationship_types[0]])
    email: Optional[str] = Field(default=None, examples=["eduardo.caceres@platanus.cl"])
    phone: Optional[str] = Field(default=None, examples=["+56 9 2345 1223"])
    birthday: date = Field(examples=[date(1990, 5, 21)])
    personality_tags: List[str] = Field(default=[], examples=[["neurotico"]])
    notes: str = Field(default="", examples=[""])


class PersonResponse(Person):
    id: int


router = APIRouter(prefix="/contacts", tags=["contacts"])
router.include_router(records_router, tags=[])


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
        photo=person.photo,
        relationship_type=person.relationship_type,
        email=person.email,
        phone=person.phone,
        birthday=person.birthday,
        personality_tags=person.personality_tags,
        notes=person.notes,
    )

    if created_person.relationship_type not in relationship_types:
        raise HTTPException(status_code=500, detail="Tipo de relacion invalida")

    return await get_person(person_id=created_person.id, user=user)


@router.get("", response_model=List[PersonResponse])
async def get_persons(
    user: Annotated[User, Depends(get_user_token_header)],
):
    # Fetch all persons for this user
    persons = await PersonModel.filter(user=user)

    return await asyncio.gather(
        *[get_person(person_id=person.id, user=user) for person in persons]
    )


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
        photo=person.photo,
        relationship_type=person.relationship_type,
        email=person.email,
        phone=person.phone,
        birthday=person.birthday,
        personality_tags=person.personality_tags,
        notes=person.notes,
    )
