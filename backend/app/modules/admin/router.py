from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin_user, get_db
from app.models.user import User
from app.modules.admin import service as admin_service
from app.modules.admin.schemas import (
    AdminDashboardResponse,
    AdminFeedbackListResponse,
    AdminFeedbackStats,
    AdminInvitacionesListResponse,
    AdminInvitacionesStats,
    AdminUsersListResponse,
    AdminUsersStats,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_dashboard(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminDashboardResponse:
    """Metrics + 5 recent users for the admin dashboard."""
    return admin_service.get_dashboard(db)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@router.get("/users/stats", response_model=AdminUsersStats)
def get_users_stats(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUsersStats:
    return admin_service.get_users_stats(db)


@router.get("/users/recent", response_model=AdminUsersListResponse)
def get_recent_users(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUsersListResponse:
    return admin_service.get_recent_users(db)


@router.get("/users", response_model=AdminUsersListResponse)
def get_users(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminUsersListResponse:
    return admin_service.get_users_list(db)


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

@router.get("/feedback/stats", response_model=AdminFeedbackStats)
def get_feedback_stats(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminFeedbackStats:
    return admin_service.get_feedback_stats(db)


@router.get("/feedback", response_model=AdminFeedbackListResponse)
def get_feedback(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminFeedbackListResponse:
    return admin_service.get_feedback_list(db)


# ---------------------------------------------------------------------------
# Invitations
# ---------------------------------------------------------------------------

@router.get("/invitations/stats", response_model=AdminInvitacionesStats)
def get_invitations_stats(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminInvitacionesStats:
    return admin_service.get_invitations_stats(db)


@router.get("/invitations", response_model=AdminInvitacionesListResponse)
def get_invitations(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminInvitacionesListResponse:
    return admin_service.get_invitations_list(db)
