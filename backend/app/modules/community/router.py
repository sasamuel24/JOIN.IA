from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.modules.community import service as community_service
from app.modules.community.schemas import (
    CommunityMembersResponse,
    CommunityResourcesResponse,
    CommunityStatsResponse,
    MemberSearchParams,
    ResourceSearchParams,
)


router = APIRouter()


@router.get("/community/stats", response_model=CommunityStatsResponse)
def get_community_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityStatsResponse:
    """Get community statistics for the dashboard header.
    
    Returns member count, posts count, and currently active users count.
    Requires authentication.
    """
    return community_service.get_community_stats(db)


@router.get("/community/members", response_model=CommunityMembersResponse)
def get_community_members(
    search: Optional[str] = Query(None, description="Search term for filtering members"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of members per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityMembersResponse:
    """Get paginated list of community members.
    
    Supports search filtering by name, role, or company.
    Returns paginated results with metadata.
    Requires authentication.
    """
    search_params = MemberSearchParams(
        search=search,
        page=page,
        page_size=page_size
    )
    return community_service.get_community_members(db, search_params)


@router.get("/community/resources", response_model=CommunityResourcesResponse)
def get_community_resources(
    search: Optional[str] = Query(None, description="Search term for filtering resources"),
    type: Optional[str] = Query(None, description="Filter by resource type"),
    category: Optional[str] = Query(None, description="Filter by resource category"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of resources per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityResourcesResponse:
    """Get paginated list of community resources.
    
    Supports search filtering by title, description, or author name.
    Supports filtering by resource type and category.
    Returns only published resources ordered by featured first, then newest.
    Requires authentication.
    """
    search_params = ResourceSearchParams(
        search=search,
        type=type,
        category=category,
        page=page,
        page_size=page_size
    )
    return community_service.get_community_resources(db, search_params)