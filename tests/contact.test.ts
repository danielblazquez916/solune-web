import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, type ContactData } from '../src/lib/contact.ts';

const valid: ContactData = {
  name: 'Lucía Martín',
  email: 'lucia+web@example.com',
  company: 'Proyecto personal',
  phone: '+34 600 123 456',
  message: 'Queremos renovar la web de nuestro estudio independiente.',
  privacy: true,
};

test('Acepta el formulario sin servicio ni presupuesto y con teléfono opcional', () => {
  assert.deepEqual(validateContact(valid), {});
  assert.deepEqual(validateContact({ ...valid, phone: '' }), {});
});

test('Impide continuar con campos vacíos o solo espacios y sin consentimiento', () => {
  const issues = validateContact({
    name: '  ',
    email: '',
    company: '  ',
    phone: '',
    message: '  ',
    privacy: false,
  });
  assert.deepEqual(Object.keys(issues).sort(), ['company', 'email', 'message', 'name', 'privacy']);
});

test('Detecta email, teléfono y mensaje inválidos sin rechazar el resto', () => {
  assert.deepEqual(
    Object.keys(
      validateContact({ ...valid, email: 'a@', phone: 'llámame', message: 'Hola' }),
    ).sort(),
    ['email', 'message', 'phone'],
  );
});

test('No acepta saltarse el consentimiento con el resto de datos válido', () => {
  assert.deepEqual(Object.keys(validateContact({ ...valid, privacy: false })), ['privacy']);
});
