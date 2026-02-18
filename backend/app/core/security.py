from datetime import datetime, timedelta
from jose import jwt
import bcrypt
from fastapi import HTTPException
from app.core.config import settings

ALGORITHM = "HS256"

def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    if expires_minutes is None:
        expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "exp": expire}

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str) -> str:
    pw = password.encode("utf-8")
    if len(pw) > 72:
        raise HTTPException(status_code=422, detail="Password too long (max 72 bytes)")
    hashed = bcrypt.hashpw(pw, bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    pw = password.encode("utf-8")
    if len(pw) > 72:
        return False
    return bcrypt.checkpw(pw, hashed_password.encode("utf-8"))