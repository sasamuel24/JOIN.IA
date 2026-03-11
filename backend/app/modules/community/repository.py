from __future__ import annotations

import math
from typing import List, Tuple

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.community_resource import CommunityResource


def get_active_users_count(db: Session) -> int:
    """Get the count of active users in the community."""
    return db.query(User).filter(
        User.is_active.is_(True),
        User.full_name.is_not(None)  # Only users with names are considered community members
    ).count()


def get_community_members_paginated(
    db: Session, 
    search: str | None = None,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[User], int]:
    """Get paginated list of community members with optional search.
    
    Returns:
        Tuple of (users_list, total_count)
    """
    query = db.query(User).filter(
        User.is_active.is_(True),
        User.full_name.is_not(None)  # Only users with names
    )
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            User.full_name.ilike(search_term) |
            User.title.ilike(search_term) |
            User.company.ilike(search_term)
        )
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()
    
    return users, total_count


def get_posts_placeholder_count(db: Session) -> int:
    """Placeholder for posts count. Returns 0 for now."""
    return 0


def get_active_now_placeholder_count(db: Session) -> int:
    """Placeholder for currently active users count. Returns 0 for now."""
    return 0


def get_community_resources_paginated(
    db: Session,
    search: str | None = None,
    resource_type: str | None = None,
    category: str | None = None,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[CommunityResource], int]:
    """Get paginated list of published community resources with optional filters.
    
    Returns:
        Tuple of (resources_list, total_count)
    """
    query = db.query(CommunityResource).filter(
        CommunityResource.is_published.is_(True)
    )
    
    # Apply search filter if provided
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                CommunityResource.title.ilike(search_term),
                CommunityResource.description.ilike(search_term),
                CommunityResource.author_name.ilike(search_term)
            )
        )
    
    # Apply type filter if provided
    if resource_type:
        query = query.filter(CommunityResource.resource_type == resource_type.strip())
    
    # Apply category filter if provided
    if category:
        query = query.filter(CommunityResource.category == category.strip())
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply ordering: featured first, then by published_at desc (newest first)
    query = query.order_by(
        CommunityResource.is_featured.desc(),
        CommunityResource.published_at.desc().nullslast(),
        CommunityResource.created_at.desc()
    )
    
    # Apply pagination
    offset = (page - 1) * page_size
    resources = query.offset(offset).limit(page_size).all()
    
    return resources, total_count