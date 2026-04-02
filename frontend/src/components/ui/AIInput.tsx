'use client';

import {
  useRef,
  useState,
  useCallback,
  type InputHTMLAttributes,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import { AIAssistBar } from './AIAssistBar';
import type { AIAction } from '@/hooks/useAIAssist';

interface AIInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAIResult?: (newText: string, action: AIAction) => void;
  wrapperStyle?: React.CSSProperties;
  wrapperClassName?: string;
}

export function AIInput({
  value,
  onChange,
  onAIResult,
  wrapperStyle,
  wrapperClassName,
  onKeyDown: externalKeyDown,
  style,
  ...props
}: AIInputProps) {
  const [aiOpen, setAIOpen] = useState(false);
  const [slashMode, setSlashMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!value.trim() && !aiOpen) {
        if (e.key === ' ') {
          e.preventDefault();
          setSlashMode(false);
          setAIOpen(true);
          return;
        }
        if (e.key === '/') {
          e.preventDefault();
          setSlashMode(true);
          setAIOpen(true);
          return;
        }
      }
      externalKeyDown?.(e);
    },
    [value, aiOpen, externalKeyDown]
  );

  function handleAIResult(newText: string, action: AIAction) {
    const nativeInput = inputRef.current;
    if (nativeInput) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      setter?.call(nativeInput, newText);
      nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    onAIResult?.(newText, action);
    setAIOpen(false);
  }

  return (
    <div style={{ position: 'relative', ...wrapperStyle }} className={wrapperClassName}>
      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        style={{ width: '100%', boxSizing: 'border-box', ...style }}
        {...props}
      />

      {/* Hint — visible only when field is empty */}
      {!value.trim() && !aiOpen && (
        <span
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <strong>Espacio</strong> para IA · <strong>/</strong> comandos
        </span>
      )}

      <AnimatePresence>
        {aiOpen && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(640px, calc(100vw - 32px))',
              zIndex: 9999,
            }}
          >
            <AIAssistBar
              currentText={value}
              onResult={handleAIResult}
              onClose={() => setAIOpen(false)}
              slashMode={slashMode}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
