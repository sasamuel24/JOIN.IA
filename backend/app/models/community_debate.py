import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class CommunityDebate(Base):
    __tablename__ = "community_debates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Content
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    
    # Author
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Publication settings
    is_published = Column(Boolean, nullable=False, default=True)
    is_featured = Column(Boolean, nullable=False, default=False)
    
    # Activity tracking
    last_activity_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    author = relationship("User", back_populates="community_debates")
    replies = relationship("CommunityDebateReply", back_populates="debate", cascade="all, delete-orphan")