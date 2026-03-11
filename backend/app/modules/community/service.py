from __future__ import annotations

import math
from typing import List

from sqlalchemy.orm import Session

from app.modules.community import repository as community_repo
from app.modules.community.schemas import (
    CommunityMemberResponse,
    CommunityMembersResponse,
    CommunityResourceResponse,
    CommunityResourcesResponse,
    CommunityStatsResponse,
    MemberSearchParams,
    ResourceSearchParams,
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


def get_community_resources(
    db: Session, 
    search_params: ResourceSearchParams
) -> CommunityResourcesResponse:
    """Get paginated list of published community resources with optional filters."""
    resources, total_count = community_repo.get_community_resources_paginated(
        db=db,
        search=search_params.search,
        resource_type=search_params.type,
        category=search_params.category,
        page=search_params.page,
        page_size=search_params.page_size
    )
    
    # Convert CommunityResource models to response schema
    resource_responses = []
    for resource in resources:
        resource_response = CommunityResourceResponse(
            id=resource.id,
            title=resource.title,
            slug=resource.slug,
            description=resource.description,
            type=resource.resource_type,
            category=resource.category,
            thumbnail_url=resource.thumbnail_url,
            resource_url=resource.resource_url,
            author_name=resource.author_name,
            is_featured=resource.is_featured,
            published_at=resource.published_at
        )
        resource_responses.append(resource_response)
    
    # Calculate pagination metadata
    total_pages = math.ceil(total_count / search_params.page_size) if total_count > 0 else 0
    
    return CommunityResourcesResponse(
        resources=resource_responses,
        total=total_count,
        page=search_params.page,
        page_size=search_params.page_size,
        total_pages=total_pages
    )