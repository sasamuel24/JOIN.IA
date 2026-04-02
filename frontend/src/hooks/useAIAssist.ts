'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token') ??
        localStorage.getItem('token') ??
        ''
      : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type AIAction =
  | 'improve'
  | 'expand'
  | 'shorten'
  | 'rephrase'
  | 'generate'
  | 'fix';

export interface AIAssistOptions {
  action: AIAction;
  prompt: string;
  existingText?: string;
}

export function useAIAssist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assist(options: AIAssistOptions): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/ai/assist`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          action: options.action,
          prompt: options.prompt,
          existing_text: options.existingText ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Error al contactar la IA');
      }

      const data = await res.json();
      return data.result as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { assist, loading, error };
}
