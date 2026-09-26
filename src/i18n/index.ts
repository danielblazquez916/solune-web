import { useSyncExternalStore } from 'react';
import es from './locales/es.json';
import en from './locales/en.json';
import { getConsent, subscribeConsent, LANGUAGE_KEY } from '../lib/consent';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export type MessageKey = keyof typeof es;
type Values = Record<string, string | number>;

const catalogs: Record<Locale, Record<MessageKey, string>> = { es, en };
const listeners = new Set<() => void>();
const storageKey = LANGUAGE_KEY;

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

function readLocale(): Locale {
  if (typeof window === 'undefined') return 'es';
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (isLocale(requested)) return requested;
  try {
    const saved = getConsent()?.preferences ? localStorage.getItem(storageKey) : null;
    if (isLocale(saved)) return saved;
  } catch {
    /* Private browsing may disable storage. */
  }
  return 'es';
}

let locale: Locale = readLocale();

export function getLocale() {
  return locale;
}

export function setLocale(next: Locale) {
  if (!isLocale(next)) return;
  locale = next;
  document.documentElement.lang = next;
  try {
    if (getConsent()?.preferences) localStorage.setItem(storageKey, next);
    else localStorage.removeItem(storageKey);
  } catch {
    /* The in-memory preference still works. */
  }
  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  window.history.replaceState(window.history.state, '', url);
  listeners.forEach((listener) => listener());
}

export function translate(key: MessageKey, language: Locale, values: Values = {}) {
  return catalogs[language][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    String(values[name] ?? match),
  );
}

export function t(key: MessageKey, values?: Values) {
  return translate(key, locale, values);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useLocale() {
  return useSyncExternalStore(subscribe, getLocale, () => 'es' as Locale);
}

if (typeof window !== 'undefined') {
  document.documentElement.lang = locale;
  subscribeConsent(() => {
    try {
      if (getConsent()?.preferences) localStorage.setItem(storageKey, locale);
      else localStorage.removeItem(storageKey);
    } catch {
      /* In-memory language remains available. */
    }
  });
  window.addEventListener('storage', (event) => {
    if (getConsent()?.preferences && event.key === storageKey && isLocale(event.newValue)) {
      locale = event.newValue;
      document.documentElement.lang = locale;
      listeners.forEach((listener) => listener());
    }
  });
}
