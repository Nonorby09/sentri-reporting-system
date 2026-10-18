// authUtils.js — Sentri Remote Reporting System Authentication Utilities
// Uses the Web Crypto API (available in all modern browsers — no external library needed)

const SENTRI_SESSION_KEY   = 'sentri_session_token';
const SENTRI_REMEMBER_KEY  = 'sentri_remember_session';
const SENTRI_SESSION_USER  = 'sentri_session_user_id';
const SENTRI_FAILED_ATTEMPTS = 'sentri_failed_attempts';
const SENTRI_LOCKOUT_UNTIL   = 'sentri_lockout_until';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS  = 15 * 60 * 1000; // 15 minutes

// ─── Password Hashing ────────────────────────────────────────────────────────

/**
 * Hash a plain-text password using SHA-256 via the Web Crypto API.
 * Returns a lowercase hex string.
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Session Management ───────────────────────────────────────────────────────

/**
 * Generate a cryptographically random UUID v4-style session token.
 */
export function generateSessionToken() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

/**
 * Save session. If rememberMe=true, persists to localStorage across restarts.
 */
export function saveSession(token, userId, rememberMe = false) {
  sessionStorage.setItem(SENTRI_SESSION_KEY,  token);
  sessionStorage.setItem(SENTRI_SESSION_USER, userId);
  if (rememberMe) {
    localStorage.setItem(SENTRI_REMEMBER_KEY,  token);
    localStorage.setItem(SENTRI_SESSION_USER, userId);
  }
}

/**
 * Read the active session token (sessionStorage first, then localStorage).
 */
export function getActiveSession() {
  const sessionToken = sessionStorage.getItem(SENTRI_SESSION_KEY);
  const sessionUser  = sessionStorage.getItem(SENTRI_SESSION_USER);
  if (sessionToken && sessionUser) return { token: sessionToken, userId: sessionUser };

  const rememberedToken = localStorage.getItem(SENTRI_REMEMBER_KEY);
  const rememberedUser  = localStorage.getItem(SENTRI_SESSION_USER);
  if (rememberedToken && rememberedUser) {
    sessionStorage.setItem(SENTRI_SESSION_KEY,  rememberedToken);
    sessionStorage.setItem(SENTRI_SESSION_USER, rememberedUser);
    return { token: rememberedToken, userId: rememberedUser };
  }
  return null;
}

/**
 * Clear session from both storages.
 */
export function clearSession() {
  sessionStorage.removeItem(SENTRI_SESSION_KEY);
  sessionStorage.removeItem(SENTRI_SESSION_USER);
  localStorage.removeItem(SENTRI_REMEMBER_KEY);
  localStorage.removeItem(SENTRI_SESSION_USER);
}

/**
 * Check if the user is currently authenticated.
 */
export function isSessionActive() {
  return Boolean(getActiveSession());
}

// ─── Brute-Force Protection ───────────────────────────────────────────────────

export function getFailedAttempts() {
  return parseInt(localStorage.getItem(SENTRI_FAILED_ATTEMPTS) || '0', 10);
}

export function recordFailedAttempt() {
  const current = getFailedAttempts() + 1;
  localStorage.setItem(SENTRI_FAILED_ATTEMPTS, String(current));
  if (current >= MAX_FAILED_ATTEMPTS) {
    const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(SENTRI_LOCKOUT_UNTIL, String(lockUntil));
  }
  return current;
}

export function clearFailedAttempts() {
  localStorage.removeItem(SENTRI_FAILED_ATTEMPTS);
  localStorage.removeItem(SENTRI_LOCKOUT_UNTIL);
}

export function getLockoutInfo() {
  const lockUntil = parseInt(localStorage.getItem(SENTRI_LOCKOUT_UNTIL) || '0', 10);
  if (!lockUntil) return { locked: false, remainingMs: 0 };
  const remainingMs = lockUntil - Date.now();
  if (remainingMs <= 0) {
    clearFailedAttempts();
    return { locked: false, remainingMs: 0 };
  }
  return { locked: true, remainingMs };
}

// ─── Password Strength ────────────────────────────────────────────────────────

/**
 * Returns { score: 0–4, label, color, checks } for a given password.
 * score: 0=Very Weak, 1=Weak, 2=Fair, 3=Strong, 4=Very Strong
 */
export function getPasswordStrength(password) {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const map = [
    { label: 'Very Weak',  color: 'bg-rose-500',   text: 'text-rose-600'   },
    { label: 'Weak',       color: 'bg-orange-500',  text: 'text-orange-600' },
    { label: 'Fair',       color: 'bg-amber-500',   text: 'text-amber-600'  },
    { label: 'Strong',     color: 'bg-emerald-500', text: 'text-emerald-600'},
    { label: 'Very Strong',color: 'bg-green-600',   text: 'text-green-700'  },
  ];
  return { score, checks, ...map[Math.min(score, 4)] };
}
