from __future__ import annotations

from collections import Counter

from sqlalchemy.orm import Session

from app.modules.admin import repository as repo
from app.modules.admin.schemas import (
    AdminDashboardMetrics,
    AdminDashboardResponse,
    AdminDebateCreate,
    AdminDebateItem,
    AdminDebatesListResponse,
    AdminDebatesStats,
    AdminDebateUpdate,
    AdminFeedbackEntry,
    AdminFeedbackListResponse,
    AdminFeedbackStats,
    AdminInvitacion,
    AdminInvitacionesListResponse,
    AdminInvitacionesStats,
    AdminResourceCreate,
    AdminResourceItem,
    AdminResourcesListResponse,
    AdminResourcesStats,
    AdminResourceUpdate,
    AdminUserItem,
    AdminUsersListResponse,
    AdminUsersStats,
    PorGrupo,
    PorRol,
    PorTier,
    TopInviter,
    TopItem,
)
from app.modules.community import repository as community_repo


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_user_item(
    user,
    feedback_completed_ids: set[str],
    invitations_sent_map: dict[str, int],
) -> AdminUserItem:
    uid = str(user.id)
    return AdminUserItem(
        id=uid,
        name=user.full_name or user.email,
        email=user.email,
        role=user.role or "user",
        group=user.group,
        access_tier=user.access_tier,
        created_at=user.created_at,
        feedback_completed=uid in feedback_completed_ids,
        invitations_sent=invitations_sent_map.get(uid, 0),
        status="activo" if user.is_active else "inactivo",
    )


def _answers_to_entry(submission, user) -> AdminFeedbackEntry:
    answers_by_key: dict[str, object] = {}
    for ans in submission.answers:
        if ans.question:
            answers_by_key[ans.question.question_key] = ans

    def text(key: str) -> str:
        ans = answers_by_key.get(key)
        if ans is None:
            return ""
        return ans.answer_text or ""

    def number(key: str):
        ans = answers_by_key.get(key)
        if ans is None:
            return None
        return ans.answer_number

    def json_list(key: str) -> list[str]:
        ans = answers_by_key.get(key)
        if ans is None:
            return []
        raw = ans.answer_json
        if isinstance(raw, list):
            return [str(v) for v in raw]
        return []

    rol_val = text("role")
    if not rol_val:
        # fallback to other_text if set
        ans = answers_by_key.get("role")
        if ans and ans.other_text:
            rol_val = ans.other_text

    return AdminFeedbackEntry(
        id=str(submission.id),
        user_id=str(user.id),
        user_name=user.full_name or user.email,
        user_email=user.email,
        rol=rol_val,
        desgastes=json_list("pain_points"),
        impacto=number("impact_level"),
        solucion_actual=text("current_solution"),
        herramientas=[],
        vision_ia=text("desired_future"),
        resultados_deseados=[],
        created_at=submission.created_at,
    )


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

def get_users_list(db: Session) -> AdminUsersListResponse:
    users = repo.get_all_users(db)
    feedback_ids = repo.get_feedback_completed_bulk(db)
    inv_map = repo.get_invitations_sent_bulk(db)

    items = [_build_user_item(u, feedback_ids, inv_map) for u in users]
    return AdminUsersListResponse(items=items, total=len(items))


def get_users_stats(db: Session) -> AdminUsersStats:
    raw = repo.get_users_stats(db)
    return AdminUsersStats(
        total=raw["total"],
        activos=raw["activos"],
        nuevos_semana=raw["nuevos_semana"],
        con_feedback=raw["con_feedback"],
        por_grupo=[PorGrupo(**r) for r in raw["por_grupo"]],
        por_tier=[PorTier(**r) for r in raw["por_tier"]],
    )


def get_recent_users(db: Session) -> AdminUsersListResponse:
    users = repo.get_recent_users(db, limit=5)
    feedback_ids = repo.get_feedback_completed_bulk(db)
    inv_map = repo.get_invitations_sent_bulk(db)

    items = [_build_user_item(u, feedback_ids, inv_map) for u in users]
    return AdminUsersListResponse(items=items, total=len(items))


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

