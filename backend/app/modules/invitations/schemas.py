from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class InvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    inviter_user_id: UUID
    invited_email: str
    status: str
    token: str | None = None
    created_at: datetime
    updated_at: datetime | None = None
    accepted_at: datetime | None = None
    accepted_user_id: UUID | None = None


class InvitationStats(BaseModel):
    invited_count: int
    accepted_count: int
    remaining: int  # 5 - accepted_count, min 0


class InvitationsListResponse(BaseModel):
    items: list[InvitationResponse]
    stats: InvitationStats


class CreateInvitationRequest(BaseModel):
    email: EmailStr
