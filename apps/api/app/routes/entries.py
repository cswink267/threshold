"""A sample resource: Postgres stores it, Redis keeps the hot read path fast."""

from typing import Any

from fastapi import APIRouter
from sqlalchemy import select

from app import cache
from app.db import SessionDep
from app.models import Entry
from app.schemas import EntryIn, EntryOut

router = APIRouter(prefix="/entries", tags=["entries"])

RECENT = "entries:recent"


@router.get("", response_model=list[EntryOut])
async def list_entries(session: SessionDep) -> list[dict[str, Any]]:
    async def load() -> list[dict[str, Any]]:
        rows = await session.scalars(select(Entry).order_by(Entry.created_at.desc()).limit(50))
        return [EntryOut.model_validate(row).model_dump(mode="json") for row in rows]

    return await cache.remember(RECENT, ttl=60, produce=load)


@router.post("", response_model=EntryOut, status_code=201)
async def create_entry(data: EntryIn, session: SessionDep) -> Entry:
    entry = Entry(**data.model_dump())
    session.add(entry)
    await session.commit()
    await cache.forget(RECENT)
    return entry
