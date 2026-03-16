import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import Base


class FeedbackAnswer(Base):
    __tablename__ = "feedback_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("feedback_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id = Column(
        UUID(as_uuid=True),
        ForeignKey("feedback_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    answer_text = Column(Text, nullable=True)
    answer_number = Column(Integer, nullable=True)
    answer_json = Column(JSON, nullable=True)
    other_text = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)

    __table_args__ = (
        UniqueConstraint("submission_id", "question_id", name="uq_feedback_answers_submission_question"),
    )

    submission = relationship("FeedbackSubmission", back_populates="answers")
    question = relationship("FeedbackQuestion", back_populates="answers")
