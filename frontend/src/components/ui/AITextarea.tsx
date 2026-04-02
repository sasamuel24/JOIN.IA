'use client';

import {
  useRef,
  useState,
  useCallback,
  type TextareaHTMLAttributes,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import { AIAssistBar } from './AIAssistBar';
import type { AIAction } from '@/hooks/useAIAssist';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AITextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Called when AI replaces or inserts text */
  onAIResult?: (newText: string, action: AIAction) => void;
  /** Extra wrapper style */
  wrapperStyle?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AITextarea({
  value,
  onChange,
  onAIResult,
  wrapperStyle,
  onKeyDown: externalKeyDown,
  style,
  ...props
}: AITextareaProps) {
  const [aiOpen, setAIOpen] = useState(false);
  const [slashMode, setSlashMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Space on empty field → open AI in generate mode
      if (e.key === ' ' && !value.trim() && !aiOpen) {
        e.preventDefault();
        setSlashMode(false);
        setAIOpen(true);
        return;
      }

      // "/" at start of text → open command menu
      if (e.key === '/' && !value.trim() && !aiOpen) {
        e.preventDefault();
        setSlashMode(true);
        setAIOpen(true);
        return;
      }

      externalKeyDown?.(e);
    },
    [value, aiOpen, externalKeyDown]
  );

  function handleAIResult(newText: string, action: AIAction) {
    // Synthetic event to keep the parent's onChange compatible
    const nativeInput = textareaRef.current;
    if (nativeInput) {
      // Use Object.getOwnPropertyDescriptor to trigger React's synthetic event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(nativeInput, newText);
      nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    onAIResult?.(newText, action);
    setAIOpen(false);
  }

  return (
    <div style={{ position: 'relative', ...wrapperStyle }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />

      {/* AI hint when field is empty and AI is not open */}
      {!value.trim() && !aiOpen && (
        <span
          style={{
            display: 'block',
            marginTop: '4px',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textAlign: 'right',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          Presiona <strong>Espacio</strong> para IA · <strong>/</strong> para comandos
        </span>
      )}

      <AnimatePresence>
        {aiOpen && (
          /* Portal-like: fixed positioning so no parent overflow clips it */
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