def get_feedback_list(db: Session) -> AdminFeedbackListResponse:
    pairs = repo.get_all_feedback_submissions(db)
    items = [_answers_to_entry(sub, user) for sub, user in pairs]
    return AdminFeedbackListResponse(items=items, total=len(items))


def get_feedback_stats(db: Session) -> AdminFeedbackStats:
    raw = repo.get_feedback_stats_raw(db)

    # Aggregate pain points from JSON arrays
    desgaste_counter: Counter = Counter()
    for answer_json, other_text in raw["pain_rows"]:
        if isinstance(answer_json, list):
            for val in answer_json:
                desgaste_counter[str(val)] += 1
        if other_text:
            desgaste_counter[other_text] += 1

    top_desgastes = [
        TopItem(label=k, count=v)
        for k, v in desgaste_counter.most_common(10)
    ]

    por_rol = [
        PorRol(rol=row[0] or "Sin especificar", count=row[1])
        for row in raw["rol_rows"]
    ]

    return AdminFeedbackStats(
        total=raw["total"],
        promedio_impacto=raw["avg_impact"],
        top_desgastes=top_desgastes,
        top_herramientas=[],
        por_rol=por_rol,
        top_resultados=[],
    )


# ---------------------------------------------------------------------------
# Invitations
# ---------------------------------------------------------------------------

def get_invitations_list(db: Session) -> AdminInvitacionesListResponse:
    pairs = repo.get_all_invitations(db)
    items = []
    for inv, inviter in pairs:
        # Try to get the joined user's name via accepted_user_id
        invited_name = None
        if inv.accepted_user_id:
            from app.models.user import User as UserModel
            accepted = db.query(UserModel).filter(UserModel.id == inv.accepted_user_id).first()
            if accepted:
                invited_name = accepted.full_name or accepted.email

        status_map = {"pending": "pendiente", "accepted": "unido", "cancelled": "expirado"}
        items.append(AdminInvitacion(
            id=str(inv.id),
            inviter_id=str(inv.inviter_user_id),
            inviter_name=inviter.full_name or inviter.email,
            inviter_email=inviter.email,
            invited_email=inv.invited_email,
            invited_name=invited_name,
            status=status_map.get(inv.status, inv.status),
            invited_at=inv.created_at,
            joined_at=inv.accepted_at,
        ))
    return AdminInvitacionesListResponse(items=items, total=len(items))


def get_invitations_stats(db: Session) -> AdminInvitacionesStats:
    raw = repo.get_invitations_stats_raw(db)
    accepted_per_inviter = repo.get_accepted_count_per_inviter(db)

    total = raw["total"]
    unidas = raw["unidas"]
    conversion_rate = round((unidas / total * 100), 1) if total > 0 else 0.0

    top_inviters = [
        TopInviter(
            name=row[1] or row[2],
            email=row[2],
            count=row[3],
            converted=accepted_per_inviter.get(str(row[0]), 0),
        )
        for row in raw["top_inviters_rows"]
    ]

    return AdminInvitacionesStats(
        total_enviadas=total,
        pendientes=raw["pendientes"],
        unidas=unidas,
        expiradas=raw["expiradas"],
        conversion_rate=conversion_rate,
        top_inviters=top_inviters,
    )


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

def get_dashboard(db: Session) -> AdminDashboardResponse:
    from app.models.feedback_submission import FeedbackSubmission
    from app.models.invitation import Invitation as InvModel
    from sqlalchemy import func

    raw_stats = repo.get_users_stats(db)

    feedback_total = (
        db.query(func.count(FeedbackSubmission.id))
        .filter(FeedbackSubmission.status == "submitted")
        .scalar() or 0
    )
    inv_total = db.query(func.count(InvModel.id)).scalar() or 0
    inv_accepted = (
        db.query(func.count(InvModel.id))
        .filter(InvModel.status == "accepted")
        .scalar() or 0
    )

    metrics = AdminDashboardMetrics(
        total_users=raw_stats["total"],
        active_users=raw_stats["activos"],
        feedback_submissions=feedback_total,
        total_invitations=inv_total,
        accepted_invitations=inv_accepted,
        new_users_week=raw_stats["nuevos_semana"],
    )

    users = repo.get_recent_users(db, limit=5)
    feedback_ids = repo.get_feedback_completed_bulk(db)
    inv_map = repo.get_invitations_sent_bulk(db)
    recent = [_build_user_item(u, feedback_ids, inv_map) for u in users]

    return AdminDashboardResponse(metrics=metrics, recent_users=recent)


