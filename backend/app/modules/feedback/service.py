from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.feedback.repository import get_active_form
from app.modules.feedback.schemas import FeedbackFormResponse


def get_active_feedback_form(db: Session) -> FeedbackFormResponse:
    """Return the currently active feedback form with questions and options."""
    form = get_active_form(db)
    if not form:
        raise HTTPException(status_code=404, detail="No active feedback form found")
    return FeedbackFormResponse.model_validate(form)
