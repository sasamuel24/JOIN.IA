from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.invitation import Invitation
from app.models.user import User

# Max invitations per user. When accepted_count >= MAX_INVITATIONS, inviter gets Early Access.
MAX_INVITATIONS = 5


def list_by_inviter(db: Session, inviter_user_id: uuid.UUID) -> list[Invitation]:
    return (
        db.query(Invitation)
        .filter(Invitation.inviter_user_id == inviter_user_id)
        .order_by(Invitation.created_at.desc())
        .all()
    )


def count_accepted_by_inviter(db: Session, inviter_user_id: uuid.UUID) -> int:
    return (
        db.query(Invitation)
        .filter(
            Invitation.inviter_user_id == inviter_user_id,
            Invitation.status == "accepted",
        )
        .count()
    )


def get_by_inviter_and_email(
    db: Session,
    inviter_user_id: uuid.UUID,
    invited_email: str,
) -> Optional[Invitation]:
    return (
        db.query(Invitation)
        .filter(
            Invitation.inviter_user_id == inviter_user_id,
            Invitation.invited_email == invited_email.strip().lower(),
        )
        .first()
    )


def get_pending_by_email(db: Session, email: str) -> Optional[Invitation]:
    """Return one pending invitation for this email."""
    normalized = (email or "").strip().lower()
    if not normalized:
        return None
    return (
        db.query(Invitation)
        .filter(
            Invitation.invited_email == normalized,
            Invitation.status == "pending",
        )
        .first()
    )


def get_by_email(db: Session, email: str) -> Optional[Invitation]:
    """Return the most recent invitation for this email regardless of status."""
    normalized = (email or "").strip().lower()
    if not normalized:
        return None
    return (
        db.query(Invitation)
        .filter(Invitation.invited_email == normalized)
        .order_by(Invitation.created_at.desc())
        .first()
    )


def get_pending_by_token(db: Session, token: str) -> Optional[Invitation]:
    return (
        db.query(Invitation)
        .filter(Invitation.token == token, Invitation.status == "pending")
        .first()
    )


def create_invitation(
    db: Session,
    *,
    inviter_user_id: uuid.UUID,
    invited_email: str,
    token: Optional[str] = None,
) -> Invitation:
    """Create a pending invitation. May raise IntegrityError on duplicate."""
    inv = Invitation(
        inviter_user_id=inviter_user_id,
        invited_email=invited_email.strip().lower(),
        status="pending",
        token=token or uuid.uuid4().hex,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


def accept_pending_by_email(
    db: Session,
    email: str,
    accepted_user_id: uuid.UUID,
) -> bool:
    """Mark the single pending invitation for this email as accepted via a direct UPDATE.

    Uses db.query().update() with synchronize_session=False to bypass the SQLAlchemy
    identity-map entirely, which avoids the stale-read bug where load→modify→commit
    can silently produce an empty UPDATE when the object is in an expired state.

    Returns True if exactly one row was updated, False otherwise.
    """
    normalized = (email or "").strip().lower()
    if not normalized:
        return False
    now = datetime.now(timezone.utc)
    rows = (
        db.query(Invitation)
        .filter(
            Invitation.invited_email == normalized,
            Invitation.status == "pending",
        )
        .update(
            {
                "status": "accepted",
                "accepted_at": now,
                "accepted_user_id": accepted_user_id,
            },
            synchronize_session=False,
        )
    )
    db.commit()
    return rows > 0


def mark_accepted(
    db: Session,
    invitation_id: uuid.UUID,
    accepted_user_id: uuid.UUID,
) -> bool:
    """Mark a pending invitation as accepted by ID (used in the token-based accept flow)."""
    now = datetime.now(timezone.utc)
    rows = (
        db.query(Invitation)
        .filter(
            Invitation.id == invitation_id,
            Invitation.status == "pending",
        )
        .update(
            {
                "status": "accepted",
                "accepted_at": now,
                "accepted_user_id": accepted_user_id,
            },
            synchronize_session=False,
        )
    )
    db.commit()
    return rows == 1


def set_inviter_access_tier(db: Session, inviter_user_id: uuid.UUID, access_tier: str) -> None:
    """Set user.access_tier for the inviter."""
    db.query(User).filter(User.id == inviter_user_id).update(
        {"access_tier": access_tier}, synchronize_session=False
    )
    db.commit()
