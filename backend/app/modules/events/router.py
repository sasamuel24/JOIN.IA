from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.event import Event
from app.modules.events.schemas import NextEventResponse

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
