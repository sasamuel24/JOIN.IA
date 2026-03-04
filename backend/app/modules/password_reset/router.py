from datetime import datetime, timedelta, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_db
from app.core.security import hash_password
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.schemas.password_reset import ForgotPasswordRequest, ResetPasswordRequest
from app.services.email_service import send_password_reset_email


router = APIRouter()


@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Solicitar reset de contraseña — siempre responde igual
    para no revelar si el email existe o no
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if user:
        # Invalida tokens anteriores del mismo usuario
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,  # noqa: E712
        ).update({"used": True})

        # Crea nuevo token con expiración de 1 hora
        raw_token = str(uuid.uuid4())
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=raw_token,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(reset_token)
        db.commit()

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        send_password_reset_email(user.email, reset_link)

    return {"message": "Si el email existe, recibirás un correo con instrucciones."}


@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Cambiar contraseña usando el token recibido por email"""
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.token,
        PasswordResetToken.used == False,  # noqa: E712
    ).first()

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
    reset_token.used = True

    db.commit()

    return {"message": "Contraseña actualizada correctamente"} 