# ---------------------------------------------------------------------------
# Feed Posts admin
# ---------------------------------------------------------------------------

def get_feed_list(db: Session) -> "AdminFeedListResponse":
    from app.modules.admin.schemas import AdminFeedPostItem, AdminFeedListResponse
    posts, total = community_repo.admin_get_all_posts(db)
    items = []
    for p in posts:
        comments_count = community_repo.get_post_comments_count(db, str(p.id))
        likes_count = community_repo.get_post_likes_count(db, str(p.id))
        items.append(AdminFeedPostItem(
            id=str(p.id),
            content=p.content,
            author_name=p.author.full_name if p.author else "Anónimo",
            author_email=p.author.email if p.author else "",
            comments_count=comments_count,
            likes_count=likes_count,
            created_at=p.created_at,
        ))
    return AdminFeedListResponse(items=items, total=total)


def get_feed_stats(db: Session) -> "AdminFeedStats":
    from app.modules.admin.schemas import AdminFeedStats
    data = community_repo.admin_get_posts_stats(db)
    return AdminFeedStats(**data)


def delete_post_admin(db: Session, post_id: str) -> dict:
    from fastapi import HTTPException
    ok = community_repo.admin_delete_post(db, post_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Debates admin
# ---------------------------------------------------------------------------

def get_debates_list(db: Session) -> AdminDebatesListResponse:
    debates, total = community_repo.admin_get_all_debates(db)
    items = []
    for d in debates:
        replies_count = community_repo.get_debate_replies_count(db, str(d.id))
        items.append(AdminDebateItem(
            id=str(d.id),
            title=d.title,
            category=d.category,
            content=d.content,
            slug=d.slug,
            is_featured=d.is_featured,
            replies_count=replies_count,
            created_at=d.created_at,
            author_name=d.author.full_name if d.author else "Admin"
        ))
    return AdminDebatesListResponse(items=items, total=total)


def get_debates_stats(db: Session) -> AdminDebatesStats:
    data = community_repo.admin_get_debates_stats(db)
    return AdminDebatesStats(**data)


def create_debate_admin(db: Session, user_id: str, request: AdminDebateCreate) -> AdminDebateItem:
    debate = community_repo.admin_create_debate(
        db, user_id, request.title, request.category, request.content, request.is_featured
    )
    return AdminDebateItem(
        id=str(debate.id),
        title=debate.title,
        category=debate.category,
        content=debate.content,
        slug=debate.slug,
        is_featured=debate.is_featured,
        replies_count=0,
        created_at=debate.created_at,
        author_name=debate.author.full_name if debate.author else "Admin"
    )


def update_debate_admin(db: Session, debate_id: str, request: AdminDebateUpdate) -> AdminDebateItem:
    from fastapi import HTTPException
    debate = community_repo.admin_update_debate(
        db, debate_id,
        title=request.title,
        content=request.content,
        category=request.category,
        is_featured=request.is_featured
    )
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    replies_count = community_repo.get_debate_replies_count(db, str(debate.id))
    return AdminDebateItem(
        id=str(debate.id),
        title=debate.title,
        category=debate.category,
        content=debate.content,
        slug=debate.slug,
        is_featured=debate.is_featured,
        replies_count=replies_count,
        created_at=debate.created_at,
        author_name=debate.author.full_name if debate.author else "Admin"
    )


def delete_debate_admin(db: Session, debate_id: str) -> dict:
    from fastapi import HTTPException
    ok = community_repo.admin_delete_debate(db, debate_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Debate not found")
    return {"ok": True}


def toggle_debate_featured(db: Session, debate_id: str) -> AdminDebateItem:
    from fastapi import HTTPException
    debate = community_repo.admin_toggle_debate_featured(db, debate_id)
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    replies_count = community_repo.get_debate_replies_count(db, str(debate.id))
    return AdminDebateItem(
        id=str(debate.id),
        title=debate.title,
        category=debate.category,
        content=debate.content,
        slug=debate.slug,
        is_featured=debate.is_featured,
        replies_count=replies_count,
        created_at=debate.created_at,
        author_name=debate.author.full_name if debate.author else "Admin"
    )


# ---------------------------------------------------------------------------
# Recursos admin
# ---------------------------------------------------------------------------

def get_resources_list(db: Session) -> AdminResourcesListResponse:
    resources, total = community_repo.admin_get_all_resources(db)
    items = [AdminResourceItem(
        id=str(r.id),
        title=r.title,
        description=r.description,
        resource_type=r.resource_type,
        category=r.category,
        resource_url=r.resource_url,
        thumbnail_url=r.thumbnail_url,
        author_name=r.author_name,
        is_featured=r.is_featured,
        is_published=r.is_published,
        created_at=r.created_at,
    ) for r in resources]
    return AdminResourcesListResponse(items=items, total=total)


def get_resources_stats(db: Session) -> AdminResourcesStats:
    data = community_repo.admin_get_resources_stats(db)
    return AdminResourcesStats(**data)


def create_resource_admin(db: Session, user_id: str, request: AdminResourceCreate) -> AdminResourceItem:
    from app.services.email_service import notify_new_resource

    r = community_repo.admin_create_resource(
        db, user_id,
        title=request.title,
        description=request.description,
        resource_type=request.resource_type,
        category=request.category,
        resource_url=request.resource_url,
        thumbnail_url=request.thumbnail_url,
        author_name=request.author_name,
        is_featured=request.is_featured,
        is_published=request.is_published
    )

    # Notify via N8N only when published (fire-and-forget)
    if request.is_published:
        try:
            from app.modules.community.repository import get_all_active_user_emails
            recipients = get_all_active_user_emails(db)
            notify_new_resource(
                title=r.title,
                resource_type=r.resource_type,
                author_name=r.author_name,
                resource_url=r.resource_url,
                recipients=recipients,
            )
        except Exception:
            pass

    return AdminResourceItem(
        id=str(r.id),
        title=r.title,
        description=r.description,
        resource_type=r.resource_type,
        category=r.category,
        resource_url=r.resource_url,
        thumbnail_url=r.thumbnail_url,
        author_name=r.author_name,
        is_featured=r.is_featured,
        is_published=r.is_published,
        created_at=r.created_at,
    )


def update_resource_admin(db: Session, resource_id: str, request: AdminResourceUpdate) -> AdminResourceItem:
    from fastapi import HTTPException
    r = community_repo.admin_update_resource(
        db, resource_id,
        title=request.title,
        description=request.description,
        resource_type=request.resource_type,
        category=request.category,
        resource_url=request.resource_url,
        thumbnail_url=request.thumbnail_url,
        author_name=request.author_name,
        is_featured=request.is_featured,
        is_published=request.is_published
    )
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return AdminResourceItem(
        id=str(r.id),
        title=r.title,
        description=r.description,
        resource_type=r.resource_type,
        category=r.category,
        resource_url=r.resource_url,
        thumbnail_url=r.thumbnail_url,
        author_name=r.author_name,
        is_featured=r.is_featured,
        is_published=r.is_published,
        created_at=r.created_at,
    )


def delete_resource_admin(db: Session, resource_id: str) -> dict:
    from fastapi import HTTPException
    ok = community_repo.admin_delete_resource(db, resource_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"ok": True}


def toggle_resource_featured(db: Session, resource_id: str) -> AdminResourceItem:
    from fastapi import HTTPException
    r = community_repo.admin_toggle_resource_featured(db, resource_id)
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return AdminResourceItem(
        id=str(r.id),
        title=r.title,
        description=r.description,
        resource_type=r.resource_type,
        category=r.category,
        resource_url=r.resource_url,
        thumbnail_url=r.thumbnail_url,
        author_name=r.author_name,
        is_featured=r.is_featured,
        is_published=r.is_published,
        created_at=r.created_at,
    )
