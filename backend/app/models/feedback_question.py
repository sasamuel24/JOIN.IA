import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class FeedbackQuestion(Base):
    __tablename__ = "feedback_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    form_id = Column(
        UUID(as_uuid=True),
        ForeignKey("feedback_forms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    step_order = Column(Integer, nullable=False)
    question_key = Column(String(120), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(32), nullable=False)  # single_choice | multi_choice | scale | text
    help_text = Column(Text, nullable=True)
    placeholder = Column(String(255), nullable=True)
    is_required = Column(Boolean, nullable=False, default=True)
    allow_other_text = Column(Boolean, nullable=False, default=False)
    min_value = Column(Integer, nullable=True)
    max_value = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    __table_args__ = (
        UniqueConstraint("form_id", "question_key", name="uq_feedback_questions_form_key"),
    )

    form = relationship("FeedbackForm", back_populates="questions")
    options = relationship("FeedbackOption", back_populates="question", order_by="FeedbackOption.sort_order")
    answers = relationship("FeedbackAnswer", back_populates="question")
