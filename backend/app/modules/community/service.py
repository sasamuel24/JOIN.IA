from __future__ import annotations

import math
from typing import List

from sqlalchemy.orm import Session

from app.modules.community import repository as community_repo
from app.modules.community.schemas import (
    CommunityMemberResponse,
    CommunityMembersResponse,
    CommunityPostCommentResponse,
    CommunityPostCommentsResponse,
    CommunityPostResponse,
    CommunityPostsResponse,
    CommunityResourceResponse,
    CommunityResourcesResponse,
    CommunityStatsResponse,
    CommentAuthorResponse,
    CreateCommentRequest,
    CreatePostRequest,
    MemberSearchParams,
    PostAuthorResponse,
    PostLikeResponse,
    PostSearchParams,
    ResourceSearchParams,
    DebateAuthorResponse,
    CommunityDebateResponse,
    CommunityDebatesResponse,
    CreateDebateRequest,
    DebateReplyAuthorResponse,
    CommunityDebateReplyResponse,
    CommunityDebateRepliesResponse,
    CreateDebateReplyRequest,
    DebateSearchParams,
)


def get_community_stats(db: Session) -> CommunityStatsResponse:
    """Get community statistics for the dashboard header."""
    miembros_count = community_repo.get_active_users_count(db)
    posts_count = community_repo.get_posts_placeholder_count(db)
    activos_ahora_count = community_repo.get_active_now_count(db)
    
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
            avatar_url=user.avatar_url,
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


def get_feed_posts(
    db: Session,
    search_params: PostSearchParams,
    current_user_id: str | None = None,
) -> CommunityPostsResponse:
    """Get paginated list of community posts with comments count and likes."""
    posts, total_count = community_repo.get_posts_paginated(
        db=db,
        page=search_params.page,
        page_size=search_params.page_size
    )

    # Convert CommunityPost models to response schema
    post_responses = []
    for post in posts:
        post_id = str(post.id)
        comments_count = community_repo.get_post_comments_count(db, post_id)
        likes_count = community_repo.get_post_likes_count(db, post_id)
        is_liked_by_me = (
            community_repo.user_has_liked_post(db, post_id, current_user_id)
            if current_user_id else False
        )

        author = PostAuthorResponse(
            id=post.author.id,
            name=post.author.full_name or "Usuario Anónimo",
            role=post.author.title,
            avatar_url=post.author.avatar_url
        )

        post_response = CommunityPostResponse(
            id=post.id,
            content=post.content,
            created_at=post.created_at,
            comments_count=comments_count,
            likes_count=likes_count,
            is_liked_by_me=is_liked_by_me,
            author=author
        )
        post_responses.append(post_response)

    total_pages = math.ceil(total_count / search_params.page_size) if total_count > 0 else 0

    return CommunityPostsResponse(
        posts=post_responses,
        total=total_count,
        page=search_params.page,
        page_size=search_params.page_size,
        total_pages=total_pages
    )


def create_feed_post(
    db: Session,
    user_id: str,
    request: CreatePostRequest
) -> CommunityPostResponse:
    """Create a new community feed post."""
    from app.services.email_service import notify_new_feed_post

    # Create the post
    post = community_repo.create_post(db, user_id, request.content)

    # Build author response
    author = PostAuthorResponse(
        id=post.author.id,
        name=post.author.full_name or "Usuario Anónimo",
        role=post.author.title,
        avatar_url=post.author.avatar_url
    )

    # Notify via N8N (fire-and-forget, never blocks the response)
    try:
        recipients = community_repo.get_all_active_user_emails(db)
        notify_new_feed_post(
            author_name=post.author.full_name or "Usuario Anónimo",
            author_email=post.author.email,
            content=request.content,
            recipients=recipients,
        )
    except Exception:
        pass

    return CommunityPostResponse(
        id=post.id,
        content=post.content,
        created_at=post.created_at,
        comments_count=0,
        likes_count=0,
        is_liked_by_me=False,
        author=author
    )


def toggle_post_like(
    db: Session,
    post_id: str,
    user_id: str,
) -> PostLikeResponse:
    """Toggle like on a post for the given user."""
    post = community_repo.get_post_by_id(db, post_id)
    if not post:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Post not found")

    likes_count, is_liked_by_me = community_repo.toggle_post_like(db, post_id, user_id)
    return PostLikeResponse(likes_count=likes_count, is_liked_by_me=is_liked_by_me)


def get_post_comments(
    db: Session,
    post_id: str
) -> CommunityPostCommentsResponse:
    """Get all comments for a post."""
    comments = community_repo.get_post_comments(db, post_id)
    
    # Convert CommunityPostComment models to response schema
    comment_responses = []
    for comment in comments:
        # Build author response
        author = CommentAuthorResponse(
            id=comment.author.id,
            name=comment.author.full_name or "Usuario Anónimo",
            role=comment.author.title,
            avatar_url=comment.author.avatar_url
        )
        
        comment_response = CommunityPostCommentResponse(
            id=comment.id,
            content=comment.content,
            created_at=comment.created_at,
            author=author
        )
        comment_responses.append(comment_response)
    
    return CommunityPostCommentsResponse(
        comments=comment_responses
    )


