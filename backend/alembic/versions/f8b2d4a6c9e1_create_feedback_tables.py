"""create_feedback_tables

Revision ID: f8b2d4a6c9e1
Revises: e1a2b3c4d5e6
Create Date: 2026-02-28 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f8b2d4a6c9e1"
down_revision: Union[str, Sequence[str], None] = "e1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- feedback_forms ---
    op.create_table(
        "feedback_forms",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(120), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("version", sa.Integer, nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_feedback_forms_slug", "feedback_forms", ["slug"], unique=True)
    op.create_unique_constraint("uq_feedback_forms_slug_version", "feedback_forms", ["slug", "version"])

    # --- feedback_questions ---
    op.create_table(
        "feedback_questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("form_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feedback_forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("step_order", sa.Integer, nullable=False),
        sa.Column("question_key", sa.String(120), nullable=False),
        sa.Column("question_text", sa.Text, nullable=False),
        sa.Column("question_type", sa.String(32), nullable=False),
        sa.Column("help_text", sa.Text, nullable=True),
        sa.Column("placeholder", sa.String(255), nullable=True),
        sa.Column("is_required", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("allow_other_text", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("min_value", sa.Integer, nullable=True),
        sa.Column("max_value", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_feedback_questions_form_id", "feedback_questions", ["form_id"])
    op.create_unique_constraint("uq_feedback_questions_form_key", "feedback_questions", ["form_id", "question_key"])

    # --- feedback_question_options ---
    op.create_table(
        "feedback_question_options",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feedback_questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("value", sa.String(120), nullable=False),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("is_other_option", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_feedback_question_options_question_id", "feedback_question_options", ["question_id"])

    # --- feedback_submissions ---
    op.create_table(
        "feedback_submissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("form_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feedback_forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_feedback_submissions_user_id", "feedback_submissions", ["user_id"])
    op.create_index("ix_feedback_submissions_form_id", "feedback_submissions", ["form_id"])
    op.create_unique_constraint("uq_feedback_submissions_user_form", "feedback_submissions", ["user_id", "form_id"])

    # --- feedback_answers ---
    op.create_table(
        "feedback_answers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("submission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feedback_submissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("feedback_questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("answer_text", sa.Text, nullable=True),
        sa.Column("answer_number", sa.Integer, nullable=True),
        sa.Column("answer_json", postgresql.JSON, nullable=True),
        sa.Column("other_text", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_feedback_answers_submission_id", "feedback_answers", ["submission_id"])
    op.create_index("ix_feedback_answers_question_id", "feedback_answers", ["question_id"])
    op.create_unique_constraint("uq_feedback_answers_submission_question", "feedback_answers", ["submission_id", "question_id"])


def downgrade() -> None:
    op.drop_table("feedback_answers")
    op.drop_table("feedback_submissions")
    op.drop_table("feedback_question_options")
    op.drop_table("feedback_questions")
    op.drop_table("feedback_forms")
