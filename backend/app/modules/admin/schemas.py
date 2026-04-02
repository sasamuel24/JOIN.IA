from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class AdminUserItem(BaseModel):
    id: str
    name: str
    email: str
    role: str
    group: str | None
    access_tier: str | None
    created_at: datetime
    feedback_completed: bool
    invitations_sent: int
    status: str  # activo | inactivo


class PorGrupo(BaseModel):
    grupo: str
    count: int


class PorTier(BaseModel):
    tier: str
    count: int


class AdminUsersStats(BaseModel):
    total: int
    activos: int
    nuevos_semana: int
    con_feedback: int
    por_grupo: list[PorGrupo]
    por_tier: list[PorTier]


class AdminUsersListResponse(BaseModel):
    items: list[AdminUserItem]
    total: int


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

class AdminFeedbackEntry(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_email: str
    rol: str
    desgastes: list[str]
    impacto: int | None
    solucion_actual: str
    herramientas: list[str]
    vision_ia: str
    resultados_deseados: list[str]
    created_at: datetime


class TopItem(BaseModel):
    label: str
    count: int


class PorRol(BaseModel):
    rol: str
    count: int


class AdminFeedbackStats(BaseModel):
    total: int
    promedio_impacto: float
    top_desgastes: list[TopItem]
    top_herramientas: list[TopItem]
    por_rol: list[PorRol]
    top_resultados: list[TopItem]


class AdminFeedbackListResponse(BaseModel):
    items: list[AdminFeedbackEntry]
    total: int


# ---------------------------------------------------------------------------
# Invitations
# ---------------------------------------------------------------------------

class AdminInvitacion(BaseModel):
    id: str
    inviter_id: str
    inviter_name: str
    inviter_email: str
    invited_email: str
    invited_name: str | None
    status: str
    invited_at: datetime
    joined_at: datetime | None


class TopInviter(BaseModel):
    name: str
    email: str
    count: int      # total sent
    converted: int  # accepted


class AdminInvitacionesStats(BaseModel):
    total_enviadas: int
    pendientes: int
    unidas: int
    expiradas: int
    conversion_rate: float
    top_inviters: list[TopInviter]


class AdminInvitacionesListResponse(BaseModel):
    items: list[AdminInvitacion]
    total: int


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class AdminDashboardMetrics(BaseModel):
    total_users: int
    active_users: int
    feedback_submissions: int
    total_invitations: int
    accepted_invitations: int
    new_users_week: int


class AdminDashboardResponse(BaseModel):
    metrics: AdminDashboardMetrics
    recent_users: list[AdminUserItem]


# ---------------------------------------------------------------------------
# Feed Posts (admin)
# ---------------------------------------------------------------------------

class AdminFeedPostItem(BaseModel):
    id: str
    content: str
    author_name: str
    author_email: str
    comments_count: int
    likes_count: int
    created_at: datetime


class AdminFeedStats(BaseModel):
    total: int
    published: int
    pinned: int


class AdminFeedListResponse(BaseModel):
    items: list[AdminFeedPostItem]
    total: int


# ---------------------------------------------------------------------------
# Debates (admin)
# ---------------------------------------------------------------------------

class AdminDebateItem(BaseModel):
    id: str
    title: str
    category: str
    content: str
    slug: str
    is_featured: bool
    replies_count: int
    created_at: datetime
    author_name: str


class AdminDebatesStats(BaseModel):
    total: int
    featured: int
    con_respuestas: int


class AdminDebatesListResponse(BaseModel):
    items: list[AdminDebateItem]
    total: int


class AdminDebateCreate(BaseModel):
    title: str
    content: str
    category: str
    is_featured: bool = False


class AdminDebateUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    is_featured: bool | None = None


# ---------------------------------------------------------------------------
# Recursos (admin)
# ---------------------------------------------------------------------------

class AdminResourceItem(BaseModel):
    id: str
    title: str
    description: str
    resource_type: str
    category: str | None
    resource_url: str | None
    thumbnail_url: str | None
    author_name: str | None
    is_featured: bool
    is_published: bool
    published_at: datetime | None = None
    created_at: datetime


class AdminResourcesStats(BaseModel):
    total: int
    featured: int
    published: int
    por_tipo: list[dict]


class AdminResourcesListResponse(BaseModel):
    items: list[AdminResourceItem]
    total: int


class AdminResourceCreate(BaseModel):
    title: str
    description: str
    resource_type: str  # guide | template | video | article | tool
    category: str | None = None
    resource_url: str | None = None
    thumbnail_url: str | None = None
    author_name: str | None = None
    is_featured: bool = False
    is_published: bool = True
    published_at: datetime | None = None  # admin-defined session date+time


class AdminResourceUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    resource_type: str | None = None
    category: str | None = None
    resource_url: str | None = None
    thumbnail_url: str | None = None
    author_name: str | None = None
    is_featured: bool | None = None
    is_published: bool | None = None
    published_at: datetime | None = None  # admin-defined session date+time
