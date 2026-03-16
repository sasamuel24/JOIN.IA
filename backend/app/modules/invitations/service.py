from __future__ import annotations

from typing import Any, Dict

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User
from app.modules.invitations.repository import (
    MAX_INVITATIONS,
    accept_pending_by_email,
    count_accepted_by_inviter,
    create_invitation,
    get_by_email,
    get_by_inviter_and_email,
    get_by_token,
    get_pending_by_token,
    list_by_inviter,
    mark_accepted,
    set_inviter_access_tier,
)
from app.modules.invitations.schemas import (
    CreateInvitationRequest,
    InvitationResponse,
    InvitationStats,
    InvitationsListResponse,
)
from app.services.email_service import send_invitation_email

EARLY_ACCESS_TIER = "Early Access"


def list_invitations_for_user(current_user: User, db: Session) -> InvitationsListResponse:
    items = list_by_inviter(db, current_user.id)
    accepted_count = count_accepted_by_inviter(db, current_user.id)
    invited_count = len(items)
    remaining = max(0, MAX_INVITATIONS - accepted_count)

    return InvitationsListResponse(
        items=[InvitationResponse.model_validate(i) for i in items],
        stats=InvitationStats(
            invited_count=invited_count,
            accepted_count=accepted_count,
            remaining=remaining,
        ),
    )


def create_invitation_for_user(
    current_user: User,
    payload: CreateInvitationRequest,
    db: Session,
) -> InvitationResponse:
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    if email == (current_user.email or "").strip().lower():
        raise HTTPException(status_code=400, detail="You cannot invite your own email")

    existing = get_by_inviter_and_email(db, current_user.id, email)
    if existing:
        return InvitationResponse.model_validate(existing)

    try:
        inv = create_invitation(
            db,
            inviter_user_id=current_user.id,
            invited_email=email,
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This email has already been invited by someone else",
        )

    # Disparar correo de invitación vía N8N
    from app.core.config import settings as _settings
    from urllib.parse import urlencode
    params = urlencode({"mode": "register", "email": email, "invitation_token": inv.token})
    invitation_link = f"{_settings.FRONTEND_URL}/login?{params}"
    send_invitation_email(
        to_email=email,
        invitation_link=invitation_link,
        inviter_name=current_user.full_name or current_user.email,
        inviter_email=current_user.email,
    )

    return InvitationResponse.model_validate(inv)


def accept_invitation_by_token(
    current_user: User,
    token: str,
    db: Session,
) -> Dict[str, Any]:
    if not token or not token.strip():
        raise HTTPException(status_code=400, detail="Token is required")

    # Buscar por token sin importar el status
    inv = get_by_token(db, token.strip())
    if not inv:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation token")

    # Si ya fue aceptada: verificar si fue este mismo usuario (idempotente)
    if inv.status == "accepted":
        if str(inv.accepted_user_id) == str(current_user.id):
            return {"status": "accepted", "message": "Invitation already accepted"}
        # Fue aceptada por alguien más
        raise HTTPException(status_code=409, detail="This invitation has already been claimed")

    # Verificar que el email del usuario logueado coincide con el invitado
    user_email = (current_user.email or "").strip().lower()
    invited_email = (inv.invited_email or "").strip().lower()
    if user_email != invited_email:
        raise HTTPException(
            status_code=403,
            detail=f"Esta invitación fue enviada a {invited_email}. Inicia sesión con ese correo para aceptarla.",
        )

    updated = mark_accepted(db, inv.id, current_user.id)
    if updated:
        accepted_count = count_accepted_by_inviter(db, inv.inviter_user_id)
        if accepted_count >= MAX_INVITATIONS:
            set_inviter_access_tier(db, inv.inviter_user_id, EARLY_ACCESS_TIER)
    return {"status": "accepted", "message": "Invitation accepted successfully"}


def accept_pending_invitation_for_email(
    db: Session,
    email: str,
    accepted_user_id: Any,
) -> None:
    """Auto-accept any pending invitation for this email after user registration.

    Uses a direct UPDATE (accept_pending_by_email) to bypass the SQLAlchemy
    identity-map stale-read bug that prevented the status from being persisted.
    """
    normalized = (email or "").strip().lower()
    if not normalized:
        return

    updated = accept_pending_by_email(db, normalized, accepted_user_id)
    if not updated:
        return

    inv = get_by_email(db, normalized)
    if not inv:
        return

    accepted_count = count_accepted_by_inviter(db, inv.inviter_user_id)
    if accepted_count >= MAX_INVITATIONS:
        set_inviter_access_tier(db, inv.inviter_user_id, EARLY_ACCESS_TIER)
