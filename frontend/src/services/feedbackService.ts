/**
 * Feedback API service.
 * Talks to GET /api/v1/feedback/forms/active and POST /api/v1/feedback/submissions.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token') ??
        localStorage.getItem('token') ??
        localStorage.getItem('authToken')
      : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ---------------------------------------------------------------------------
// Types (match backend schemas, snake_case)
// ---------------------------------------------------------------------------

export interface FeedbackOption {
  id: string;
  label: string;
  value: string;
  sort_order: number;
  is_other_option: boolean;
}

export interface FeedbackQuestion {
  id: string;
  step_order: number;
  question_key: string;
  question_text: string;
  question_type: 'single_choice' | 'multi_choice' | 'scale' | 'text';
  help_text: string | null;
  placeholder: string | null;
  is_required: boolean;
  allow_other_text: boolean;
  min_value: number | null;
  max_value: number | null;
  options: FeedbackOption[];
}

export interface FeedbackForm {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  version: number;
  questions: FeedbackQuestion[];
}

export interface FeedbackAnswerResponse {
  id: string;
  question_id: string;
  answer_text: string | null;
  answer_number: number | null;
  answer_json: unknown;
  other_text: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface FeedbackSubmission {
  id: string;
  form_id: string;
  status: 'draft' | 'submitted';
  started_at: string;
  submitted_at: string | null;
  answers: FeedbackAnswerResponse[];
}

export interface FeedbackAnswerInput {
  question_id: string;
  answer_text?: string | null;
  answer_number?: number | null;
  answer_json?: unknown;
  other_text?: string | null;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function getActiveFeedbackForm(): Promise<FeedbackForm> {
  const res = await fetch(`${API_URL}/api/v1/feedback/forms/active`);
  if (res.status === 404) throw new Error('NO_ACTIVE_FORM');
  if (!res.ok) throw new Error('Error al cargar el formulario de feedback');
  return res.json();
}

export async function createOrGetSubmission(): Promise<FeedbackSubmission> {
  const res = await fetch(`${API_URL}/api/v1/feedback/submissions`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? 'Error al iniciar la sesión de feedback');
  }
  return res.json();
}

export async function updateSubmissionAnswers(
  submissionId: string,
  answers: FeedbackAnswerInput[],
): Promise<FeedbackSubmission> {
  const res = await fetch(
    `${API_URL}/api/v1/feedback/submissions/${submissionId}`,
    {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ answers }),
    },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? 'Error al guardar respuestas');
  }
  return res.json();
}

export async function submitFeedbackSubmission(
  submissionId: string,
): Promise<FeedbackSubmission> {
  const res = await fetch(
    `${API_URL}/api/v1/feedback/submissions/${submissionId}/submit`,
    {
      method: 'POST',
      headers: authHeaders(),
    },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail: unknown = body?.detail;
    // Backend returns 400 if already submitted — treat as success so the
    // UI can still show the confirmation screen.
    if (
      res.status === 400 &&
      typeof detail === 'string' &&
      detail.toLowerCase().includes('already submitted')
    ) {
      throw new Error('ALREADY_SUBMITTED');
    }
    throw new Error(typeof detail === 'string' ? detail : 'Error al enviar feedback');
  }
  return res.json();
}
