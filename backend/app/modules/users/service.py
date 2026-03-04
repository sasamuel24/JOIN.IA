from __future__ import annotations

from typing import Any, Dict

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.modules.users.repository import get_user_by_id, save_user
from app.modules.users.schemas import UserProfileResponse, UserProfileUpdate


def build_minimal_profile(current_user: User) -> Dict[str, Any]:
    """Logic behind GET /me."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "provider": current_user.provider,
    }


def get_profile_for_current_user(current_user: User, db: Session) -> UserProfileResponse:
    """Logic behind GET /users/me."""
    user = get_user_by_id(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfileResponse.model_validate(user)


def update_profile_for_current_user(
    payload: UserProfileUpdate,
    current_user: User,
    db: Session,
) -> UserProfileResponse:
    """Logic behind PATCH /users/me."""
    user = get_user_by_id(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    user = save_user(db, user)
    return UserProfileResponse.model_validate(user)

