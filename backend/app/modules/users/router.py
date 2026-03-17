import asyncio

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.modules.users import service as users_service
from app.schemas.user import UserProfileResponse, UserProfileUpdate
from app.services.s3_service import upload_avatar


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


@router.post("/users/me/avatar")
async def upload_my_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload profile picture to S3 and persist the URL."""
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPG, PNG o WebP.")

    max_bytes = 20 * 1024 * 1024  # 20 MB
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 20 MB.")

    try:
        avatar_url = await asyncio.to_thread(
            upload_avatar, contents, file.content_type, str(current_user.id)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir la imagen: {e}")

    current_user.avatar_url = avatar_url
    db.add(current_user)
    db.commit()

    return {"avatar_url": avatar_url}


@router.patch("/users/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Actualizar perfil del usuario autenticado (solo campos enviados)."""
    return users_service.update_profile_for_current_user(payload, current_user, db)
