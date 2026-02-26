from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    title: str | None = None
    bio: str | None = None
    company: str | None = None
    industry: str | None = None
    team_size: str | None = None
    country: str | None = None
    pain_points: list[str] | None = None
    notif_product: bool | None = True
    notif_community: bool | None = False
    notif_feedback: bool | None = None
    group: str | None = None
    access_tier: str | None = None
    provider: str = "local"
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime | None = None


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    title: str | None = None
    bio: str | None = None
    company: str | None = None
    industry: str | None = None
    team_size: str | None = None
    country: str | None = None
    pain_points: list[str] | None = None
    notif_product: bool | None = None
    notif_community: bool | None = None
    notif_feedback: bool | None = None
    group: str | None = None
    access_tier: str | None = None
