from datetime import datetime
from uuid import UUID
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CommunityStatsResponse(BaseModel):
    """Response schema for community stats."""
    miembros: int
    posts: int
    activosAhora: int


class CommunityMemberResponse(BaseModel):
    """Response schema for a community member."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    role: str | None = None
    avatar_url: str | None = None
    joined_at: datetime
    is_active_now: bool = False


class CommunityMembersResponse(BaseModel):
    """Response schema for paginated community members."""
    members: List[CommunityMemberResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MemberSearchParams(BaseModel):
    """Search parameters for community members."""
    search: Optional[str] = None
    page: int = 1
    page_size: int = 20


class CommunityResourceResponse(BaseModel):
    """Response schema for a community resource."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    slug: str
    description: str
    type: str  # guide, template, video, article, tool
    category: str | None = None
    thumbnail_url: str | None = None
    resource_url: str | None = None
    author_name: str | None = None
    is_featured: bool
    published_at: datetime | None


class CommunityResourcesResponse(BaseModel):
    """Response schema for paginated community resources."""
    resources: List[CommunityResourceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ResourceSearchParams(BaseModel):
    """Search parameters for community resources."""
    search: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    page: int = 1
    page_size: int = 20


# Feed Posts and Comments Schemas

class PostAuthorResponse(BaseModel):
    """Response schema for post author info."""
    id: UUID
    name: str
    role: str | None = None
    avatar_url: str | None = None


class CommunityPostResponse(BaseModel):
    """Response schema for a community post."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    content: str
    created_at: datetime
    comments_count: int
    likes_count: int
    is_liked_by_me: bool
    author: PostAuthorResponse


class PostLikeResponse(BaseModel):
    """Response schema for toggling a like."""
    likes_count: int
    is_liked_by_me: bool


class CommunityPostsResponse(BaseModel):
    """Response schema for paginated community posts."""
    posts: List[CommunityPostResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CreatePostRequest(BaseModel):
    """Request schema for creating a post."""
    content: str


class CommentAuthorResponse(BaseModel):
    """Response schema for comment author info."""
    id: UUID
    name: str
    role: str | None = None
    avatar_url: str | None = None


class CommunityPostCommentResponse(BaseModel):
    """Response schema for a community post comment."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    content: str
    created_at: datetime
    author: CommentAuthorResponse


class CommunityPostCommentsResponse(BaseModel):
    """Response schema for post comments."""
    comments: List[CommunityPostCommentResponse]


class CreateCommentRequest(BaseModel):
    """Request schema for creating a comment."""
    content: str


class PostSearchParams(BaseModel):
    """Search parameters for community posts."""
    page: int = 1
    page_size: int = 20


# Debate schemas

class DebateAuthorResponse(BaseModel):
    """Author information for debates."""
    id: UUID
    name: str
    role: str | None = None
    avatar_url: str | None = None


class CommunityDebateResponse(BaseModel):
    """Community debate response schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    slug: str
    title: str
    category: str
    content: str
    created_at: datetime
    last_activity_at: datetime
    replies_count: int
    participants_count: int
    author: DebateAuthorResponse


class CommunityDebatesResponse(BaseModel):
    """Paginated community debates response."""
    debates: List[CommunityDebateResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CreateDebateRequest(BaseModel):
    """Request schema for creating a debate."""
    title: str = Field(..., min_length=5, max_length=200)
    category: str = Field(..., min_length=2, max_length=50)
    content: str = Field(..., min_length=10, max_length=10000)


class DebateReplyAuthorResponse(BaseModel):
    """Author information for debate replies."""
    id: UUID
    name: str
    role: str | None = None
    avatar_url: str | None = None


class CommunityDebateReplyResponse(BaseModel):
    """Community debate reply response schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    content: str
    created_at: datetime
    author: DebateReplyAuthorResponse


class CommunityDebateRepliesResponse(BaseModel):
    """Community debate replies response."""
    replies: List[CommunityDebateReplyResponse]


class CreateDebateReplyRequest(BaseModel):
    """Request schema for creating a debate reply."""
    content: str = Field(..., min_length=3, max_length=5000)


class DebateSearchParams(BaseModel):
    """Search parameters for community debates."""
    category: Optional[str] = Field(default=None, max_length=50)
    page: int = Field(default=1, ge=1, le=1000)
    page_size: int = Field(default=20, ge=1, le=100)