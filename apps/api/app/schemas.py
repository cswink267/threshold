"""Request and response shapes."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EntryIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(default="", max_length=10_000)


class EntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    body: str
    created_at: datetime
