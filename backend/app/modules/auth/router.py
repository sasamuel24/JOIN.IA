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
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.auth_login import LoginRequest


router = APIRouter()


@router.post("/auth/register")
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


@router.post("/auth/login")
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


@router.get("/auth/google/login")
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


@router.get("/auth/google/callback")
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

