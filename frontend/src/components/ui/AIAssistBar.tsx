'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Sparkles, X } from 'lucide-react';
import { useAIAssist, type AIAction } from '@/hooks/useAIAssist';

// ---------------------------------------------------------------------------
// Slash commands menu
// ---------------------------------------------------------------------------

interface SlashCommand {
  action: AIAction;
  label: string;
  description: string;
  emoji: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { action: 'improve',   label: 'Mejorar texto',       description: 'Mejora claridad y estilo',        emoji: '✨' },
  { action: 'fix',       label: 'Corregir ortografía', description: 'Corrige errores gramaticales',     emoji: '🔤' },
  { action: 'expand',    label: 'Expandir',             description: 'Añade más detalle y contexto',    emoji: '➕' },
  { action: 'shorten',   label: 'Acortar',              description: 'Resume manteniendo las ideas',    emoji: '✂️' },
  { action: 'rephrase',  label: 'Reformular',           description: 'Reescribe con otras palabras',    emoji: '🔄' },
  { action: 'generate',  label: 'Redactar desde cero',  description: 'Genera texto con tu instrucción', emoji: '📝' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AIAssistBarProps {
  /** Current text in the textarea (used as context) */
  currentText: string;
  /** Called when AI produces a result — caller decides how to apply it */
  onResult: (text: string, action: AIAction) => void;
  /** Called when the bar should close */
  onClose: () => void;
  /** If true, open directly in slash-command menu mode */
  slashMode?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIAssistBar({ currentText, onResult, onClose, slashMode = false }: AIAssistBarProps) {
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(slashMode);
  const [selectedAction, setSelectedAction] = useState<SlashCommand | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { assist, loading } = useAIAssist();

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Watch for "/" to open command menu
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    if (val === '/') {
      setShowCommands(true);
      setInput('');
    } else {
      setShowCommands(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && !e.shiftKey && !showCommands) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  async function handleSubmit(command?: SlashCommand) {
    const cmd = command ?? selectedAction;
    const action: AIAction = cmd?.action ?? 'generate';
    const prompt = input.trim() || currentText.trim();

    if (!prompt) return;

    const result = await assist({
      action,
      prompt: action === 'generate' ? prompt : prompt,
      existingText: action !== 'generate' ? currentText : undefined,
    });

    if (result) {
      onResult(result, action);
      onClose();
    }
  }

  function handleCommandSelect(cmd: SlashCommand) {
    setShowCommands(false);
    setSelectedAction(cmd);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const placeholderText = selectedAction
    ? `${selectedAction.emoji} ${selectedAction.label} — escribe una instrucción adicional o envía`
    : 'Pregúntale a la IA lo que quieras... (/ para comandos)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 'calc(100% + 8px)',
        zIndex: 50,
      }}
    >
      {/* Slash commands dropdown */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              marginBottom: '6px',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '8px 12px 6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--border-color)',
            }}>
              Comandos de IA
            </div>
            {SLASH_COMMANDS.map(cmd => (
              <button
                key={cmd.action}
                onClick={() => handleCommandSelect(cmd)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-neutral)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{cmd.emoji}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {cmd.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {cmd.description}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'var(--bg-white)',
        border: '1.5px solid var(--border-color)',
        borderRadius: '12px',
        padding: '10px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {/* JOIN.IA logo mark */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
              }}
            />
          ) : (
            <Sparkles size={13} color="#fff" />
          )}
        </div>

        {/* Selected action chip */}
        {selectedAction && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-neutral)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {selectedAction.emoji} {selectedAction.label}
            <button
              onClick={() => setSelectedAction(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'var(--text-muted)' }}
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={loading}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '0.88rem',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-main)',
            minWidth: 0,
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <X size={15} />
        </button>

        {/* Submit */}
        <button
          onClick={() => void handleSubmit()}
          disabled={loading || (!input.trim() && !currentText.trim())}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: loading || (!input.trim() && !currentText.trim())
              ? 'var(--bg-neutral)'
              : 'var(--accent)',
            border: 'none',
            cursor: loading || (!input.trim() && !currentText.trim()) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <ArrowUp
            size={14}
            color={loading || (!input.trim() && !currentText.trim()) ? 'var(--text-muted)' : '#fff'}
          />
        </button>
      </div>

      {/* Hint */}
      {!showCommands && !selectedAction && (
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginTop: '5px',
        }}>
          Escribe <kbd style={{ background: 'var(--bg-neutral)', borderRadius: 3, padding: '0 4px', fontSize: '0.7rem' }}>/</kbd> para ver comandos · <kbd style={{ background: 'var(--bg-neutral)', borderRadius: 3, padding: '0 4px', fontSize: '0.7rem' }}>Esc</kbd> para cerrar
        </p>
      )}
    </motion.div>
  );
}
