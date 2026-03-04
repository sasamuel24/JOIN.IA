from __future__ import annotations

from typing import Optional
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.password_reset import PasswordResetToken
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Return user by email or None."""
    return db.query(User).filter(User.email == email).first()


def invalidate_active_tokens_for_user(db: Session, user_id) -> None:
    """Mark all non-used tokens for a user as used."""
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.used == False,  # noqa: E712
    ).update({"used": True})


def create_reset_token(
    db: Session,
    *,
    user_id,
    token: str,
    expires_at: datetime,
) -> PasswordResetToken:
    """Create and persist a new password reset token."""
    reset_token = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at,
    )
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    return reset_token


def get_active_token_by_value(db: Session, token_value: str) -> Optional[PasswordResetToken]:
    """Return a non-used token by its value or None."""
    return db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token_value,
        PasswordResetToken.used == False,  # noqa: E712
    ).first()


def mark_token_used(db: Session, reset_token: PasswordResetToken) -> None:
    """Mark the given token as used and commit."""
    reset_token.used = True
    db.add(reset_token)
    db.commit()

