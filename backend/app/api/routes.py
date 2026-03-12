from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.auth_login import LoginRequest
from app.schemas.password_reset import ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import UserProfileResponse, UserProfileUpdate
from app.services.email_service import send_password_reset_email

api_router = APIRouter()


@api_router.get("/test")
async def test_endpoint():
    """Endpoint de prueba"""
    return {"message": "API funcionando correctamente"}


@api_router.get("/status")
async def get_status():
    """Obtener estado de la API"""
    return {"status": "active", "api_version": "1.0.0"}


# -------------------------
# Auth local: register/login
# -------------------------

@api_router.post("/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Registro de usuarios (self-signup)"""
    try:
        hashed_password = hash_password(payload.password)

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hashed_password,
            provider="local",
            is_active=True,
            is_verified=False,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "provider": user.provider,
            "created_at": user.created_at,
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")


@api_router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login de usuarios"""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    jwt_token = create_access_token(str(user.id))

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "provider": user.provider,
        },
    }


# -------------------------
# Sesión / usuario actual
# -------------------------

@api_router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    """Perfil mínimo (útil para session check en frontend)"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "provider": current_user.provider,
    }


@api_router.get("/users/me", response_model=UserProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Obtener perfil completo del usuario autenticado."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfileResponse.model_validate(user)


@api_router.patch("/users/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Actualizar perfil del usuario autenticado (solo campos enviados)."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return UserProfileResponse.model_validate(user)


# -------------------------
# Auth Google OAuth
# -------------------------

@api_router.get("/auth/google/login")
def google_login():
    scope = "openid email profile"

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?response_type=code"
        f"&client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&scope={scope}"
        f"&access_type=offline"
        f"&prompt=consent"
    )

    return RedirectResponse(url=google_auth_url)


@api_router.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code from Google")

    # 1) intercambiar code por tokens
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

    # 2) obtener perfil del usuario (email, id, name)
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

    # 3) crear / buscar usuario en DB
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=uuid.uuid4(),
            email=email,
            full_name=full_name,
            provider="google",
            provider_id=str(google_id),
            hashed_password=None,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4) generar TU JWT
    jwt_token = create_access_token(str(user.id))

    # 5) redirigir al frontend con el token
    frontend_callback = f"{settings.FRONTEND_URL}/auth/callback"
    params = urlencode({"token": jwt_token})
    return RedirectResponse(url=f"{frontend_callback}?{params}", status_code=302)


# -------------------------
# Password reset
# -------------------------

@api_router.post("/auth/forgot-password")
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


@api_router.post("/auth/reset-password")
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


