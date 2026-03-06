from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session, joinedload

from app.models.feedback_answer import FeedbackAnswer  # noqa: F401
from app.models.feedback_form import FeedbackForm
from app.models.feedback_option import FeedbackOption  # noqa: F401
from app.models.feedback_question import FeedbackQuestion
from app.models.feedback_submission import FeedbackSubmission  # noqa: F401


def get_active_form(db: Session) -> Optional[FeedbackForm]:
    """Return the active feedback form with its questions and options eagerly loaded."""
    return (
        db.query(FeedbackForm)
        .filter(FeedbackForm.is_active.is_(True))
        .options(
            joinedload(FeedbackForm.questions)
            .joinedload(FeedbackQuestion.options)
        )
        .first()
    )
