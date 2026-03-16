import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class CommunityPostComment(Base):
    __tablename__ = "community_post_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Post reference
    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id"), nullable=False, index=True)
    
    # Author
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Content
    content = Column(Text, nullable=False)
    
    # Publication settings
    is_published = Column(Boolean, nullable=False, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User", back_populates="community_post_comments")