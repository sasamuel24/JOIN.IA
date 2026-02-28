'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function StepConfirmacion() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-[72px] h-[72px] rounded-full bg-accent flex items-center justify-center mb-6"
      >
        <motion.svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12l5 5L20 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3 }} />
        </motion.svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-[1.75rem] font-bold mb-2"
      >
        Gracias por tu{' '}
        <span className="italic bg-gradient-to-r from-accent to-[#00e6b8] bg-clip-text text-transparent">confianza.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="text-[0.95rem] text-text-secondary max-w-[420px] leading-relaxed mb-8"
      >
        Cada respuesta es oro para nosotros. Estamos leyendo cada una para asegurarnos de que
        JOIN.IA resuelva lo que de verdad importa.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => router.push('/dashboard')}
        className="px-7 py-2.5 rounded-md border-none bg-accent text-white text-sm font-semibold cursor-pointer hover:bg-accent-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        Volver al inicio &rarr;
      </motion.button>
    </div>
  );
}
