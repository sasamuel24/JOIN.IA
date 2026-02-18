import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

def send_password_reset_email(to_email: str, reset_link: str) -> None:
    response = resend.Emails.send({
        "from": settings.RESEND_FROM_EMAIL,
        "to": to_email,
        "subject": "Restablecer contraseña — JOIN.IA",
        "html": f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
                <h2 style="color: #111; font-size: 1.5rem; margin-bottom: 1rem;">
                    Restablecer tu contraseña
                </h2>
                <p style="color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en JOIN.IA.
                    Haz clic en el botón para continuar. Este enlace expira en <strong>1 hora</strong>.
                </p>
                <a href="{reset_link}"
                   style="display: inline-block; padding: 0.75rem 1.5rem; background: #111;
                          color: #fff; text-decoration: none; border-radius: 6px;
                          font-weight: 600; font-size: 0.9rem;">
                    Restablecer contraseña
                </a>
                <p style="color: #999; font-size: 0.8rem; margin-top: 2rem;">
                    Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
                </p>
            </div>
        """,
    })
    print("Resend response:", response)  # 👈 esto mostrará el error exacto en la terminal