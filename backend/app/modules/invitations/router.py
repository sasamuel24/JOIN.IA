from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.modules.invitations.schemas import CreateInvitationRequest, InvitationResponse, InvitationsListResponse
from app.modules.invitations import service as invitations_service


router = APIRouter()


@router.get("/invitations", response_model=InvitationsListResponse)
def list_invitations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InvitationsListResponse:
    """List current user's invitations and stats (invited_count, accepted_count, remaining)."""
    return invitations_service.list_invitations_for_user(current_user, db)


@router.post("/invitations", response_model=InvitationResponse)
def create_invitation(
    payload: CreateInvitationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InvitationResponse:
    """Create a pending invitation. Idempotent: returns existing if same inviter+email."""
    return invitations_service.create_invitation_for_user(current_user, payload, db)


@router.get("/invitations/accept")
def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accept an invitation by token. Current user's email must match invited_email."""
    return invitations_service.accept_invitation_by_token(current_user, token, db)
