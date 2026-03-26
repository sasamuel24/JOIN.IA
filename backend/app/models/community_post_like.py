import uuid
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class CommunityPostLike(Base):
    __tablename__ = "community_post_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    post = relationship("CommunityPost", back_populates="likes")
    user = relationship("User", back_populates="post_likes")

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_community_post_likes_post_user"),
    )
