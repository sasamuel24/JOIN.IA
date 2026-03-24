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


# ---------------------------------------------------------------------------
# Admin: Debates CRUD
# ---------------------------------------------------------------------------

def admin_get_all_debates(db: Session) -> Tuple[List[CommunityDebate], int]:
    """Admin: Get all debates (published and unpublished) ordered by created_at desc."""
    query = db.query(CommunityDebate).options(joinedload(CommunityDebate.author))
    total = query.count()
    debates = query.order_by(CommunityDebate.is_featured.desc(), CommunityDebate.created_at.desc()).all()
    return debates, total


def admin_get_debate_by_id(db: Session, debate_id: str) -> CommunityDebate | None:
    """Admin: Get any debate by ID regardless of published status."""
    return db.query(CommunityDebate).filter(
        CommunityDebate.id == debate_id
    ).options(joinedload(CommunityDebate.author)).first()


def admin_create_debate(
    db: Session,
    user_id: str,
    title: str,
    category: str,
    content: str,
    is_featured: bool = False
) -> CommunityDebate:
    """Admin: Create a debate with optional featured flag."""
    slug = generate_debate_slug(title)
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
        is_featured=is_featured
    )
    db.add(debate)
    db.commit()
    db.refresh(debate)
    return debate


def admin_update_debate(
    db: Session,
    debate_id: str,
    title: str | None = None,
    content: str | None = None,
    category: str | None = None,
    is_featured: bool | None = None
) -> CommunityDebate | None:
    """Admin: Update debate fields."""
    debate = admin_get_debate_by_id(db, debate_id)
    if not debate:
        return None
    if title is not None:
        debate.title = title
    if content is not None:
        debate.content = content
    if category is not None:
        debate.category = category
    if is_featured is not None:
        debate.is_featured = is_featured
    db.commit()
    db.refresh(debate)
    return debate


def admin_delete_debate(db: Session, debate_id: str) -> bool:
    """Admin: Delete a debate and all its replies (cascade)."""
    debate = admin_get_debate_by_id(db, debate_id)
    if not debate:
        return False
    db.delete(debate)
    db.commit()
    return True


def admin_toggle_debate_featured(db: Session, debate_id: str) -> CommunityDebate | None:
    """Admin: Toggle is_featured on a debate."""
    debate = admin_get_debate_by_id(db, debate_id)
    if not debate:
        return None
    debate.is_featured = not debate.is_featured
    db.commit()
    db.refresh(debate)
    return debate


def admin_get_debates_stats(db: Session) -> dict:
    """Admin: Get debates statistics."""
    total = db.query(CommunityDebate).count()
    featured = db.query(CommunityDebate).filter(CommunityDebate.is_featured.is_(True)).count()
    con_respuestas = db.query(CommunityDebate).join(
        CommunityDebateReply, CommunityDebateReply.debate_id == CommunityDebate.id
    ).distinct().count()
    return {"total": total, "featured": featured, "con_respuestas": con_respuestas}


# ---------------------------------------------------------------------------
# Admin: Resources CRUD
# ---------------------------------------------------------------------------

def admin_get_all_resources(db: Session) -> Tuple[List[CommunityResource], int]:
    """Admin: Get all resources ordered by is_featured desc, created_at desc."""
    query = db.query(CommunityResource)
    total = query.count()
    resources = query.order_by(
        CommunityResource.is_featured.desc(),
        CommunityResource.created_at.desc()
    ).all()
    return resources, total


def admin_get_resource_by_id(db: Session, resource_id: str) -> CommunityResource | None:
    """Admin: Get any resource by ID."""
    return db.query(CommunityResource).filter(CommunityResource.id == resource_id).first()


def admin_create_resource(
    db: Session,
    user_id: str,
    title: str,
    description: str,
    resource_type: str,
    category: str | None = None,
    resource_url: str | None = None,
    thumbnail_url: str | None = None,
    author_name: str | None = None,
    is_featured: bool = False,
    is_published: bool = True
) -> CommunityResource:
    """Admin: Create a new resource."""
    import re as re_module
    from datetime import timezone

    slug_base = re_module.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    slug_base = re_module.sub(r'\s+', '-', slug_base.strip())[:80]

    existing = db.query(CommunityResource).filter(
        CommunityResource.slug.like(f"{slug_base}%")
    ).count()
    slug = f"{slug_base}-{existing + 1}" if existing > 0 else slug_base

    from datetime import datetime
    resource = CommunityResource(
        title=title,
        slug=slug,
        description=description,
        resource_type=resource_type,
        category=category,
        resource_url=resource_url,
        thumbnail_url=thumbnail_url,
        author_name=author_name,
        created_by_user_id=user_id,
        is_featured=is_featured,
        is_published=is_published,
        published_at=datetime.now(timezone.utc) if is_published else None
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


def admin_update_resource(
    db: Session,
    resource_id: str,
    title: str | None = None,
    description: str | None = None,
    resource_type: str | None = None,
    category: str | None = None,
    resource_url: str | None = None,
    thumbnail_url: str | None = None,
    author_name: str | None = None,
    is_featured: bool | None = None,
    is_published: bool | None = None
) -> CommunityResource | None:
    """Admin: Update resource fields."""
    resource = admin_get_resource_by_id(db, resource_id)
    if not resource:
        return None
    if title is not None:
        resource.title = title
    if description is not None:
        resource.description = description
    if resource_type is not None:
        resource.resource_type = resource_type
    if category is not None:
        resource.category = category
    if resource_url is not None:
        resource.resource_url = resource_url
    if thumbnail_url is not None:
        resource.thumbnail_url = thumbnail_url
    if author_name is not None:
        resource.author_name = author_name
    if is_featured is not None:
        resource.is_featured = is_featured
    if is_published is not None:
        from datetime import datetime, timezone
        resource.is_published = is_published
        if is_published and not resource.published_at:
            resource.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(resource)
    return resource


def admin_delete_resource(db: Session, resource_id: str) -> bool:
    """Admin: Delete a resource."""
    resource = admin_get_resource_by_id(db, resource_id)
    if not resource:
        return False
    db.delete(resource)
    db.commit()
    return True


def admin_toggle_resource_featured(db: Session, resource_id: str) -> CommunityResource | None:
    """Admin: Toggle is_featured on a resource."""
    resource = admin_get_resource_by_id(db, resource_id)
    if not resource:
        return None
    resource.is_featured = not resource.is_featured
    db.commit()
    db.refresh(resource)
    return resource


def admin_get_resources_stats(db: Session) -> dict:
    """Admin: Get resources statistics."""
    from sqlalchemy import func as sql_func
    total = db.query(CommunityResource).count()
    featured = db.query(CommunityResource).filter(CommunityResource.is_featured.is_(True)).count()
    published = db.query(CommunityResource).filter(CommunityResource.is_published.is_(True)).count()

    por_tipo_rows = db.query(
        CommunityResource.resource_type,
        sql_func.count(CommunityResource.id).label("count")
    ).group_by(CommunityResource.resource_type).all()
    por_tipo = [{"tipo": row.resource_type, "count": row.count} for row in por_tipo_rows]

    return {"total": total, "featured": featured, "published": published, "por_tipo": por_tipo}
