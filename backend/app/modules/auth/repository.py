from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Return user by email or None."""
    return db.query(User).filter(User.email == email).first()


def create_local_user(
    db: Session,
    *,
    email: str,
    full_name: Optional[str],
    hashed_password: str,
) -> User:
    """Create a new 'local' provider user and persist it."""
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        provider="local",
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_google_user(
    db: Session,
    *,
    email: str,
    full_name: Optional[str],
    provider_id: str,
) -> User:
    """Create a new 'google' provider user and persist it."""
    user = User(
        email=email,
        full_name=full_name,
        provider="google",
        provider_id=provider_id,
        hashed_password=None,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def safe_commit(db: Session) -> None:
    """Commit current transaction, letting caller handle errors."""
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

