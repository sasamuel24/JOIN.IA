from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.modules.users import service as users_service
from app.schemas.user import UserProfileResponse, UserProfileUpdate


router = APIRouter()


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    """Perfil mínimo (útil para session check en frontend)"""
    return users_service.build_minimal_profile(current_user)


@router.get("/users/me", response_model=UserProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Obtener perfil completo del usuario autenticado."""
    return users_service.get_profile_for_current_user(current_user, db)


@router.patch("/users/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Actualizar perfil del usuario autenticado (solo campos enviados)."""
    return users_service.update_profile_for_current_user(payload, current_user, db)
