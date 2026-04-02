"""
AI writing assistant service — wraps the Anthropic Claude API.
"""
from __future__ import annotations

import anthropic
from fastapi import HTTPException

from app.core.config import settings

# Supported actions and their system prompts
_SYSTEM_PROMPTS: dict[str, str] = {
    "improve": (
        "Eres un asistente de redacción experto. "
        "Mejora el texto que te proporcione: corrígelo, hazlo más claro y profesional, "
        "pero conserva la voz y el sentido original. "
        "Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni comillas."
    ),
    "expand": (
        "Eres un asistente de redacción experto. "
        "Expande y enriquece el texto que te proporcione añadiendo más detalle y contexto, "
        "manteniendo el mismo tono. "
        "Responde ÚNICAMENTE con el texto expandido, sin explicaciones ni comillas."
    ),
    "shorten": (
        "Eres un asistente de redacción experto. "
        "Resume y acorta el texto que te proporcione, conservando las ideas clave. "
        "Responde ÚNICAMENTE con el texto acortado, sin explicaciones ni comillas."
    ),
    "rephrase": (
        "Eres un asistente de redacción experto. "
        "Reformula el texto que te proporcione con otras palabras manteniendo el mismo significado. "
        "Responde ÚNICAMENTE con el texto reformulado, sin explicaciones ni comillas."
    ),
    "generate": (
        "Eres un asistente de redacción para JOIN.IA, una plataforma de inteligencia artificial. "
        "Redacta un texto claro, profesional y útil basado en la instrucción del usuario. "
        "Responde ÚNICAMENTE con el texto redactado, sin explicaciones ni comillas."
    ),
    "fix": (
        "Eres un asistente de redacción experto. "
        "Corrige únicamente la ortografía y gramática del texto que te proporcione, "
        "sin cambiar el estilo ni el contenido. "
        "Responde ÚNICAMENTE con el texto corregido, sin explicaciones ni comillas."
    ),
}

VALID_ACTIONS = set(_SYSTEM_PROMPTS.keys())


def assist_text(action: str, prompt: str, existing_text: str | None = None) -> str:
    """
    Call Claude to perform a writing action.

    - action:        one of improve | expand | shorten | rephrase | generate | fix
    - prompt:        the user's instruction (or the text itself for improve/expand/etc.)
    - existing_text: optional — text already in the field (used as context)
    """
    if action not in VALID_ACTIONS:
        raise HTTPException(status_code=400, detail=f"Acción no válida: {action}")

    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="API de IA no configurada.")

    system_prompt = _SYSTEM_PROMPTS[action]

    # Build the user message
    if action == "generate":
        user_message = prompt
    else:
        text_to_process = existing_text.strip() if existing_text else prompt.strip()
        if not text_to_process:
            raise HTTPException(status_code=400, detail="No hay texto para procesar.")
        user_message = text_to_process
        if prompt and prompt.strip() and prompt.strip() != text_to_process:
            user_message = f"Instrucción adicional: {prompt.strip()}\n\nTexto:\n{text_to_process}"

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",  # fast + cheap for writing tasks
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    return message.content[0].text.strip()
