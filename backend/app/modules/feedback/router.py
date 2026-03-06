from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.modules.feedback.schemas import FeedbackFormResponse
from app.modules.feedback import service as feedback_service


router = APIRouter()


@router.get("/feedback/forms/active", response_model=FeedbackFormResponse)
def get_active_form(db: Session = Depends(get_db)) -> FeedbackFormResponse:
    """Return the currently active feedback form with questions and options."""
    return feedback_service.get_active_feedback_form(db)
