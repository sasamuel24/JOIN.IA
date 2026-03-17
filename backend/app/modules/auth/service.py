from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.email_verification import EmailVerificationToken
from app.modules.auth.repository import (
    create_google_user,
    create_local_user,
    get_user_by_email,
)
from app.modules.auth.schemas import LoginRequest, RegisterRequest
from app.modules.invitations.service import accept_pending_invitation_for_email
from app.services.email_service import send_verification_email


def register_user(payload: RegisterRequest, db: Session) -> Dict[str, Any]:
    """Logic behind POST /auth/register."""
    try:
        hashed = hash_password(payload.password)
        user = create_local_user(
            db,
            email=payload.email.strip().lower(),
            full_name=payload.full_name,
            hashed_password=hashed,
        )
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

    # create_local_user has already committed the user row.
    # Accept any pending invitation for this email using a direct DB UPDATE.
    accept_pending_invitation_for_email(db, user.email, user.id)

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "provider": user.provider,
        "created_at": user.created_at,
    }


def _create_verification_token(db: Session, user_id) -> str:
    """Crea un token de verificación de email con 24h de vigencia."""
    # Invalidar tokens previos no usados
    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user_id,
        EmailVerificationToken.used == False,
    ).delete()
    db.flush()

    raw_token = str(uuid.uuid4())
    record = EmailVerificationToken(
        user_id=user_id,
        token=raw_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        used=False,
    )
    db.add(record)
    db.commit()
    return raw_token


def login_user(payload: LoginRequest, db: Session) -> Dict[str, Any]:
    """Logic behind POST /auth/login."""
    user = get_user_by_email(db, payload.email)
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Si el email no está verificado, enviar correo de verificación
    if not user.is_verified:
        raw_token = _create_verification_token(db, user.id)
        verification_link = (
            f"{settings.FRONTEND_URL}/verify-email/confirm?token={raw_token}"
        )
        send_verification_email(
            to_email=user.email,
            verification_link=verification_link,
            full_name=user.full_name or "",
        )
        raise HTTPException(
            status_code=403,
            detail="email_not_verified",
            headers={"X-User-Email": user.email},
        )

    jwt_token = create_access_token(str(user.id))

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "provider": user.provider,
            "role": user.role or "user",
        },
    }


def verify_email_token(token: str, db: Session) -> Dict[str, Any]:
    """Valida el token y marca el email como verificado."""
    record = (
        db.query(EmailVerificationToken)
        .filter(EmailVerificationToken.token == token)
        .first()
    )

    if not record:
        raise HTTPException(status_code=400, detail="Token inválido")
    if record.used:
        raise HTTPException(status_code=400, detail="El token ya fue utilizado")
    if record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="El token ha expirado")

    # Marcar verificado
    from app.models.user import User
    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Usuario no encontrado")

    user.is_verified = True
    record.used = True
    db.commit()

    jwt_token = create_access_token(str(user.id))
    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "provider": user.provider,
            "role": user.role or "user",
        },
    }


def resend_verification_email(email: str, db: Session) -> Dict[str, Any]:
    """Reenvía el correo de verificación."""
    user = get_user_by_email(db, email)
    if not user:
        # No revelar si existe o no
        return {"message": "Si el correo está registrado, recibirás un email de verificación."}

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Este correo ya está verificado")

    raw_token = _create_verification_token(db, user.id)
    verification_link = f"{settings.FRONTEND_URL}/verify-email/confirm?token={raw_token}"
    send_verification_email(
        to_email=user.email,
        verification_link=verification_link,
        full_name=user.full_name or "",
    )
    return {"message": "Si el correo está registrado, recibirás un email de verificación."}


async def google_oauth_callback(code: str, db: Session) -> RedirectResponse:
    """Logic behind GET /auth/google/callback."""
    if not code:
        raise HTTPException(status_code=400, detail="Missing code from Google")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Google token error: {token_resp.text}")

    token_data = token_resp.json()
    access_token_google = token_data.get("access_token")
    if not access_token_google:
        raise HTTPException(status_code=400, detail="No access_token from Google")

    async with httpx.AsyncClient() as client:
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token_google}"},
        )

    if userinfo_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Google userinfo error: {userinfo_resp.text}")

    info = userinfo_resp.json()
    email = info.get("email")
    google_id = info.get("id")
    full_name = info.get("name")

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Google response missing email or id")

    is_new_user = False
    user = get_user_by_email(db, email)
    if not user:
        user = create_google_user(
            db,
            email=email,
            full_name=full_name,
            provider_id=str(google_id),
        )
        is_new_user = True

    # Accept pending invitation only for brand-new Google users.
    if is_new_user:
        accept_pending_invitation_for_email(db, user.email, user.id)

    jwt_token = create_access_token(str(user.id))

    frontend_callback = f"{settings.FRONTEND_URL}/auth/callback"
    params = urlencode({"token": jwt_token})
    return RedirectResponse(url=f"{frontend_callback}?{params}", status_code=302)
#join
