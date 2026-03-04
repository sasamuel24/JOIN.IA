from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserProfileResponse, UserProfileUpdate


router = APIRouter()


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    """Perfil mínimo (útil para session check en frontend)"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "provider": current_user.provider,
    }


@router.get("/users/me", response_model=UserProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Obtener perfil completo del usuario autenticado."""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="User not found")
    return UserProfileResponse.model_validate(user)


@router.patch("/users/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Actualizar perfil del usuario autenticado (solo campos enviados)."""
    from fastapi import HTTPException

    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return UserProfileResponse.model_validate(user)

