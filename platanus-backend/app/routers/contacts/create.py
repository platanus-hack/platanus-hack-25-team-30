import asyncio
from datetime import date
from typing import Annotated, List, Literal, Optional

from fastapi import Depends, File, HTTPException, Response
from pydantic import BaseModel, Field

from app.db import Person as PersonModel
from app.db import User
from app.dependencies import get_user_token_header

from .main import router

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
    relationship_type: RELATIONSHIP_TYPES = Field(examples=[relationship_types[0]])
    email: Optional[str] = Field(default=None, examples=["eduardo.caceres@platanus.cl"])
    phone: Optional[str] = Field(default=None, examples=["+56 9 2345 1223"])
    birthday: date = Field(examples=[date(1990, 5, 21)])
    personality_tags: List[str] = Field(default=[], examples=[["neurotico"]])
    notes: str = Field(default="", examples=[""])


class PersonResponse(Person):
    id: int


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
        photo=None,
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
        relationship_type=person.relationship_type,
        email=person.email,
        phone=person.phone,
        birthday=person.birthday,
        personality_tags=person.personality_tags,
        notes=person.notes,
    )


@router.post("/{person_id}/photo", response_model=PersonResponse)
async def upload_person_photo(
    person_id: int,
    person_photo: Annotated[bytes, File()],
    user: Annotated[User, Depends(get_user_token_header)],
):
    # Fetch the person from the database
    person = await PersonModel.get_or_none(id=person_id, user=user)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    # Update the person's photo
    person.photo = person_photo
    await person.save()

    return await get_person(person_id=person_id, user=user)


@router.get("/{person_id}/photo")
async def get_person_photo(
    person_id: int,
    user: Annotated[User, Depends(get_user_token_header)],
):
    # Fetch the person from the database
    person = await PersonModel.get_or_none(id=person_id, user=user)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    print("sdasd")

    if not person.photo:
        print("Returning empty")
        raise HTTPException(status_code=204, detail="Person has no photo")

    return Response(
        content=person.photo,
        media_type="image/jpeg",
    )
