import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Author
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Content
    content = Column(Text, nullable=False)
    
    # Publication settings
    is_published = Column(Boolean, nullable=False, default=True)
    is_pinned = Column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    author = relationship("User", back_populates="community_posts")
    comments = relationship("CommunityPostComment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("CommunityPostLike", back_populates="post", cascade="all, delete-orphan")