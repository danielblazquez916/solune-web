import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContact } from '../src/lib/contact.ts';

const readCatalog = (locale: string): Record<string, string> =>
  JSON.parse(readFileSync(new URL(`../src/i18n/locales/${locale}.json`, import.meta.url), 'utf8'));
const es = readCatalog('es');
const en = readCatalog('en');

test('Los idiomas tienen las mismas claves y ningún mensaje vacío', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort());
  for (const catalog of [es, en]) {
    for (const [key, value] of Object.entries(catalog)) {
      assert.ok(typeof value === 'string' && value.trim(), key);
    }
  }
});

test('Las traducciones conservan todos los parámetros interpolados', () => {
  const parameters = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const key of Object.keys(es))
    assert.deepEqual(parameters(es[key]), parameters(en[key]), key);
});

test('Cada error del formulario está disponible en ambos idiomas', () => {
  const errors = validateContact({
    name: '',
    email: '',
    company: '',
    phone: 'invalid',
    message: '',
    privacy: false,
  });
  for (const key of Object.values(errors)) {
    assert.ok(es[key], key);
    assert.ok(en[key], key);
  }
});
