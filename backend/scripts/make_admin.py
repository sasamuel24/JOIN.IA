"""Promote a user to admin role.

Usage:
    cd backend
    py -m scripts.make_admin tu@email.com
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.db import SessionLocal
from app.models.user import User
# Importar modelos relacionados para que SQLAlchemy configure los relationships
import app.models.community_post  # noqa: F401
import app.models.community_post_comment  # noqa: F401
import app.models.community_debate  # noqa: F401
import app.models.community_debate_reply  # noqa: F401


def make_admin(email: str) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user:
            print(f"ERROR: No se encontró usuario con email '{email}'")
            sys.exit(1)

        if user.role == "admin":
            print(f"El usuario '{email}' ya es admin.")
            return

        user.role = "admin"
        db.commit()
        print(f"OK: '{email}' ahora tiene role = 'admin'")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: py -m scripts.make_admin tu@email.com")
        sys.exit(1)
    make_admin(sys.argv[1])
