'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useFeedbackWizard } from '@/hooks/useFeedbackWizard';
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

export function FeedbackWizard() {
  const {
    step, TOTAL_STEPS, data, direction, submitting, submitted, error,
    updateData, next, prev, submit,
  } = useFeedbackWizard();

  const renderStep = () => {
    switch (step) {
      case 1: return <StepRol data={data} onUpdate={updateData} onNext={next} />;
      case 2: return <StepDesgaste data={data} onUpdate={updateData} onNext={next} onPrev={prev} />;
      case 3: return <StepImpacto data={data} onUpdate={updateData} onNext={next} onPrev={prev} />;
      case 4: return <StepSolucion data={data} onUpdate={updateData} onNext={next} onPrev={prev} />;
      case 5: return <StepVision data={data} onUpdate={updateData} onSubmit={submit} onPrev={prev} submitting={submitting} />;
      case 6: return <StepConfirmacion />;
      default: return null;
    }
  };

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

          {error && (
            <p className="text-[0.82rem] text-error mt-3 px-3 py-2 bg-error-light rounded-md">
              {error}
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
