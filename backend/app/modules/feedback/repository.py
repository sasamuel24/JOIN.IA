from __future__ import annotations

from typing import Optional, Sequence
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.feedback_answer import FeedbackAnswer
from app.models.feedback_form import FeedbackForm
from app.models.feedback_option import FeedbackOption  # noqa: F401
from app.models.feedback_question import FeedbackQuestion
from app.models.feedback_submission import FeedbackSubmission


# ---------------------------------------------------------------------------
# Form
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Submission
# ---------------------------------------------------------------------------

def get_submission_by_user_and_form(
    db: Session, user_id: UUID, form_id: UUID,
) -> Optional[FeedbackSubmission]:
    return (
        db.query(FeedbackSubmission)
        .filter(
            FeedbackSubmission.user_id == user_id,
            FeedbackSubmission.form_id == form_id,
        )
        .options(joinedload(FeedbackSubmission.answers))
        .first()
    )


def get_submission_by_id(db: Session, submission_id: UUID) -> Optional[FeedbackSubmission]:
    return (
        db.query(FeedbackSubmission)
        .filter(FeedbackSubmission.id == submission_id)
        .options(joinedload(FeedbackSubmission.answers))
        .first()
    )


def create_submission(db: Session, user_id: UUID, form_id: UUID) -> FeedbackSubmission:
    submission = FeedbackSubmission(user_id=user_id, form_id=form_id, status="draft")
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def mark_submitted(db: Session, submission: FeedbackSubmission) -> FeedbackSubmission:
    from sqlalchemy.sql import func

    submission.status = "submitted"
    submission.submitted_at = func.now()
    db.commit()
    db.refresh(submission)
    return submission


# ---------------------------------------------------------------------------
# Answers
# ---------------------------------------------------------------------------

def get_question_ids_for_form(db: Session, form_id: UUID) -> set[UUID]:
    rows = (
        db.query(FeedbackQuestion.id)
        .filter(FeedbackQuestion.form_id == form_id)
        .all()
    )
    return {r[0] for r in rows}


def get_required_question_ids_for_form(db: Session, form_id: UUID) -> set[UUID]:
    rows = (
        db.query(FeedbackQuestion.id)
        .filter(
            FeedbackQuestion.form_id == form_id,
            FeedbackQuestion.is_required.is_(True),
        )
        .all()
    )
    return {r[0] for r in rows}


def upsert_answer(
    db: Session,
    submission_id: UUID,
    question_id: UUID,
    *,
    answer_text: Optional[str] = None,
    answer_number: Optional[int] = None,
    answer_json: object = None,
    other_text: Optional[str] = None,
) -> FeedbackAnswer:
    existing = (
        db.query(FeedbackAnswer)
        .filter(
            FeedbackAnswer.submission_id == submission_id,
            FeedbackAnswer.question_id == question_id,
        )
        .first()
    )
    if existing:
        existing.answer_text = answer_text
        existing.answer_number = answer_number
        existing.answer_json = answer_json
        existing.other_text = other_text
        db.commit()
        db.refresh(existing)
        return existing

    answer = FeedbackAnswer(
        submission_id=submission_id,
        question_id=question_id,
        answer_text=answer_text,
        answer_number=answer_number,
        answer_json=answer_json,
        other_text=other_text,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


def get_answers_for_submission(db: Session, submission_id: UUID) -> Sequence[FeedbackAnswer]:
    return (
        db.query(FeedbackAnswer)
        .filter(FeedbackAnswer.submission_id == submission_id)
        .all()
    )
