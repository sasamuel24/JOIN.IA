from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_db
from app.modules.auth import service as auth_service
from app.schemas.auth import RegisterRequest
from app.schemas.auth_login import LoginRequest


router = APIRouter()


@router.post("/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Registro de usuarios (self-signup)"""
    return auth_service.register_user(payload, db)


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login de usuarios"""
    return auth_service.login_user(payload, db)


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
    return await auth_service.google_oauth_callback(code, db)
