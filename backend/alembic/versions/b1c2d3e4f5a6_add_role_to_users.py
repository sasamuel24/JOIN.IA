"""add role to users

Revision ID: b1c2d3e4f5a6
Revises: 8bea5301f316
Create Date: 2026-03-14

"""
from alembic import op
import sqlalchemy as sa

revision = 'b1c2d3e4f5a6'
down_revision = '8bea5301f316'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('role', sa.String(), nullable=False, server_default='user'),
    )


def downgrade() -> None:
    op.drop_column('users', 'role')
