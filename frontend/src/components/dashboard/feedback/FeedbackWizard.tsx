'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFeedbackFlow } from '@/hooks/useFeedbackFlow';
import { useFeedbackWizard } from '@/hooks/useFeedbackWizard';
import type { FeedbackData } from '@/types/dashboard';
import type { FeedbackAnswerInput } from '@/services/feedbackService';
import { EarlyAccessBadge } from '../inicio/EarlyAccessBadge';
import { WizardProgress } from './WizardProgress';
import { FeedbackSidePanel } from './FeedbackSidePanel';
import { DashboardDivider } from '../shared/DashboardDivider';
import { DashboardFooter } from '../shared/DashboardFooter';
import { StepRol } from './steps/StepRol';
import { StepDesgaste } from './steps/StepDesgaste';
import { StepImpacto } from './steps/StepImpacto';
import { StepSolucion } from './steps/StepSolucion';
import { StepVision } from './steps/StepVision';
import { StepConfirmacion } from './steps/StepConfirmacion';

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

// ---------------------------------------------------------------------------
// Map wizard step → backend answer payload
// ---------------------------------------------------------------------------

function buildAnswerForStep(
  currentStep: number,
  data: Partial<FeedbackData>,
): { key: string; answer: Omit<FeedbackAnswerInput, 'question_id'> } | null {
  switch (currentStep) {
    case 1:
      return data.rol
        ? {
            key: 'role',
            answer: {
              answer_json: { selected: data.rol },
              other_text: data.rol === 'other' ? (data.rolOtherText?.trim() || null) : null,
            },
          }
        : null;
    case 2:
      return data.desgastes?.length
        ? {
            key: 'pain_points',
            answer: {
              answer_json: { selected: data.desgastes },
              other_text: data.desgastes.includes('other')
                ? (data.desgastesOtherText?.trim() || null)
                : null,
            },
          }
        : null;
    case 3:
      return data.impacto
        ? { key: 'impact_level', answer: { answer_number: data.impacto } }
        : null;
    case 4: {
      const text = data.solucion_actual?.trim() || null;
      const tools = data.herramientas?.length ? data.herramientas : null;
      return text || tools
        ? { key: 'current_solution', answer: { answer_text: text, answer_json: tools ? { herramientas: tools } : null } }
        : null;
    }
    case 5: {
      const text = data.vision_ia?.trim() || null;
      const outcomes = data.resultados_deseados?.length ? data.resultados_deseados : null;
      return text || outcomes
        ? { key: 'desired_future', answer: { answer_text: text, answer_json: outcomes ? { resultados_deseados: outcomes } : null } }
        : null;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FeedbackWizard() {
  const {
    form,
    loading: flowLoading,
    error: flowError,
    questionsByKey,
    savedData,
    totalSteps,
    alreadySubmitted,
    saveStepAnswer,
    submitSubmission,
  } = useFeedbackFlow();

  const {
    step, TOTAL_STEPS, data, direction, submitting, error: wizardError,
    updateData, preloadData, next, prev, submit, goToStep,
  } = useFeedbackWizard(totalSteps);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seed wizard state from saved draft answers exactly once, after the
  // submission has loaded. A ref prevents re-running on every render.
  const hasPreloaded = useRef(false);
  useEffect(() => {
    if (!hasPreloaded.current && Object.keys(savedData).length > 0) {
      preloadData(savedData);
      hasPreloaded.current = true;
    }
  }, [savedData, preloadData]);

  // If the submission is already completed, jump to confirmation
  if (alreadySubmitted && step !== TOTAL_STEPS) {
    goToStep(TOTAL_STEPS);
  }

  // ── Save current step, then advance ────────────────────────────────────
  const handleNext = async () => {
    setSaveError(null);
    const payload = buildAnswerForStep(step, data);
    if (payload) {
      setSaving(true);
      try {
        await saveStepAnswer(payload.key, payload.answer);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Error al guardar');
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    next();
  };

  const handleSubmit = async () => {
    setSaveError(null);
    setSaving(true);

    // 1) Save the last step's answer if there is one
    const payload = buildAnswerForStep(step, data);
    if (payload) {
      try {
        await saveStepAnswer(payload.key, payload.answer);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Error al guardar la respuesta');
        setSaving(false);
        return;
      }
    }

    // 2) Call backend submit endpoint
    try {
      await submitSubmission();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      // "ALREADY_SUBMITTED" means the backend already considers it done —
      // treat as success and show the confirmation screen.
      if (msg !== 'ALREADY_SUBMITTED') {
        setSaveError(msg || 'Error al enviar el feedback. Inténtalo de nuevo.');
        setSaving(false);
        return;
      }
    }

    // 3) Only advance to confirmation after a successful (or idempotent) submit
    setSaving(false);
    submit();
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (flowLoading) {
    return (
      <div className="px-4 sm:px-8 py-8">
        <EarlyAccessBadge className="mb-5" />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-[3px] border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Cargando formulario…</p>
        </div>
      </div>
    );
  }

  // ── No active form fallback ────────────────────────────────────────────
  if (flowError === 'NO_ACTIVE_FORM' || (!flowError && !form)) {
    return (
      <div className="px-4 sm:px-8 py-8">
        <EarlyAccessBadge className="mb-5" />
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <h2 className="text-xl font-bold text-text-main">
            No hay formulario activo por ahora
          </h2>
          <p className="text-sm text-text-secondary max-w-md">
            Estamos preparando nuevas preguntas para ti. Vuelve pronto.
          </p>
        </div>
      </div>
    );
  }

  // ── Generic error fallback ─────────────────────────────────────────────
  if (flowError) {
    return (
      <div className="px-4 sm:px-8 py-8">
        <EarlyAccessBadge className="mb-5" />
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <h2 className="text-xl font-bold text-text-main">
            Algo salió mal
          </h2>
          <p className="text-sm text-text-secondary max-w-md">{flowError}</p>
        </div>
      </div>
    );
  }

  // ── Question-number helpers ────────────────────────────────────────────
  const questionCount = TOTAL_STEPS - 2;
  const questionNumber = (s: number) => s - 1;

  const roleOptions = questionsByKey.role?.options;
  const painOptions = questionsByKey.pain_points?.options;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepRol
            data={data}
            onUpdate={updateData}
            onNext={handleNext}
            options={roleOptions}
            isSaving={saving}
          />
        );
      case 2:
        return (
          <StepDesgaste
            data={data}
            onUpdate={updateData}
            onNext={handleNext}
            onPrev={prev}
            options={painOptions}
            questionNumber={questionNumber(step)}
            totalQuestions={questionCount}
            isSaving={saving}
          />
        );
      case 3:
        return (
          <StepImpacto
            data={data}
            onUpdate={updateData}
            onNext={handleNext}
            onPrev={prev}
            questionNumber={questionNumber(step)}
            totalQuestions={questionCount}
            isSaving={saving}
          />
        );
      case 4:
        return (
          <StepSolucion
            data={data}
            onUpdate={updateData}
            onNext={handleNext}
            onPrev={prev}
            questionNumber={questionNumber(step)}
            totalQuestions={questionCount}
            isSaving={saving}
          />
        );
      case 5:
        return (
          <StepVision
            data={data}
            onUpdate={updateData}
            onSubmit={handleSubmit}
            onPrev={prev}
            submitting={saving || submitting}
            questionNumber={questionNumber(step)}
            totalQuestions={questionCount}
          />
        );
      case TOTAL_STEPS:
        return <StepConfirmacion />;
      default:
        return null;
    }
  };

  const displayError = saveError || wizardError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="px-4 sm:px-8 py-8"
    >
      <EarlyAccessBadge className="mb-5" />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main wizard */}
        <div className="flex-1 min-w-0">
          {step < TOTAL_STEPS && (
            <div className="mb-6">
              <WizardProgress current={step} total={TOTAL_STEPS} />
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {displayError && (
            <p className="text-[0.82rem] text-error mt-3 px-3 py-2 bg-error-light rounded-md">
              {displayError}
            </p>
          )}
        </div>

        {/* Side panel */}
        {step < TOTAL_STEPS && (
          <div className="hidden lg:block w-[260px] shrink-0 sticky top-8">
            <FeedbackSidePanel />
          </div>
        )}
      </div>

      <DashboardDivider className="mt-8 mb-6" />
      <DashboardFooter />
    </motion.div>
  );
}
