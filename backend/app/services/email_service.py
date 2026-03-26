import httpx
from app.core.config import settings


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Dispara el workflow de N8N para enviar el email de reset de contraseña."""
    if not settings.N8N_WEBHOOK_PASSWORD_RESET:
        print("[email_service] N8N_WEBHOOK_PASSWORD_RESET no configurado, email no enviado.")
        return

    payload = {
        "to": to_email,
        "reset_link": reset_link,
    }
    try:
        response = httpx.post(settings.N8N_WEBHOOK_PASSWORD_RESET, json=payload, timeout=10)
        response.raise_for_status()
        print(f"[email_service] Webhook N8N password_reset OK: {response.status_code}")
    except httpx.HTTPError as e:
        print(f"[email_service] Error al llamar webhook N8N password_reset: {e}")


def send_verification_email(to_email: str, verification_link: str, full_name: str = "") -> None:
    """Dispara el workflow de N8N para enviar el email de verificación de cuenta."""
    if not settings.N8N_WEBHOOK_EMAIL_VERIFICATION:
        print("[email_service] N8N_WEBHOOK_EMAIL_VERIFICATION no configurado, email no enviado.")
        return

    payload = {
        "to": to_email,
        "verification_link": verification_link,
        "full_name": full_name,
    }
    try:
        response = httpx.post(settings.N8N_WEBHOOK_EMAIL_VERIFICATION, json=payload, timeout=10)
        response.raise_for_status()
        print(f"[email_service] Webhook N8N email_verification OK: {response.status_code}")
    except httpx.HTTPError as e:
        print(f"[email_service] Error al llamar webhook N8N email_verification: {e}")


def send_invitation_email(
    to_email: str,
    invitation_link: str,
    inviter_name: str = "Un miembro",
    inviter_email: str = "",
) -> None:
    """Dispara el workflow de N8N para enviar el email de invitación."""
    if not settings.N8N_WEBHOOK_INVITATION:
        print("[email_service] N8N_WEBHOOK_INVITATION no configurado, email no enviado.")
        return

    payload = {
        "to": to_email,
        "invitation_link": invitation_link,
        "inviter_name": inviter_name,
        "inviter_email": inviter_email,
    }
    try:
        response = httpx.post(settings.N8N_WEBHOOK_INVITATION, json=payload, timeout=10)
        response.raise_for_status()
        print(f"[email_service] Webhook N8N invitation OK: {response.status_code}")
    except httpx.HTTPError as e:
        print(f"[email_service] Error al llamar webhook N8N invitation: {e}")


def notify_new_feed_post(
    author_name: str,
    author_email: str,
    content: str,
    recipients: list[dict],
) -> None:
    """Dispara el workflow de N8N cuando alguien publica en el feed.

    recipients: lista de {email, name} — todos los usuarios activos de la plataforma.
    N8N itera sobre recipients y envía un correo personalizado a cada uno.
    """
    if not settings.N8N_WEBHOOK_NEW_FEED_POST:
        print("[email_service] N8N_WEBHOOK_NEW_FEED_POST no configurado, notificación omitida.")
        return

    payload = {
        "author_name": author_name,
        "author_email": author_email,
        "content": content[:300],
        "recipients": recipients,
    }
    try:
        response = httpx.post(settings.N8N_WEBHOOK_NEW_FEED_POST, json=payload, timeout=15)
        response.raise_for_status()
        print(f"[email_service] Webhook N8N new_feed_post OK ({len(recipients)} destinatarios): {response.status_code}")
    except httpx.HTTPError as e:
        print(f"[email_service] Error al llamar webhook N8N new_feed_post: {e}")


def notify_new_resource(
    title: str,
    resource_type: str,
    author_name: str | None,
    resource_url: str | None,
    recipients: list[dict],
) -> None:
    """Dispara el workflow de N8N cuando se publica un nuevo recurso.

    recipients: lista de {email, name} — todos los usuarios activos de la plataforma.
    """
    if not settings.N8N_WEBHOOK_NEW_RESOURCE:
        print("[email_service] N8N_WEBHOOK_NEW_RESOURCE no configurado, notificación omitida.")
        return

    payload = {
        "title": title,
        "resource_type": resource_type,
        "author_name": author_name or "",
        "resource_url": resource_url or "",
        "recipients": recipients,
    }
    try:
        response = httpx.post(settings.N8N_WEBHOOK_NEW_RESOURCE, json=payload, timeout=15)
        response.raise_for_status()
        print(f"[email_service] Webhook N8N new_resource OK ({len(recipients)} destinatarios): {response.status_code}")
    except httpx.HTTPError as e:
        print(f"[email_service] Error al llamar webhook N8N new_resource: {e}")