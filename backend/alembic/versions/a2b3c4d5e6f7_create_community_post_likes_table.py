"""create_community_post_likes_table

Revision ID: a2b3c4d5e6f7
Revises: 8bea5301f316
Create Date: 2026-03-26 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = '8bea5301f316'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'community_post_likes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('post_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['community_posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('post_id', 'user_id', name='uq_community_post_likes_post_user'),
    )
    op.create_index(op.f('ix_community_post_likes_post_id'), 'community_post_likes', ['post_id'], unique=False)
    op.create_index(op.f('ix_community_post_likes_user_id'), 'community_post_likes', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_community_post_likes_user_id'), table_name='community_post_likes')
    op.drop_index(op.f('ix_community_post_likes_post_id'), table_name='community_post_likes')
    op.drop_table('community_post_likes')
