from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.modules.feedback import repository as repo
from app.modules.feedback.schemas import (
    FeedbackFormResponse,
    FeedbackSubmissionResponse,
    FeedbackSubmissionUpdateRequest,
    FeedbackSubmitResponse,
)


def get_active_feedback_form(db: Session) -> FeedbackFormResponse:
    """Return the currently active feedback form with questions and options."""
    form = repo.get_active_form(db)
    if not form:
        raise HTTPException(status_code=404, detail="No active feedback form found")
    return FeedbackFormResponse.model_validate(form)


# ---------------------------------------------------------------------------
# Submission: create / get draft
# ---------------------------------------------------------------------------

def create_or_get_submission(
    current_user: User, db: Session,
) -> FeedbackSubmissionResponse:
    form = repo.get_active_form(db)
    if not form:
        raise HTTPException(status_code=404, detail="No active feedback form found")

    existing = repo.get_submission_by_user_and_form(db, current_user.id, form.id)
    if existing:
        return FeedbackSubmissionResponse.model_validate(existing)

    submission = repo.create_submission(db, current_user.id, form.id)
    return FeedbackSubmissionResponse.model_validate(submission)


# ---------------------------------------------------------------------------
# Submission: update answers
# ---------------------------------------------------------------------------

def update_submission_answers(
    current_user: User,
    submission_id: UUID,
    payload: FeedbackSubmissionUpdateRequest,
    db: Session,
) -> FeedbackSubmissionResponse:
    submission = repo.get_submission_by_id(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your submission")
    if submission.status == "submitted":
        raise HTTPException(status_code=400, detail="Submission already submitted; answers cannot be changed")

    valid_qids = repo.get_question_ids_for_form(db, submission.form_id)

    for ans_input in payload.answers:
        if ans_input.question_id not in valid_qids:
            raise HTTPException(
                status_code=400,
                detail=f"Question {ans_input.question_id} does not belong to this form",
            )
        repo.upsert_answer(
            db,
            submission.id,
            ans_input.question_id,
            answer_text=ans_input.answer_text,
            answer_number=ans_input.answer_number,
            answer_json=ans_input.answer_json,
            other_text=ans_input.other_text,
        )

    refreshed = repo.get_submission_by_id(db, submission_id)
    return FeedbackSubmissionResponse.model_validate(refreshed)


# ---------------------------------------------------------------------------
# Submission: submit
# ---------------------------------------------------------------------------

def submit_submission(
    current_user: User,
    submission_id: UUID,
    db: Session,
) -> FeedbackSubmitResponse:
    submission = repo.get_submission_by_id(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your submission")
    if submission.status == "submitted":
        raise HTTPException(status_code=400, detail="Submission already submitted")

    required_qids = repo.get_required_question_ids_for_form(db, submission.form_id)
    answered_qids = {a.question_id for a in submission.answers}
    missing = required_qids - answered_qids
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required answers for {len(missing)} question(s)",
        )

    updated = repo.mark_submitted(db, submission)
    refreshed = repo.get_submission_by_id(db, updated.id)
    return FeedbackSubmitResponse.model_validate(refreshed)
