from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FeedbackOptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    label: str
    value: str
    sort_order: int
    is_other_option: bool


class FeedbackQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    step_order: int
    question_key: str
    question_text: str
    question_type: str
    help_text: str | None = None
    placeholder: str | None = None
    is_required: bool
    allow_other_text: bool
    min_value: int | None = None
    max_value: int | None = None
    options: list[FeedbackOptionResponse] = []


class FeedbackFormResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    description: str | None = None
    version: int
    questions: list[FeedbackQuestionResponse] = []
