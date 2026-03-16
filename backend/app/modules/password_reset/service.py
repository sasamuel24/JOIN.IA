from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User
from app.modules.password_reset.repository import (
    create_reset_token,
    get_active_token_by_value,
    get_user_by_email,
    invalidate_active_tokens_for_user,
    mark_token_used,
)
from app.modules.password_reset.schemas import ForgotPasswordRequest, ResetPasswordRequest
from app.services.email_service import send_password_reset_email


def request_password_reset(payload: ForgotPasswordRequest, db: Session) -> Dict[str, Any]:
    """Logic behind POST /auth/forgot-password."""
    user = get_user_by_email(db, payload.email)

    if user:
        invalidate_active_tokens_for_user(db, user.id)

        raw_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        create_reset_token(db, user_id=user.id, token=raw_token, expires_at=expires_at)

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        send_password_reset_email(user.email, reset_link)

    return {"message": "Si el email existe, recibirás un correo con instrucciones."}


def reset_password_with_token(payload: ResetPasswordRequest, db: Session) -> Dict[str, Any]:
    """Logic behind POST /auth/reset-password."""
    reset_token = get_active_token_by_value(db, payload.token)

    if not reset_token:
        raise HTTPException(status_code=400, detail="Token inválido o ya utilizado")

    if reset_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="El token ha expirado")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(payload.new_password)
    mark_token_used(db, reset_token)

    return {"message": "Contraseña actualizada correctamente"}

