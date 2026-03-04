/**
 * User profile API service. Types match backend schemas (snake_case).
 */

const getBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    const env = process.env as Record<string, string | undefined>;
    return (
      env.NEXT_PUBLIC_API_BASE_URL ??
      env.NEXT_PUBLIC_API_URL ??
      env.VITE_API_BASE_URL ??
      env.REACT_APP_API_BASE_URL ??
      ''
    );
  }
  return '';
};

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('access_token') ??
    localStorage.getItem('token') ??
    localStorage.getItem('authToken')
  );
};

async function request<T>(
  path: string,
  options: RequestInit & { method?: string; body?: unknown } = {}
): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const init: RequestInit = {
    ...options,
    headers: { ...headers, ...options.headers },
  };
  if (options.body !== undefined && options.method !== 'GET') {
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }
  const res = await fetch(url, init);
   // If token is invalid/expired, force logout
   if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
  }
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      if (json.detail) {
        message = Array.isArray(json.detail)
          ? json.detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join(', ')
          : typeof json.detail === 'string'
            ? json.detail
            : JSON.stringify(json.detail);
      }
    } catch {
      // keep message as text
    }
    throw new Error(message || `HTTP ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// --- Types (snake_case, matching backend) ---

export interface UserProfileResponse {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  title: string | null;
  bio: string | null;
  company: string | null;
  industry: string | null;
  team_size: string | null;
  country: string | null;
  pain_points: string[] | null;
  notif_product: boolean | null;
  notif_community: boolean | null;
  notif_feedback: boolean | null;
  group: string | null;
  access_tier: string | null;
  provider: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  title?: string | null;
  bio?: string | null;
  company?: string | null;
  industry?: string | null;
  team_size?: string | null;
  country?: string | null;
  pain_points?: string[] | null;
  notif_product?: boolean | null;
  notif_community?: boolean | null;
  notif_feedback?: boolean | null;
  group?: string | null;
  access_tier?: string | null;
}

// --- API ---

const USERS_ME = '/api/v1/users/me';

export function getMe(): Promise<UserProfileResponse> {
  return request<UserProfileResponse>(USERS_ME, { method: 'GET' });
}

export function patchMe(payload: UserProfileUpdate): Promise<UserProfileResponse> {
  return request<UserProfileResponse>(USERS_ME, { method: 'PATCH', body: payload });
}
