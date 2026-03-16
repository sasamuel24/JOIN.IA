from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import distinct, func
from sqlalchemy.orm import Session, joinedload

from app.models.feedback_answer import FeedbackAnswer
from app.models.feedback_question import FeedbackQuestion
from app.models.feedback_submission import FeedbackSubmission
from app.models.invitation import Invitation
from app.models.user import User


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

def get_all_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.created_at.desc()).all()


def get_recent_users(db: Session, limit: int = 5) -> list[User]:
    return db.query(User).order_by(User.created_at.desc()).limit(limit).all()


def get_users_stats(db: Session) -> dict[str, Any]:
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    total = db.query(func.count(User.id)).scalar() or 0
    activos = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0
    nuevos_semana = (
        db.query(func.count(User.id))
        .filter(User.created_at >= week_ago)
        .scalar() or 0
    )
    con_feedback = (
        db.query(func.count(distinct(FeedbackSubmission.user_id)))
        .filter(FeedbackSubmission.status == "submitted")
        .scalar() or 0
    )

    por_grupo_rows = (
        db.query(User.group, func.count(User.id).label("count"))
        .filter(User.group.isnot(None))
        .group_by(User.group)
        .all()
    )
    por_tier_rows = (
        db.query(User.access_tier, func.count(User.id).label("count"))
        .filter(User.access_tier.isnot(None))
        .group_by(User.access_tier)
        .all()
    )

    return {
        "total": total,
        "activos": activos,
        "nuevos_semana": nuevos_semana,
        "con_feedback": con_feedback,
        "por_grupo": [{"grupo": r[0], "count": r[1]} for r in por_grupo_rows],
        "por_tier": [{"tier": r[0], "count": r[1]} for r in por_tier_rows],
    }


def count_invitations_sent_by_user(db: Session, user_id) -> int:
    return (
        db.query(func.count(Invitation.id))
        .filter(Invitation.inviter_user_id == user_id)
        .scalar() or 0
    )


def has_submitted_feedback(db: Session, user_id) -> bool:
    return (
        db.query(FeedbackSubmission.id)
        .filter(
            FeedbackSubmission.user_id == user_id,
            FeedbackSubmission.status == "submitted",
        )
        .first()
    ) is not None


def get_invitations_sent_bulk(db: Session) -> dict[str, int]:
    """Returns {user_id_str: count} for all users who sent invitations."""
    rows = (
        db.query(Invitation.inviter_user_id, func.count(Invitation.id).label("cnt"))
        .group_by(Invitation.inviter_user_id)
        .all()
    )
    return {str(r[0]): r[1] for r in rows}


def get_feedback_completed_bulk(db: Session) -> set[str]:
    """Returns set of user_id strings who completed feedback."""
    rows = (
        db.query(FeedbackSubmission.user_id)
        .filter(FeedbackSubmission.status == "submitted")
        .all()
    )
    return {str(r[0]) for r in rows}


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

def get_all_feedback_submissions(db: Session) -> list[tuple[FeedbackSubmission, User]]:
    """Returns (submission, user) tuples with answers eagerly loaded."""
    return (
        db.query(FeedbackSubmission, User)
        .join(User, FeedbackSubmission.user_id == User.id)
        .filter(FeedbackSubmission.status == "submitted")
        .options(
            joinedload(FeedbackSubmission.answers).joinedload(FeedbackAnswer.question)
        )
        .order_by(FeedbackSubmission.submitted_at.desc())
        .all()
    )


def get_feedback_stats_raw(db: Session) -> dict[str, Any]:
    """Aggregates feedback stats from submitted submissions."""
    total = (
        db.query(func.count(FeedbackSubmission.id))
        .filter(FeedbackSubmission.status == "submitted")
        .scalar() or 0
    )

    # Average impact level
    avg_impact = (
        db.query(func.avg(FeedbackAnswer.answer_number))
        .join(FeedbackQuestion, FeedbackAnswer.question_id == FeedbackQuestion.id)
        .join(FeedbackSubmission, FeedbackAnswer.submission_id == FeedbackSubmission.id)
        .filter(
            FeedbackQuestion.question_key == "impact_level",
            FeedbackSubmission.status == "submitted",
        )
        .scalar()
    )

    # Role distribution
    rol_rows = (
        db.query(FeedbackAnswer.answer_text, func.count(FeedbackAnswer.id).label("cnt"))
        .join(FeedbackQuestion, FeedbackAnswer.question_id == FeedbackQuestion.id)
        .join(FeedbackSubmission, FeedbackAnswer.submission_id == FeedbackSubmission.id)
        .filter(
            FeedbackQuestion.question_key == "role",
            FeedbackSubmission.status == "submitted",
            FeedbackAnswer.answer_text.isnot(None),
        )
        .group_by(FeedbackAnswer.answer_text)
        .order_by(func.count(FeedbackAnswer.id).desc())
        .all()
    )

    # Pain points — stored as JSON array; we need to unnest per item
    # We'll get all answer_json values and aggregate in Python
    pain_rows = (
        db.query(FeedbackAnswer.answer_json, FeedbackAnswer.other_text)
        .join(FeedbackQuestion, FeedbackAnswer.question_id == FeedbackQuestion.id)
        .join(FeedbackSubmission, FeedbackAnswer.submission_id == FeedbackSubmission.id)
        .filter(
            FeedbackQuestion.question_key == "pain_points",
            FeedbackSubmission.status == "submitted",
        )
        .all()
    )

    return {
        "total": total,
        "avg_impact": float(avg_impact) if avg_impact is not None else 0.0,
        "rol_rows": rol_rows,
        "pain_rows": pain_rows,
    }


# ---------------------------------------------------------------------------
# Invitations
# ---------------------------------------------------------------------------

def get_all_invitations(db: Session) -> list[tuple[Invitation, User]]:
    """Returns (invitation, inviter_user) tuples."""
    return (
        db.query(Invitation, User)
        .join(User, Invitation.inviter_user_id == User.id)
        .order_by(Invitation.created_at.desc())
        .all()
    )


def get_invitations_stats_raw(db: Session) -> dict[str, Any]:
    total = db.query(func.count(Invitation.id)).scalar() or 0
    pendientes = (
        db.query(func.count(Invitation.id))
        .filter(Invitation.status == "pending")
        .scalar() or 0
    )
    unidas = (
        db.query(func.count(Invitation.id))
        .filter(Invitation.status == "accepted")
        .scalar() or 0
    )
    expiradas = (
        db.query(func.count(Invitation.id))
        .filter(Invitation.status == "cancelled")
        .scalar() or 0
    )

    top_inviters_rows = (
        db.query(
            User.id,
            User.full_name,
            User.email,
            func.count(Invitation.id).label("sent"),
        )
        .join(Invitation, Invitation.inviter_user_id == User.id)
        .group_by(User.id, User.full_name, User.email)
        .order_by(func.count(Invitation.id).desc())
        .limit(10)
        .all()
    )

    return {
        "total": total,
        "pendientes": pendientes,
        "unidas": unidas,
        "expiradas": expiradas,
        "top_inviters_rows": top_inviters_rows,
    }


def get_accepted_count_per_inviter(db: Session) -> dict[str, int]:
    """Returns {user_id_str: accepted_count}."""
    rows = (
        db.query(Invitation.inviter_user_id, func.count(Invitation.id).label("cnt"))
        .filter(Invitation.status == "accepted")
        .group_by(Invitation.inviter_user_id)
        .all()
    )
    return {str(r[0]): r[1] for r in rows}
