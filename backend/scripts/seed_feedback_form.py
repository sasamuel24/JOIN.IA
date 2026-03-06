"""Seed the onboarding feedback form with questions and options.

Idempotent: safe to run multiple times. Skips if slug='onboarding' version=1 exists.

Usage:
    cd backend
    python -m scripts.seed_feedback_form
"""
from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.db import SessionLocal
from app.models.feedback_answer import FeedbackAnswer  # noqa: F401 — relationship target
from app.models.feedback_form import FeedbackForm
from app.models.feedback_option import FeedbackOption
from app.models.feedback_question import FeedbackQuestion
from app.models.feedback_submission import FeedbackSubmission  # noqa: F401 — relationship target

FORM_SLUG = "onboarding"
FORM_VERSION = 1

FORM = {
    "slug": FORM_SLUG,
    "title": "Feedback de Onboarding",
    "description": "Cuéntanos sobre tu día a día para personalizar tu experiencia.",
    "version": FORM_VERSION,
    "is_active": True,
}

QUESTIONS = [
    {
        "step_order": 1,
        "question_key": "role",
        "question_text": "¿Cuál es tu rol en tu organización?",
        "question_type": "single_choice",
        "is_required": True,
        "allow_other_text": True,
        "options": [
            {"label": "Fundador / CEO", "value": "founder", "sort_order": 0},
            {"label": "C-Level / VP", "value": "c_level", "sort_order": 1},
            {"label": "Director / Gerente", "value": "director", "sort_order": 2},
            {"label": "Líder de equipo", "value": "team_lead", "sort_order": 3},
            {"label": "Colaborador individual", "value": "ic", "sort_order": 4},
            {"label": "Freelancer / Consultor", "value": "freelancer", "sort_order": 5},
            {"label": "Otro", "value": "other", "sort_order": 99, "is_other_option": True},
        ],
    },
    {
        "step_order": 2,
        "question_key": "pain_points",
        "question_text": "¿Qué es lo que más te desgasta hoy?",
        "question_type": "multi_choice",
        "help_text": "Selecciona todas las que apliquen.",
        "is_required": True,
        "allow_other_text": True,
        "options": [
            {"label": "Reuniones que podrían ser un correo", "value": "meetings", "sort_order": 0},
            {"label": "Reportes manuales repetitivos", "value": "reports", "sort_order": 1},
            {"label": "Coordinar tareas entre equipos", "value": "coordination", "sort_order": 2},
            {"label": "Falta de visibilidad sobre prioridades", "value": "visibility", "sort_order": 3},
            {"label": "Seguimiento de proyectos disperso", "value": "tracking", "sort_order": 4},
            {"label": "Onboarding lento de nuevos miembros", "value": "onboarding", "sort_order": 5},
            {"label": "Información fragmentada en muchas herramientas", "value": "fragmentation", "sort_order": 6},
            {"label": "Otro", "value": "other", "sort_order": 99, "is_other_option": True},
        ],
    },
    {
        "step_order": 3,
        "question_key": "impact_level",
        "question_text": "¿Cuánto te afecta en tu día a día?",
        "question_type": "scale",
        "help_text": "1 = casi nada, 10 = me consume el día.",
        "is_required": True,
        "allow_other_text": False,
        "min_value": 1,
        "max_value": 10,
        "options": [],
    },
    {
        "step_order": 4,
        "question_key": "current_solution",
        "question_text": "¿Cómo lo estás resolviendo hoy?",
        "question_type": "text",
        "placeholder": "Describe brevemente tu proceso actual…",
        "is_required": True,
        "allow_other_text": False,
        "options": [],
    },
    {
        "step_order": 5,
        "question_key": "desired_future",
        "question_text": "Si la IA lo resolviera por ti, ¿cómo se vería tu día?",
        "question_type": "text",
        "placeholder": "Imagina tu día ideal con este problema resuelto…",
        "is_required": True,
        "allow_other_text": False,
        "options": [],
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        existing = (
            db.query(FeedbackForm)
            .filter(FeedbackForm.slug == FORM_SLUG, FeedbackForm.version == FORM_VERSION)
            .first()
        )
        if existing:
            print(f"Form '{FORM_SLUG}' v{FORM_VERSION} already exists (id={existing.id}). Skipping.")
            return

        form = FeedbackForm(**FORM)
        db.add(form)
        db.flush()

        total_questions = 0
        total_options = 0

        for q_data in QUESTIONS:
            options_data = q_data.pop("options", [])
            question = FeedbackQuestion(form_id=form.id, **q_data)
            db.add(question)
            db.flush()
            total_questions += 1

            for opt_data in options_data:
                option = FeedbackOption(
                    question_id=question.id,
                    label=opt_data["label"],
                    value=opt_data["value"],
                    sort_order=opt_data.get("sort_order", 0),
                    is_other_option=opt_data.get("is_other_option", False),
                )
                db.add(option)
                total_options += 1

        db.commit()

        print(f"Form created: '{form.title}' (slug={form.slug}, v{form.version}, id={form.id})")
        print(f"  Questions inserted: {total_questions}")
        print(f"  Options inserted:   {total_options}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
