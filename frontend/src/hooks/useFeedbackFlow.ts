'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getActiveFeedbackForm,
  createOrGetSubmission,
  updateSubmissionAnswers,
  submitFeedbackSubmission,
} from '@/services/feedbackService';
import type {
  FeedbackAnswerInput,
  FeedbackForm,
  FeedbackQuestion,
  FeedbackSubmission,
} from '@/services/feedbackService';
import type { FeedbackData } from '@/types/dashboard';

export type { FeedbackForm, FeedbackQuestion, FeedbackSubmission };

export function useFeedbackFlow() {
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [submission, setSubmission] = useState<FeedbackSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const f = await getActiveFeedbackForm();
        if (cancelled) return;
        setForm(f);

        const sub = await createOrGetSubmission();
        if (cancelled) return;
        setSubmission(sub);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message === 'NO_ACTIVE_FORM') {
          setError('NO_ACTIVE_FORM');
        } else {
          setError(
            err instanceof Error ? err.message : 'Error al cargar feedback',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // question_key → FeedbackQuestion (for saves)
  const questionsByKey = useMemo(() => {
    const map: Record<string, FeedbackQuestion> = {};
    if (form) {
      for (const q of form.questions) {
        map[q.question_key] = q;
      }
    }
    return map;
  }, [form]);

  // question_id → FeedbackQuestion (for preloading saved answers)
  const questionById = useMemo(() => {
    const map: Record<string, FeedbackQuestion> = {};
    if (form) {
      for (const q of form.questions) {
        map[q.id] = q;
      }
    }
    return map;
  }, [form]);

  // Derived: map saved submission answers back into wizard local-state shape
  const savedData = useMemo((): Partial<FeedbackData> => {
    if (!submission || !submission.answers.length || !form) return {};

    const result: Partial<FeedbackData> = {};

    for (const answer of submission.answers) {
      const question = questionById[answer.question_id];
      if (!question) continue;

      switch (question.question_key) {
        case 'role': {
          const json = answer.answer_json as { selected?: string } | null;
          if (json?.selected) result.rol = json.selected;
          if (answer.other_text) result.rolOtherText = answer.other_text;
          break;
        }
        case 'pain_points': {
          const json = answer.answer_json as { selected?: string[] } | null;
          if (Array.isArray(json?.selected)) result.desgastes = json.selected;
          if (answer.other_text) result.desgastesOtherText = answer.other_text;
          break;
        }
        case 'impact_level': {
          if (answer.answer_number != null) result.impacto = answer.answer_number;
          break;
        }
        case 'current_solution': {
          if (answer.answer_text) result.solucion_actual = answer.answer_text;
          const json = answer.answer_json as { herramientas?: string[] } | null;
          if (Array.isArray(json?.herramientas)) result.herramientas = json.herramientas;
          break;
        }
        case 'desired_future': {
          if (answer.answer_text) result.vision_ia = answer.answer_text;
          const json = answer.answer_json as { resultados_deseados?: string[] } | null;
          if (Array.isArray(json?.resultados_deseados))
            result.resultados_deseados = json.resultados_deseados;
          break;
        }
      }
    }

    return result;
  }, [submission, questionById, form]);

  const saveStepAnswer = useCallback(
    async (
      questionKey: string,
      answer: Omit<FeedbackAnswerInput, 'question_id'>,
    ): Promise<void> => {
      if (!submission) throw new Error('No hay sesión de feedback activa');
      const question = questionsByKey[questionKey];
      if (!question) throw new Error(`Pregunta desconocida: ${questionKey}`);

      await updateSubmissionAnswers(submission.id, [
        { question_id: question.id, ...answer },
      ]);
    },
    [submission, questionsByKey],
  );

  const submitSubmission = useCallback(async (): Promise<void> => {
    if (!submission) throw new Error('No hay sesión de feedback activa');
    await submitFeedbackSubmission(submission.id);
  }, [submission]);

  return {
    form,
    submission,
    submissionId: submission?.id ?? null,
    loading,
    error,
    questionsByKey,
    savedData,
    totalSteps: form ? form.questions.length + 1 : 6,
    alreadySubmitted: submission?.status === 'submitted',
    saveStepAnswer,
    submitSubmission,
  };
}
