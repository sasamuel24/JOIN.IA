'use client';

import { useCallback, useState } from 'react';
import type { FeedbackData } from '@/types/dashboard';

export function useFeedbackWizard(totalSteps = 6) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<FeedbackData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const updateData = (partial: Partial<FeedbackData>) =>
    setData(prev => ({ ...prev, ...partial }));

  // Called exactly once (guarded by a ref in the parent) to seed local state
  // from a draft submission that already has saved answers.
  const preloadData = useCallback((preloaded: Partial<FeedbackData>) => {
    setData(preloaded);
  }, []);

  const next = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const prev = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  // Phase 2: saves last step answer before advancing to confirmation.
  // Phase 4 (submit) will call POST /submissions/{id}/submit here.
  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      setSubmitted(true);
      setDirection(1);
      setStep(totalSteps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    step,
    TOTAL_STEPS: totalSteps,
    data,
    direction,
    submitting,
    submitted,
    error,
    updateData,
    preloadData,
    next,
    prev,
    goToStep,
    submit,
  };
}
