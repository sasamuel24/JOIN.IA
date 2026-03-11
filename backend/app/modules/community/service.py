from __future__ import annotations

import math
from typing import List

from sqlalchemy.orm import Session

from app.modules.community import repository as community_repo
from app.modules.community.schemas import (
    CommunityMemberResponse,
    CommunityMembersResponse,
    CommunityStatsResponse,
    MemberSearchParams,
)


def get_community_stats(db: Session) -> CommunityStatsResponse:
    """Get community statistics for the dashboard header."""
    miembros_count = community_repo.get_active_users_count(db)
    posts_count = community_repo.get_posts_placeholder_count(db)
    activos_ahora_count = community_repo.get_active_now_placeholder_count(db)
    
    return CommunityStatsResponse(
        miembros=miembros_count,
        posts=posts_count,
        activosAhora=activos_ahora_count
    )


def get_community_members(
    db: Session, 
    search_params: MemberSearchParams
) -> CommunityMembersResponse:
    """Get paginated list of community members with optional search."""
    users, total_count = community_repo.get_community_members_paginated(
        db=db,
        search=search_params.search,
        page=search_params.page,
        page_size=search_params.page_size
    )
    
    # Convert User models to response schema
    members = []
    for user in users:
        member = CommunityMemberResponse(
            id=user.id,
            name=user.full_name or "Usuario Anónimo",
            role=user.title,
            avatar_url=None,  # Placeholder - no avatar_url field in current User model
            joined_at=user.created_at
        )
        members.append(member)
    
    # Calculate pagination metadata
    total_pages = math.ceil(total_count / search_params.page_size) if total_count > 0 else 0
    
    return CommunityMembersResponse(
        members=members,
        total=total_count,
        page=search_params.page,
        page_size=search_params.page_size,
        total_pages=total_pages
    )