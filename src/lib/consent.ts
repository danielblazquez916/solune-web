export const CONSENT_KEY = 'solune.consent';
export const LANGUAGE_KEY = 'solune.locale';
// Read the former brand keys once, preserving the original decision and expiry.
const LEGACY_CONSENT_KEY = 'luma.consent';
const LEGACY_LANGUAGE_KEY = 'luma.locale';
export const CONSENT_DAYS = 180;
export const CONSENT_TTL = CONSENT_DAYS * 86400000;
export type Consent = {
  version: 1;
  preferences: boolean;
  analytics: boolean;
  savedAt: number;
  expiresAt: number;
};

export function parseConsent(raw: string | null, now = Date.now()): Consent | null {
  try {
    const value = JSON.parse(raw || 'null');
    if (
      value?.version !== 1 ||
      typeof value.preferences !== 'boolean' ||
      typeof value.analytics !== 'boolean' ||
      !Number.isFinite(value.savedAt) ||
      !Number.isFinite(value.expiresAt) ||
      value.savedAt > now ||
      value.expiresAt <= now ||
      value.expiresAt - value.savedAt !== CONSENT_TTL
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

export function migrateLegacyConsent(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
  if (storage.getItem(CONSENT_KEY) === null) {
    const raw = storage.getItem(LEGACY_CONSENT_KEY);
    const previous = parseConsent(raw);
    if (previous && raw) {
      storage.setItem(CONSENT_KEY, raw);
      const language = storage.getItem(LEGACY_LANGUAGE_KEY);
      if (
        previous.preferences &&
        (language === 'es' || language === 'en') &&
        storage.getItem(LANGUAGE_KEY) === null
      )
        storage.setItem(LANGUAGE_KEY, language);
    }
  }
  storage.removeItem(LEGACY_CONSENT_KEY);
  storage.removeItem(LEGACY_LANGUAGE_KEY);
}

function read(): Consent | null {
  try {
    migrateLegacyConsent(localStorage);
    const value = parseConsent(localStorage.getItem(CONSENT_KEY));
    if (!value) localStorage.removeItem(CONSENT_KEY);
    if (!value?.preferences) localStorage.removeItem(LANGUAGE_KEY);
    return value;
  } catch {
    return null;
  }
}

let current = typeof window === 'undefined' ? null : read();
const listeners = new Set<() => void>();
export const getConsent = () => current;
export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function notify() {
  listeners.forEach((listener) => listener());
}
export function saveConsent(preferences: boolean, analytics: boolean) {
  const savedAt = Date.now();
  current = { version: 1, preferences, analytics, savedAt, expiresAt: savedAt + CONSENT_TTL };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(current));
    if (!preferences) localStorage.removeItem(LANGUAGE_KEY);
  } catch {
    /* Keep the decision in memory when browser storage is unavailable. */
  }
  notify();
}
export function refreshConsent() {
  if (current && current.expiresAt <= Date.now()) {
    current = null;
    try {
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(LANGUAGE_KEY);
    } catch {
      /* Unavailable storage. */
    }
    notify();
  }
}
export function openCookieSettings() {
  window.dispatchEvent(new Event('solune:cookie-settings'));
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === CONSENT_KEY || event.key === null) {
      current = read();
      notify();
    }
  });
}
