'use client';

import { useState } from 'react';
import type { FeedbackData } from '@/types/dashboard';

const TOTAL_STEPS = 6;

export function useFeedbackWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<FeedbackData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1); // 1 forward, -1 backward

  const updateData = (partial: Partial<FeedbackData>) =>
    setData(prev => ({ ...prev, ...partial }));

  const next = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const prev = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  const submit = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? 'Error al enviar feedback');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setDirection(1);
      setStep(TOTAL_STEPS);
    }
  };

  return {
    step,
    TOTAL_STEPS,
    data,
    direction,
    submitting,
    submitted,
    error,
    updateData,
    next,
    prev,
    submit,
  };
}
