import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.models.base import Base


class CommunityResource(Base):
    __tablename__ = "community_resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Content fields
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    content = Column(Text, nullable=True)
    
    # Resource type and categorization
    resource_type = Column(String, nullable=False)  # guide, template, video, article, tool
    category = Column(String, nullable=True)
    
    # Media and links
    thumbnail_url = Column(String, nullable=True)
    resource_url = Column(String, nullable=True)
    
    # Author information
    author_name = Column(String, nullable=True)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Publication settings
    is_published = Column(Boolean, nullable=False, default=False)
    is_featured = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)