from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, user_id) -> Optional[User]:
    """Return user by primary key or None."""
    return db.query(User).filter(User.id == user_id).first()


def save_user(db: Session, user: User) -> User:
    """Persist user changes and refresh instance."""
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