def create_post_comment(
    db: Session, 
    post_id: str,
    user_id: str,
    request: CreateCommentRequest
) -> CommunityPostCommentResponse:
    """Create a new comment on a post."""
    # Verify the post exists and is published
    post = community_repo.get_post_by_id(db, post_id)
    if not post:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Create the comment
    comment = community_repo.create_comment(db, post_id, user_id, request.content)
    
    # Build author response
    author = CommentAuthorResponse(
        id=comment.author.id,
        name=comment.author.full_name or "Usuario Anónimo",
        role=comment.author.title,
        avatar_url=comment.author.avatar_url
    )
    
    return CommunityPostCommentResponse(
        id=comment.id,
        content=comment.content,
        created_at=comment.created_at,
        author=author
    )


# Debate service functions

def get_community_debates(
    db: Session, 
    search_params: DebateSearchParams
) -> CommunityDebatesResponse:
    """Get paginated list of community debates with replies and participants count."""
    debates, total_count = community_repo.get_debates_paginated(
        db=db,
        category=search_params.category,
        page=search_params.page,
        page_size=search_params.page_size
    )
    
    # Convert CommunityDebate models to response schema
    debate_responses = []
    for debate in debates:
        # Get replies count and participants count for this debate
        replies_count = community_repo.get_debate_replies_count(db, str(debate.id))
        participants_count = community_repo.get_debate_participants_count(db, str(debate.id))
        
        # Build author response
        author = DebateAuthorResponse(
            id=debate.author.id,
            name=debate.author.full_name or "Usuario Anónimo",
            role=debate.author.title,
            avatar_url=debate.author.avatar_url
        )
        
        debate_response = CommunityDebateResponse(
            id=debate.id,
            slug=debate.slug,
            title=debate.title,
            category=debate.category,
            content=debate.content,
            created_at=debate.created_at,
            last_activity_at=debate.last_activity_at,
            replies_count=replies_count,
            participants_count=participants_count,
            author=author
        )
        debate_responses.append(debate_response)
    
    # Calculate pagination metadata
    total_pages = math.ceil(total_count / search_params.page_size) if total_count > 0 else 0
    
    return CommunityDebatesResponse(
        debates=debate_responses,
        total=total_count,
        page=search_params.page,
        page_size=search_params.page_size,
        total_pages=total_pages
    )


def create_community_debate(
    db: Session, 
    user_id: str,
    request: CreateDebateRequest
) -> CommunityDebateResponse:
    """Create a new community debate."""
    # Create the debate
    debate = community_repo.create_debate(
        db, 
        user_id, 
        request.title, 
        request.category, 
        request.content
    )
    
    # Build author response
    author = DebateAuthorResponse(
        id=debate.author.id,
        name=debate.author.full_name or "Usuario Anónimo",
        role=debate.author.title,
        avatar_url=debate.author.avatar_url
    )
    
    return CommunityDebateResponse(
        id=debate.id,
        slug=debate.slug,
        title=debate.title,
        category=debate.category,
        content=debate.content,
        created_at=debate.created_at,
        last_activity_at=debate.last_activity_at,
        replies_count=0,  # New debates have no replies
        participants_count=0,  # New debates have no participants
        author=author
    )


def get_community_debate_detail(
    db: Session, 
    debate_id: str
) -> CommunityDebateResponse:
    """Get a single debate by ID."""
    debate = community_repo.get_debate_by_id(db, debate_id)
    if not debate:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Debate not found")
    
    # Get replies count and participants count for this debate
    replies_count = community_repo.get_debate_replies_count(db, str(debate.id))
    participants_count = community_repo.get_debate_participants_count(db, str(debate.id))
    
    # Build author response
    author = DebateAuthorResponse(
        id=debate.author.id,
        name=debate.author.full_name or "Usuario Anónimo",
        role=debate.author.title,
        avatar_url=debate.author.avatar_url
    )
    
    return CommunityDebateResponse(
        id=debate.id,
        slug=debate.slug,
        title=debate.title,
        category=debate.category,
        content=debate.content,
        created_at=debate.created_at,
        last_activity_at=debate.last_activity_at,
        replies_count=replies_count,
        participants_count=participants_count,
        author=author
    )


def get_community_debate_replies(
    db: Session, 
    debate_id: str
) -> CommunityDebateRepliesResponse:
    """Get all replies for a debate."""
    replies = community_repo.get_debate_replies(db, debate_id)
    
    # Convert CommunityDebateReply models to response schema
    reply_responses = []
    for reply in replies:
        # Build author response
        author = DebateReplyAuthorResponse(
            id=reply.author.id,
            name=reply.author.full_name or "Usuario Anónimo",
            role=reply.author.title,
            avatar_url=reply.author.avatar_url
        )
        
        reply_response = CommunityDebateReplyResponse(
            id=reply.id,
            content=reply.content,
            created_at=reply.created_at,
            author=author
        )
        reply_responses.append(reply_response)
    
    return CommunityDebateRepliesResponse(
        replies=reply_responses
    )


def create_community_debate_reply(
    db: Session, 
    debate_id: str,
    user_id: str,
    request: CreateDebateReplyRequest
) -> CommunityDebateReplyResponse:
    """Create a new reply on a debate."""
    # Verify the debate exists and is published
    debate = community_repo.get_debate_by_id(db, debate_id)
    if not debate:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Debate not found")
    
    # Create the reply (this also updates the debate's last_activity_at)
    reply = community_repo.create_debate_reply(db, debate_id, user_id, request.content)
    
    # Build author response
    author = DebateReplyAuthorResponse(
        id=reply.author.id,
        name=reply.author.full_name or "Usuario Anónimo",
        role=reply.author.title,
        avatar_url=reply.author.avatar_url
    )
    
    return CommunityDebateReplyResponse(
        id=reply.id,
        content=reply.content,
        created_at=reply.created_at,
        author=author
    )