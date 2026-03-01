from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import HTTPException
from jose import jwt

from app.core.config import settings

ALGORITHM = "HS256"


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def hash_password(password: str) -> str:
    pw = password.encode("utf-8")
    # bcrypt solo usa los primeros 72 bytes
    if len(pw) > 72:
        raise HTTPException(status_code=422, detail="Password too long (max 72 bytes)")
    hashed = bcrypt.hashpw(pw, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    pw = password.encode("utf-8")
    if len(pw) > 72:
        return False
    return bcrypt.checkpw(pw, hashed_password.encode("utf-8"))