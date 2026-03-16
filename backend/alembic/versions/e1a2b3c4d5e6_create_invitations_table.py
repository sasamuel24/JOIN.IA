"""create_invitations_table

Revision ID: e1a2b3c4d5e6
Revises: 15c9773f0bf9
Create Date: 2026-03-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "e1a2b3c4d5e6"
down_revision: Union[str, Sequence[str], None] = "15c9773f0bf9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "invitations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("inviter_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("invited_email", sa.String(255), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("token", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("accepted_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["accepted_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["inviter_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("inviter_user_id", "invited_email", name="uq_invitations_inviter_email"),
    )
    op.create_index(op.f("ix_invitations_inviter_user_id"), "invitations", ["inviter_user_id"], unique=False)
    op.create_index(op.f("ix_invitations_invited_email"), "invitations", ["invited_email"], unique=False)
    op.create_index(op.f("ix_invitations_token"), "invitations", ["token"], unique=True)
    # Only one pending invitation per email globally (first inviter wins).
    op.create_index(
        "ix_invitations_invited_email_pending",
        "invitations",
        ["invited_email"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )


def downgrade() -> None:
    op.drop_index("ix_invitations_invited_email_pending", table_name="invitations")
    op.drop_index(op.f("ix_invitations_token"), table_name="invitations")
    op.drop_index(op.f("ix_invitations_invited_email"), table_name="invitations")
    op.drop_index(op.f("ix_invitations_inviter_user_id"), table_name="invitations")
    op.drop_table("invitations")
