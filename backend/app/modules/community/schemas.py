from datetime import datetime
from uuid import UUID
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


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