from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, HttpUrl


class NextEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: str
    title: str
    description: str | None
    event_date: datetime
    timezone_label: str
    registration_url: str | None


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: str
    title: str
    description: str | None
    event_date: datetime
    timezone_label: str
    registration_url: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None


class EventListResponse(BaseModel):
    events: list[EventResponse]
    total: int


class CreateEventRequest(BaseModel):
    type: str = "webinar"
    title: str
    description: str | None = None
    event_date: datetime
    timezone_label: str = "GMT-5 · Bogotá"
    registration_url: str | None = None
    is_active: bool = True


class UpdateEventRequest(BaseModel):
    type: str | None = None
    title: str | None = None
    description: str | None = None
    event_date: datetime | None = None
    timezone_label: str | None = None
    registration_url: str | None = None
    is_active: bool | None = None
