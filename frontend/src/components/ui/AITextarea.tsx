'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type TextareaHTMLAttributes,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AIAssistBar } from './AIAssistBar';
import type { AIAction } from '@/hooks/useAIAssist';

interface AITextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAIResult?: (newText: string, action: AIAction) => void;
  wrapperStyle?: React.CSSProperties;
}

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
  const [barBottom, setBarBottom] = useState(24);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fix mobile: reposition bar above the virtual keyboard using visualViewport
  useEffect(() => {
    if (!aiOpen) return;
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      const offsetFromBottom = window.innerHeight - vv!.height - vv!.offsetTop;
      setBarBottom(Math.max(24, offsetFromBottom + 8));
    }

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [aiOpen]);

  // Desktop: keydown events (Space / slash)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  // Mobile fallback: detect space / slash via onChange value
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      if (!value.trim() && !aiOpen) {
        // Space (regular or non-breaking) typed into empty field
        if (newVal === ' ' || newVal === '\u00a0') {
          setSlashMode(false);
          setAIOpen(true);
          return; // swallow the space, don't propagate to parent
        }
        // Slash typed into empty field
        if (newVal === '/') {
          setSlashMode(true);
          setAIOpen(true);
          return; // swallow the slash
        }
      }
      onChange(e);
    },
    [value, aiOpen, onChange]
  );

  function handleAIResult(newText: string, action: AIAction) {
    const nativeInput = textareaRef.current;
    if (nativeInput) {
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
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{ width: '100%', boxSizing: 'border-box', ...style }}
        {...props}
      />

      {/* Hint + tap button — visible when field is empty */}
      {!value.trim() && !aiOpen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 4,
            marginTop: '4px',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              userSelect: 'none',
            }}
          >
            <strong>Espacio</strong> para IA · <strong>/</strong> comandos
          </span>
          {/* Tap button for mobile */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setSlashMode(false);
              setAIOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
            }}
            aria-label="Abrir asistente IA"
          >
            <Sparkles size={13} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {aiOpen && (
          <div
            style={{
              position: 'fixed',
              bottom: barBottom,
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
