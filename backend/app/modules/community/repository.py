from __future__ import annotations

import math
import re
from typing import List, Tuple

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.models.community_resource import CommunityResource
from app.models.community_post import CommunityPost
from app.models.community_post_comment import CommunityPostComment
from app.models.community_debate import CommunityDebate
from app.models.community_debate_reply import CommunityDebateReply


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
    """Get the total count of published community posts."""
    return db.query(CommunityPost).filter(
        CommunityPost.is_published.is_(True)
    ).count()


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


def get_posts_paginated(
    db: Session,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[CommunityPost], int]:
    """Get paginated list of published community posts with author data.
    
    Returns:
        Tuple of (posts_list, total_count)
    """
    query = db.query(CommunityPost).filter(
        CommunityPost.is_published.is_(True)
    ).options(joinedload(CommunityPost.author))
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply ordering: pinned first, then newest first
    query = query.order_by(
        CommunityPost.is_pinned.desc(),
        CommunityPost.created_at.desc()
    )
    
    # Apply pagination
    offset = (page - 1) * page_size
    posts = query.offset(offset).limit(page_size).all()
    
    return posts, total_count


def create_post(db: Session, user_id: str, content: str) -> CommunityPost:
    """Create a new community post."""
    post = CommunityPost(
        user_id=user_id,
        content=content,
        is_published=True,
        is_pinned=False
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_post_comments(db: Session, post_id: str) -> List[CommunityPostComment]:
    """Get all published comments for a post, ordered oldest first."""
    return db.query(CommunityPostComment).filter(
        CommunityPostComment.post_id == post_id,
        CommunityPostComment.is_published.is_(True)
    ).options(joinedload(CommunityPostComment.author)).order_by(
        CommunityPostComment.created_at.asc()
    ).all()


def create_comment(db: Session, post_id: str, user_id: str, content: str) -> CommunityPostComment:
    """Create a new comment on a post."""
    comment = CommunityPostComment(
        post_id=post_id,
        user_id=user_id,
        content=content,
        is_published=True
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_post_comments_count(db: Session, post_id: str) -> int:
    """Get count of published comments for a post."""
    return db.query(CommunityPostComment).filter(
        CommunityPostComment.post_id == post_id,
        CommunityPostComment.is_published.is_(True)
    ).count()


def get_post_by_id(db: Session, post_id: str) -> CommunityPost | None:
    """Get a post by ID if it's published."""
    return db.query(CommunityPost).filter(
        CommunityPost.id == post_id,
        CommunityPost.is_published.is_(True)
    ).first()


# Debate repository functions

def generate_debate_slug(title: str) -> str:
    """Generate a URL-friendly slug from a debate title."""
    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug[:100]  # Limit length


def get_debates_paginated(
    db: Session,
    category: str | None = None,
    page: int = 1,
    page_size: int = 20
) -> Tuple[List[CommunityDebate], int]:
    """Get paginated list of published community debates with author data.
    
    Returns:
        Tuple of (debates_list, total_count)
    """
    query = db.query(CommunityDebate).filter(
        CommunityDebate.is_published.is_(True)
    ).options(joinedload(CommunityDebate.author))
    
    # Apply category filter if provided
    if category:
        query = query.filter(CommunityDebate.category == category.strip())
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply ordering: featured first, then by last_activity_at desc, then created_at desc
    query = query.order_by(
        CommunityDebate.is_featured.desc(),
        CommunityDebate.last_activity_at.desc(),
        CommunityDebate.created_at.desc()
    )
    
    # Apply pagination
    offset = (page - 1) * page_size
    debates = query.offset(offset).limit(page_size).all()
    
    return debates, total_count


def create_debate(
    db: Session, 
    user_id: str, 
    title: str, 
    category: str, 
    content: str
) -> CommunityDebate:
    """Create a new community debate."""
    slug = generate_debate_slug(title)
    
    # Ensure slug uniqueness
    existing_count = db.query(CommunityDebate).filter(
        CommunityDebate.slug.like(f"{slug}%")
    ).count()
    
    if existing_count > 0:
        slug = f"{slug}-{existing_count + 1}"
    
    debate = CommunityDebate(
        slug=slug,
        title=title,
        category=category,
        content=content,
        created_by_user_id=user_id,
        is_published=True,
        is_featured=False
    )
    db.add(debate)
    db.commit()
    db.refresh(debate)
    return debate


def get_debate_by_id(db: Session, debate_id: str) -> CommunityDebate | None:
    """Get a debate by ID if it's published."""
    return db.query(CommunityDebate).filter(
        CommunityDebate.id == debate_id,
        CommunityDebate.is_published.is_(True)
    ).options(joinedload(CommunityDebate.author)).first()


def get_debate_replies(db: Session, debate_id: str) -> List[CommunityDebateReply]:
    """Get all published replies for a debate, ordered oldest first."""
    return db.query(CommunityDebateReply).filter(
        CommunityDebateReply.debate_id == debate_id,
        CommunityDebateReply.is_published.is_(True)
    ).options(joinedload(CommunityDebateReply.author)).order_by(
        CommunityDebateReply.created_at.asc()
    ).all()


def create_debate_reply(
    db: Session, 
    debate_id: str, 
    user_id: str, 
    content: str
) -> CommunityDebateReply:
    """Create a new reply on a debate and update debate's last_activity_at."""
    reply = CommunityDebateReply(
        debate_id=debate_id,
        user_id=user_id,
        content=content,
        is_published=True
    )
    db.add(reply)
    
    # Update the debate's last activity timestamp
    db.query(CommunityDebate).filter(
        CommunityDebate.id == debate_id
    ).update({
        CommunityDebate.last_activity_at: func.now()
    })
    
    db.commit()
    db.refresh(reply)
    return reply


def get_debate_replies_count(db: Session, debate_id: str) -> int:
    """Get count of published replies for a debate."""
    return db.query(CommunityDebateReply).filter(
        CommunityDebateReply.debate_id == debate_id,
        CommunityDebateReply.is_published.is_(True)
    ).count()


def get_debate_participants_count(db: Session, debate_id: str) -> int:
    """Get count of unique participants (reply authors) in a debate."""
    return db.query(CommunityDebateReply.user_id).filter(
        CommunityDebateReply.debate_id == debate_id,
        CommunityDebateReply.is_published.is_(True)
    ).distinct().count()