from __future__ import annotations

from typing import Any, Dict
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.repository import (
    create_google_user,
    create_local_user,
    get_user_by_email,
)
from app.modules.auth.schemas import LoginRequest, RegisterRequest


def register_user(payload: RegisterRequest, db: Session) -> Dict[str, Any]:
    """Logic behind POST /auth/register."""
    try:
        hashed = hash_password(payload.password)
        user = create_local_user(
            db,
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hashed,
        )
    except IntegrityError:
        # Mirrors router behavior
        raise HTTPException(status_code=400, detail="Email already registered")

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "provider": user.provider,
        "created_at": user.created_at,
    }


def login_user(payload: LoginRequest, db: Session) -> Dict[str, Any]:
    """Logic behind POST /auth/login."""
    user = get_user_by_email(db, payload.email)
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


async def google_oauth_callback(code: str, db: Session) -> RedirectResponse:
    """Logic behind GET /auth/google/callback (without Request parsing)."""
    if not code:
        raise HTTPException(status_code=400, detail="Missing code from Google")

    # 1) Intercambiar code por tokens
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

    # 2) Obtener perfil del usuario
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

    # 3) Crear / buscar usuario en DB
    user = get_user_by_email(db, email)
    if not user:
        user = create_google_user(
            db,
            email=email,
            full_name=full_name,
            provider_id=str(google_id),
        )

    # 4) Generar JWT
    jwt_token = create_access_token(str(user.id))

    # 5) Redirigir al frontend con el token
    frontend_callback = f"{settings.FRONTEND_URL}/auth/callback"
    params = urlencode({"token": jwt_token})
    return RedirectResponse(url=f"{frontend_callback}?{params}", status_code=302)

