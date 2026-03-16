"""Invitation model for Early Access gating.

Uniqueness:
- (inviter_user_id, invited_email): same inviter cannot invite same email twice.
- Partial unique on invited_email WHERE status = 'pending': only one pending
  invitation per email globally (first inviter wins; avoids multiple claims).
"""
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.models.base import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inviter_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    invited_email = Column(String(255), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="pending")  # pending | accepted | cancelled
    token = Column(String(64), nullable=True, unique=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    accepted_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint("inviter_user_id", "invited_email", name="uq_invitations_inviter_email"),
    )
