from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Form / Question / Option  (read-only, unchanged)
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Answer
# ---------------------------------------------------------------------------

class FeedbackAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question_id: UUID
    answer_text: str | None = None
    answer_number: int | None = None
    answer_json: Any | None = None
    other_text: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class FeedbackAnswerInput(BaseModel):
    question_id: UUID
    answer_text: str | None = None
    answer_number: int | None = None
    answer_json: Any | None = None
    other_text: str | None = None


# ---------------------------------------------------------------------------
# Submission
# ---------------------------------------------------------------------------

class FeedbackSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    form_id: UUID
    status: str
    started_at: datetime
    submitted_at: datetime | None = None
    answers: list[FeedbackAnswerResponse] = []


class FeedbackSubmissionUpdateRequest(BaseModel):
    answers: list[FeedbackAnswerInput]


class FeedbackSubmitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    form_id: UUID
    status: str
    started_at: datetime
    submitted_at: datetime | None = None
    answers: list[FeedbackAnswerResponse] = []


# ---------------------------------------------------------------------------
# Community Stats (public)
# ---------------------------------------------------------------------------

class PainPointStat(BaseModel):
    label: str
    pct: int


class Testimonio(BaseModel):
    quote: str
    author: str


class CommunityStatsResponse(BaseModel):
    total: int
    top_pain_points: list[PainPointStat]
    testimonios: list[Testimonio]
