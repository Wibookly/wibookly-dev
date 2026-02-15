/**
 * AWS API Gateway client.
 *
 * All requests go through this module so we have a single place
 * to attach the Cognito access_token as a Bearer header.
 */

const API_BASE = 'https://f4rjhkx0cg.execute-api.us-west-2.amazonaws.com';
const TOKEN_KEY = 'cognito_tokens';

// ── Token helpers ──────────────────────────────────────────────────

export interface CognitoTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  obtained_at: number;
}

export function getStoredTokens(): CognitoTokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CognitoTokens;
  } catch {
    return null;
  }
}

export function storeTokens(tokens: CognitoTokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return getStoredTokens()?.access_token ?? null;
}

// ── Fetch wrapper ──────────────────────────────────────────────────

interface ApiOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  /** Skip the Authorization header (e.g. for public endpoints) */
  noAuth?: boolean;
}

/**
 * Typed fetch wrapper that automatically attaches the Cognito
 * access_token and points to the API Gateway base URL.
 *
 * Usage:
 *   const data = await api<MyType>('/users/me');
 *   const list = await api<Item[]>('/items', { method: 'POST', body: JSON.stringify(payload) });
 */
export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { noAuth, headers: extraHeaders, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (!noAuth) {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Not authenticated — no access token found.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...fetchOpts, headers });

  if (res.status === 401) {
    // Token expired or invalid — clear and redirect to login
    clearTokens();
    window.location.href = '/auth';
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `API error ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export default api;
