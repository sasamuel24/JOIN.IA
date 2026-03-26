from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin_user, get_db
from app.models.event import Event
from app.models.user import User
from app.modules.events.schemas import (
    CreateEventRequest,
    EventListResponse,
    EventResponse,
    NextEventResponse,
    UpdateEventRequest,
)

router = APIRouter()


@router.get("/events/next", response_model=NextEventResponse, responses={204: {"description": "No upcoming event"}})
def get_next_event(db: Session = Depends(get_db)):
    """Return the next upcoming active event, or 204 if none."""
    now = datetime.now(timezone.utc)
    event = (
        db.query(Event)
        .filter(Event.is_active.is_(True), Event.event_date >= now)
        .order_by(Event.event_date.asc())
        .first()
    )
    if not event:
        from fastapi.responses import Response
        return Response(status_code=204)
    return NextEventResponse.model_validate(event)


# ── Admin endpoints ────────────────────────────────────────────────────────────

@router.get("/admin/events", response_model=EventListResponse)
def admin_list_events(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> EventListResponse:
    """List all events ordered by date desc. Admin only."""
    events = db.query(Event).order_by(Event.event_date.desc()).all()
    return EventListResponse(
        events=[EventResponse.model_validate(e) for e in events],
        total=len(events),
    )


@router.post("/admin/events", response_model=EventResponse, status_code=201)
def admin_create_event(
    payload: CreateEventRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> EventResponse:
    """Create a new event. Admin only."""
    event = Event(
        type=payload.type,
        title=payload.title,
        description=payload.description,
        event_date=payload.event_date,
        timezone_label=payload.timezone_label,
        registration_url=payload.registration_url,
        is_active=payload.is_active,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return EventResponse.model_validate(event)


@router.put("/admin/events/{event_id}", response_model=EventResponse)
def admin_update_event(
    event_id: UUID,
    payload: UpdateEventRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> EventResponse:
    """Update an existing event. Admin only."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return EventResponse.model_validate(event)


@router.delete("/admin/events/{event_id}", status_code=204)
def admin_delete_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> None:
    """Delete an event. Admin only."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
