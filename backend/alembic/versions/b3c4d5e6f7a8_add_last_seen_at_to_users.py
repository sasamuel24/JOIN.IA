"""add_last_seen_at_to_users

Revision ID: b3c4d5e6f7a8
Revises: a2b3c4d5e6f7
Create Date: 2026-03-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, Sequence[str], None] = ('a2b3c4d5e6f7', 'a1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add last_seen_at column to users table."""
    op.add_column(
        'users',
        sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_users_last_seen_at', 'users', ['last_seen_at'], unique=False)


def downgrade() -> None:
    """Remove last_seen_at column from users table."""
    op.drop_index('ix_users_last_seen_at', table_name='users')
    op.drop_column('users', 'last_seen_at')
