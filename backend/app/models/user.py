import uuid

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)

    hashed_password = Column(String, nullable=True)  # null para Google users
    is_active = Column(Boolean, nullable=True)
    is_verified = Column(Boolean, nullable=True)

    provider = Column(String, nullable=True)  # local | google
    provider_id = Column(String, nullable=True)  # id de Google

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    # Profile fields
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    title = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    company = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    team_size = Column(String, nullable=True)
    country = Column(String, nullable=True)

    # varchar[]
    pain_points = Column(ARRAY(String), nullable=True)

    # Notifications
    notif_product = Column(Boolean, nullable=True)
    notif_community = Column(Boolean, nullable=True)
    notif_feedback = Column(Boolean, nullable=True)

    # "group" es palabra reservada -> atributo Python distinto
    group = Column("group", String, nullable=True)

    access_tier = Column(String, nullable=True)

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)