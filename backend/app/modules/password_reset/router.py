from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.modules.password_reset import service as password_reset_service
from app.schemas.password_reset import ForgotPasswordRequest, ResetPasswordRequest


router = APIRouter()


@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Solicitar reset de contraseña — siempre responde igual
    para no revelar si el email existe o no
    """
    return password_reset_service.request_password_reset(payload, db)


@router.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Cambiar contraseña usando el token recibido por email"""
    return password_reset_service.reset_password_with_token(payload, db)
