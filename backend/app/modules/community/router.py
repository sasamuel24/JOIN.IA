from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.modules.community import service as community_service
from app.modules.community.schemas import (
    CommunityMembersResponse,
    CommunityPostCommentResponse,
    CommunityPostCommentsResponse,
    CommunityPostResponse,
    CommunityPostsResponse,
    CommunityResourcesResponse,
    CommunityStatsResponse,
    CreateCommentRequest,
    CreatePostRequest,
    MemberSearchParams,
    PostSearchParams,
    ResourceSearchParams,
    CommunityDebateResponse,
    CommunityDebatesResponse,
    CreateDebateRequest,
    CommunityDebateReplyResponse,
    CommunityDebateRepliesResponse,
    CreateDebateReplyRequest,
    DebateSearchParams,
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


@router.get("/community/posts", response_model=CommunityPostsResponse)
def get_community_posts(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of posts per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityPostsResponse:
    """Get paginated list of community posts.
    
    Returns posts ordered by pinned first, then newest first.
    Includes comments count and author information.
    Requires authentication.
    """
    search_params = PostSearchParams(
        page=page,
        page_size=page_size
    )
    return community_service.get_feed_posts(db, search_params)


@router.post("/community/posts", response_model=CommunityPostResponse)
def create_community_post(
    request: CreatePostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityPostResponse:
    """Create a new community post.
    
    Creates a post by the current authenticated user.
    Requires authentication.
    """
    return community_service.create_feed_post(db, str(current_user.id), request)


@router.get("/community/posts/{post_id}/comments", response_model=CommunityPostCommentsResponse)
def get_post_comments(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityPostCommentsResponse:
    """Get all comments for a specific post.
    
    Returns comments ordered oldest first.
    Includes author information for each comment.
    Requires authentication.
    """
    return community_service.get_post_comments(db, post_id)


@router.post("/community/posts/{post_id}/comments", response_model=CommunityPostCommentResponse)
def create_post_comment(
    post_id: str,
    request: CreateCommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityPostCommentResponse:
    """Create a new comment on a post.
    
    Creates a comment by the current authenticated user on the specified post.
    Returns 404 if the post doesn't exist or is not published.
    Requires authentication.
    """
    return community_service.create_post_comment(db, post_id, str(current_user.id), request)


# Debate endpoints

@router.get("/community/debates", response_model=CommunityDebatesResponse)
def get_community_debates(
    category: Optional[str] = Query(None, description="Filter by debate category"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of debates per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityDebatesResponse:
    """Get paginated list of community debates.
    
    Returns debates ordered by featured first, then last activity, then newest.
    Includes replies count, participants count, and author information.
    Supports filtering by category.
    Requires authentication.
    """
    search_params = DebateSearchParams(
        category=category,
        page=page,
        page_size=page_size
    )
    return community_service.get_community_debates(db, search_params)


@router.post("/community/debates", response_model=CommunityDebateResponse)
def create_community_debate(
    request: CreateDebateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityDebateResponse:
    """Create a new community debate.
    
    Creates a debate by the current authenticated user.
    Generates a URL-friendly slug from the title.
    Requires authentication.
    """
    return community_service.create_community_debate(db, str(current_user.id), request)


@router.get("/community/debates/{debate_id}", response_model=CommunityDebateResponse)
def get_community_debate_detail(
    debate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityDebateResponse:
    """Get a single debate by ID.
    
    Returns debate detail with replies count, participants count, and author information.
    Returns 404 if the debate doesn't exist or is not published.
    Requires authentication.
    """
    return community_service.get_community_debate_detail(db, debate_id)


@router.get("/community/debates/{debate_id}/replies", response_model=CommunityDebateRepliesResponse)
def get_debate_replies(
    debate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityDebateRepliesResponse:
    """Get all replies for a specific debate.
    
    Returns replies ordered oldest first.
    Includes author information for each reply.
    Requires authentication.
    """
    return community_service.get_community_debate_replies(db, debate_id)


@router.post("/community/debates/{debate_id}/replies", response_model=CommunityDebateReplyResponse)
def create_debate_reply(
    debate_id: str,
    request: CreateDebateReplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityDebateReplyResponse:
    """Create a new reply on a debate.
    
    Creates a reply by the current authenticated user on the specified debate.
    Updates the debate's last_activity_at timestamp.
    Returns 404 if the debate doesn't exist or is not published.
    Requires authentication.
    """
    return community_service.create_community_debate_reply(db, debate_id, str(current_user.id), request)