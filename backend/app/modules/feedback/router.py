from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.modules.feedback import service as feedback_service
from app.modules.feedback.schemas import (
    FeedbackFormResponse,
    FeedbackSubmissionResponse,
    FeedbackSubmissionUpdateRequest,
    FeedbackSubmitResponse,
)

router = APIRouter()


@router.get("/feedback/forms/active", response_model=FeedbackFormResponse)
def get_active_form(db: Session = Depends(get_db)) -> FeedbackFormResponse:
    """Return the currently active feedback form with questions and options."""
    return feedback_service.get_active_feedback_form(db)


@router.post("/feedback/submissions", response_model=FeedbackSubmissionResponse)
def create_submission(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FeedbackSubmissionResponse:
    """Create a draft submission for the active form, or return the existing one."""
    return feedback_service.create_or_get_submission(current_user, db)


@router.patch(
    "/feedback/submissions/{submission_id}",
    response_model=FeedbackSubmissionResponse,
)
def update_submission(
    submission_id: UUID,
    payload: FeedbackSubmissionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FeedbackSubmissionResponse:
    """Save or update answers for the given draft submission."""
    return feedback_service.update_submission_answers(
        current_user, submission_id, payload, db,
    )


@router.post(
    "/feedback/submissions/{submission_id}/submit",
    response_model=FeedbackSubmitResponse,
)
def submit_submission(
    submission_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FeedbackSubmitResponse:
    """Mark a draft submission as submitted after validating required answers."""
    return feedback_service.submit_submission(current_user, submission_id, db)
