import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSENT_TTL,
  CONSENT_KEY,
  LANGUAGE_KEY,
  parseConsent,
  saveConsent,
  getConsent,
  migrateLegacyConsent,
} from '../src/lib/consent.ts';

test('El consentimiento caduca a los 180 días y rechaza registros inválidos', () => {
  const savedAt = 1000;
  const record = {
    version: 1,
    preferences: true,
    analytics: false,
    savedAt,
    expiresAt: savedAt + CONSENT_TTL,
  };
  assert.deepEqual(parseConsent(JSON.stringify(record), 2000), record);
  assert.equal(parseConsent(JSON.stringify(record), record.expiresAt), null);
  for (const value of [
    null,
    'invalid',
    JSON.stringify({ ...record, version: 2 }),
    JSON.stringify({ ...record, analytics: 'true' }),
    JSON.stringify({ ...record, expiresAt: Infinity }),
    JSON.stringify({ ...record, expiresAt: record.expiresAt + 1 }),
  ])
    assert.equal(parseConsent(value, 2000), null);
});

test('El rebranding migra consentimiento e idioma sin renovar ni ampliar el permiso', () => {
  const savedAt = Date.now() - 1000;
  const record = {
    version: 1,
    preferences: true,
    analytics: false,
    savedAt,
    expiresAt: savedAt + CONSENT_TTL,
  };
  const values = new Map([
    ['luma.consent', JSON.stringify(record)],
    ['luma.locale', 'en'],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  migrateLegacyConsent(storage);
  assert.deepEqual(parseConsent(values.get(CONSENT_KEY)!), record);
  assert.equal(values.get(LANGUAGE_KEY), 'en');
  assert.equal(values.has('luma.consent'), false);
  assert.equal(values.has('luma.locale'), false);
  const current = JSON.stringify({ ...record, preferences: false });
  values.set(CONSENT_KEY, current);
  values.set('luma.consent', JSON.stringify(record));
  values.set('luma.locale', 'es');
  migrateLegacyConsent(storage);
  assert.equal(values.get(CONSENT_KEY), current);
  values.delete(CONSENT_KEY);
  values.delete(LANGUAGE_KEY);
  values.set('luma.consent', JSON.stringify({ ...record, savedAt: 1, expiresAt: 1 + CONSENT_TTL }));
  values.set('luma.locale', 'en');
  migrateLegacyConsent(storage);
  assert.equal(values.has(CONSENT_KEY), false);
  assert.equal(values.has(LANGUAGE_KEY), false);
});

test('Rechazar guarda una decisión válida y elimina la preferencia de idioma', () => {
  const values = new Map([[LANGUAGE_KEY, 'en']]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
  });
  saveConsent(false, false);
  assert.equal(getConsent()?.preferences, false);
  assert.equal(getConsent()?.analytics, false);
  assert.equal(values.has(LANGUAGE_KEY), false);
  assert.equal(parseConsent(values.get(CONSENT_KEY)!)?.analytics, false);
});

test('Si localStorage falla, la decisión sigue disponible durante la visita', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      setItem: () => {
        throw Error('blocked');
      },
      removeItem: () => {
        throw Error('blocked');
      },
    },
  });
  assert.doesNotThrow(() => saveConsent(true, false));
  assert.equal(getConsent()?.preferences, true);
});
