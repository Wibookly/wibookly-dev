/**
 * PKCE verifier storage with cookie fallback.
 *
 * Some browsers (especially Incognito/private mode) clear localStorage
 * during cross-origin redirects. We store the verifier in BOTH localStorage
 * and a same-site cookie to maximise survival.
 */

const STORAGE_KEY = 'cognito_code_verifier';
const COOKIE_NAME = 'pkce_verifier';
const COOKIE_MAX_AGE = 600; // 10 minutes — more than enough for the OAuth round-trip

// ── Cookie helpers ──────────────────────────────────────────────────

function setCookie(name: string, value: string, maxAge: number) {
  // SameSite=Lax allows the cookie to be sent on top-level navigations (redirects)
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure`;
}

// ── Public API ──────────────────────────────────────────────────────

/** Save the PKCE verifier to both localStorage and a cookie. */
export function savePkceVerifier(verifier: string) {
  try {
    localStorage.setItem(STORAGE_KEY, verifier);
  } catch {
    // localStorage may be unavailable in some contexts
  }
  setCookie(COOKIE_NAME, verifier, COOKIE_MAX_AGE);

  console.log('[PKCE-storage] saved verifier, length:', verifier.length);
}

/** Read the PKCE verifier from localStorage (primary) or cookie (fallback). */
export function readPkceVerifier(): string | null {
  const fromLS = localStorage.getItem(STORAGE_KEY);
  const fromCookie = getCookie(COOKIE_NAME);

  console.log('[PKCE-storage] localStorage:', Boolean(fromLS), '| cookie:', Boolean(fromCookie));

  return fromLS || fromCookie || null;
}

/** Remove the PKCE verifier from all stores (call after token exchange). */
export function clearPkceVerifier() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  deleteCookie(COOKIE_NAME);
}
