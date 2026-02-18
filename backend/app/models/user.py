from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.db import engine
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)

    hashed_password = Column(String, nullable=True)  # null para Google users
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    provider = Column(String, default="local")  # local | google
    provider_id = Column(String, nullable=True)  # id de Google

    created_at = Column(DateTime(timezone=True), server_default=func.now())
