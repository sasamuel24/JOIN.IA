from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin_user, get_db
from app.models.user import User
from app.modules.admin import service as admin_service
from app.modules.admin.schemas import (
    AdminDashboardResponse,
    AdminDebateCreate,
    AdminDebateItem,
    AdminDebatesListResponse,
    AdminDebatesStats,
    AdminDebateUpdate,
    AdminFeedbackListResponse,
    AdminFeedbackStats,
    AdminFeedListResponse,
    AdminFeedStats,
    AdminInvitacionesListResponse,
    AdminInvitacionesStats,
    AdminResourceCreate,
    AdminResourceItem,
    AdminResourcesListResponse,
    AdminResourcesStats,
    AdminResourceUpdate,
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


# ---------------------------------------------------------------------------
# Feed Posts
# ---------------------------------------------------------------------------

@router.get("/feed/stats", response_model=AdminFeedStats)
def get_feed_stats(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminFeedStats:
    return admin_service.get_feed_stats(db)


@router.get("/feed", response_model=AdminFeedListResponse)
def get_feed_posts(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminFeedListResponse:
    return admin_service.get_feed_list(db)


@router.delete("/feed/{post_id}")
def delete_feed_post(
    post_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    return admin_service.delete_post_admin(db, post_id)


# ---------------------------------------------------------------------------
# Debates
# ---------------------------------------------------------------------------

@router.get("/debates/stats", response_model=AdminDebatesStats)
def get_debates_stats(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminDebatesStats:
    return admin_service.get_debates_stats(db)


@router.get("/debates", response_model=AdminDebatesListResponse)
def get_debates(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminDebatesListResponse:
    return admin_service.get_debates_list(db)


@router.post("/debates", response_model=AdminDebateItem)
def create_debate(
    request: AdminDebateCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminDebateItem:
    return admin_service.create_debate_admin(db, str(current_user.id), request)


@router.put("/debates/{debate_id}", response_model=AdminDebateItem)
def update_debate(
    debate_id: str,
    request: AdminDebateUpdate,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminDebateItem:
    return admin_service.update_debate_admin(db, debate_id, request)


@router.delete("/debates/{debate_id}")
def delete_debate(
    debate_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    return admin_service.delete_debate_admin(db, debate_id)


@router.patch("/debates/{debate_id}/featured", response_model=AdminDebateItem)
def toggle_debate_featured(
    debate_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminDebateItem:
    return admin_service.toggle_debate_featured(db, debate_id)


# ---------------------------------------------------------------------------
# Recursos
# ---------------------------------------------------------------------------

@router.get("/resources/stats", response_model=AdminResourcesStats)
def get_resources_stats(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminResourcesStats:
    return admin_service.get_resources_stats(db)


@router.get("/resources", response_model=AdminResourcesListResponse)
def get_resources(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminResourcesListResponse:
    return admin_service.get_resources_list(db)


@router.post("/resources", response_model=AdminResourceItem)
def create_resource(
    request: AdminResourceCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminResourceItem:
    return admin_service.create_resource_admin(db, str(current_user.id), request)


@router.put("/resources/{resource_id}", response_model=AdminResourceItem)
def update_resource(
    resource_id: str,
    request: AdminResourceUpdate,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminResourceItem:
    return admin_service.update_resource_admin(db, resource_id, request)


@router.delete("/resources/{resource_id}")
def delete_resource(
    resource_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    return admin_service.delete_resource_admin(db, resource_id)


@router.patch("/resources/{resource_id}/featured", response_model=AdminResourceItem)
def toggle_resource_featured(
    resource_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminResourceItem:
    return admin_service.toggle_resource_featured(db, resource_id)
