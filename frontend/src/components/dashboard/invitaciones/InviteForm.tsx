'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface InviteFormProps {
  onSubmit: (email: string) => Promise<void>;
  sending: boolean;
  disabled?: boolean;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function InviteForm({ onSubmit, sending, disabled = false }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setValidationError('Ingresa un correo electrónico');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setValidationError('El correo electrónico no es válido');
      return;
    }

    await onSubmit(trimmed);
    setEmail('');
  };

  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
        Invitar por correo
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="correo@empresa.com"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (validationError) setValidationError('');
          }}
          disabled={sending || disabled}
          error={!!validationError}
          className="flex-1"
        />
        <button
          type="submit"
          disabled={sending || disabled}
          className="px-5 py-2.5 rounded-md border-none bg-accent text-white text-[0.85rem] font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150 hover:bg-accent-dark disabled:bg-accent-glow disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          {sending && <Loader2 size={14} className="animate-spin" />}
          Enviar invitación
        </button>
      </form>
      {validationError && (
        <p className="text-xs text-error mt-1">{validationError}</p>
      )}
    </div>
  );
}
