import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleContact, type Env } from '../worker/src/index.ts';
import { submitContactForm, ContactRequestError } from '../src/lib/contact.ts';

const data = {
  name: ' Ana García ',
  email: 'ana@example.com',
  company: ' Estudio ',
  phone: '+34 600 123 456',
  message: 'Una consulta de prueba suficientemente larga.',
  privacy: true,
};
const valid = { ...data, turnstileToken: 'test-only-token' };
function setup(
  options: {
    verification?: unknown;
    verifyError?: boolean;
    mailError?: boolean;
    secret?: string;
    pending?: Promise<void>;
  } = {},
) {
  const mail: unknown[] = [];
  let validations = 0;
  const env: Env = {
    ENVIRONMENT: 'production',
    ALLOWED_ORIGINS: 'https://solune.dev,https://www.solune.dev',
    TURNSTILE_SECRET_KEY: options.secret ?? 'unit-test-not-a-real-secret',
    RESEND_API_KEY: 'unit-test-not-a-real-secret',
  };
  const verify = (async (url, init) => {
    assert.equal(init?.method, 'POST');
    if (url === 'https://api.resend.com/emails') {
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer ' + env.RESEND_API_KEY);
      await options.pending;
      if (options.mailError)
        return Response.json({ error: 'private provider detail' }, { status: 503 });
      mail.push(JSON.parse(init?.body as string));
      return Response.json({ id: 'test-message-id' });
    }
    validations++;
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(JSON.parse(init?.body as string).secret, env.TURNSTILE_SECRET_KEY);
    if (options.verifyError) throw new Error('private network detail');
    return Response.json(
      options.verification ?? {
        success: true,
        hostname: 'solune.dev',
        action: 'contact',
        challenge_ts: new Date().toISOString(),
      },
    );
  }) as typeof fetch;
  const run = (
    payload: unknown = valid,
    method = 'POST',
    origin = 'https://solune.dev',
    extraHeaders: Record<string, string> = {},
  ) =>
    handleContact(
      new Request('https://api.solune.dev/contact', {
        method,
        headers: { Origin: origin, 'Content-Type': 'application/json', ...extraHeaders },
        ...(method === 'POST' ? { body: JSON.stringify(payload) } : {}),
      }),
      env,
      verify,
    );
  return { run, mail, env, verify, validations: () => validations };
}

test('Payload y Turnstile válidos: correo Resend con destinatario fijo, Reply-To y texto normalizado', async () => {
  const s = setup();
  const response = await s.run();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, code: 'sent' });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://solune.dev');
  assert.equal(s.mail.length, 1);
  assert.deepEqual(s.mail[0], {
    from: 'Solune · Web <formularios@solune.dev>',
    to: ['hola@solune.dev'],
    reply_to: 'ana@example.com',
    subject: 'Nueva consulta desde Solune',
    text: 'Nombre:\nAna García\n\nEmpresa / negocio:\nEstudio\n\nEmail:\nana@example.com\n\nTeléfono:\n+34 600 123 456\n\nMensaje:\nUna consulta de prueba suficientemente larga.',
  });
});
test('Token ausente, vacío o demasiado largo: 403 sin verificar ni enviar correo', async () => {
  for (const token of [undefined, '', 42, 'a'.repeat(2049)]) {
    const s = setup();
    assert.equal((await s.run({ ...valid, turnstileToken: token })).status, 403);
    assert.equal(s.mail.length, 0);
    assert.equal(s.validations(), 0);
  }
});
test('Token inválido, expirado, hostname o action incorrectos: 403 sin correo', async () => {
  const base = {
    success: true,
    hostname: 'solune.dev',
    action: 'contact',
    challenge_ts: new Date().toISOString(),
  };
  for (const override of [
    { success: false },
    { hostname: 'attacker.dev' },
    { action: 'login' },
    { challenge_ts: new Date(Date.now() - 301000).toISOString() },
    { challenge_ts: 'invalid' },
  ]) {
    const s = setup({ verification: { ...base, ...override } });
    assert.equal((await s.run()).status, 403);
    assert.equal(s.mail.length, 0);
  }
});
test('Campos requeridos, tipos, email, teléfono, longitudes y propiedades ajenas: 400', async () => {
  for (const override of [
    { name: undefined },
    { company: '' },
    { email: 'bad@' },
    { email: 'a@example.com\r\nBcc: x@example.com' },
    { name: {} },
    { privacy: 'true' },
    { message: [] },
    { message: 'a'.repeat(5001) },
    { phone: 'abcdefg' },
    { name: 'a'.repeat(161) },
    { to: 'other@example.com' },
  ]) {
    const s = setup();
    assert.equal(
      (await s.run({ ...valid, ...override })).status,
      400,
      JSON.stringify(override).slice(0, 80),
    );
    assert.equal(s.mail.length, 0);
    assert.equal(s.validations(), 0);
  }
});
test('GET devuelve 405 y Allow; origen ajeno/ausente/null rechaza POST', async () => {
  const s = setup();
  const get = await s.run(undefined, 'GET');
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('Allow'), 'POST, OPTIONS');
  for (const origin of [
    'https://attacker.dev',
    'https://solune.dev.attacker.dev',
    '',
    'null',
    'http://localhost:5173',
  ]) {
    const res = await s.run(valid, 'POST', origin);
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
  }
  assert.equal(s.mail.length, 0);
});
test('Preflight limitado a POST y Content-Type del origen autorizado', async () => {
  const s = setup();
  const response = await s.run(undefined, 'OPTIONS', 'https://solune.dev', {
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type',
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'POST');
  assert.equal(
    (
      await s.run(undefined, 'OPTIONS', 'https://solune.dev', {
        'Access-Control-Request-Method': 'DELETE',
      })
    ).status,
    403,
  );
  assert.equal(s.validations(), 0);
});
test('Errores de Siteverify, secret ausente o correo se redactan y no dan éxito', async () => {
  for (const [options, code] of [
    [{ verifyError: true }, 503],
    [{ mailError: true }, 502],
    [{ secret: '' }, 503],
  ] as const) {
    const s = setup(options);
    const res = await s.run();
    assert.equal(res.status, code);
    assert.doesNotMatch(await res.text(), /private|unit-test/);
    assert.equal(s.mail.length, 0);
  }
});
test('Límite de bytes real, JSON inválido y content type incorrecto', async () => {
  const s = setup();
  assert.equal((await s.run({ ...valid, message: 'a'.repeat(33000) })).status, 413);
  assert.equal(
    (await s.run(valid, 'POST', 'https://solune.dev', { 'Content-Type': 'text/plain' })).status,
    415,
  );
  const malformed = new Request('https://api.solune.dev/contact', {
    method: 'POST',
    headers: { Origin: 'https://solune.dev', 'Content-Type': 'application/json' },
    body: '{bad',
  });
  assert.equal((await handleContact(malformed, s.env, s.verify)).status, 400);
  assert.equal(s.mail.length, 0);
});
test('El éxito espera al servicio de correo; tokens reutilizados no pasan Siteverify', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const s = setup({ pending });
  let settled = false;
  const response = s.run().then((r) => {
    settled = true;
    return r;
  });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(settled, false);
  release();
  assert.equal((await response).status, 200);
  const invalid = setup({
    verification: { success: false, 'error-codes': ['timeout-or-duplicate'] },
  });
  assert.equal((await invalid.run()).status, 403);
  assert.equal(invalid.mail.length, 0);
});
test('Transporte frontend → Worker → correo y error de Resend propagado al frontend', async () => {
  for (const mailError of [false, true]) {
    const s = setup({ mailError });
    const bridge = (async (url, init) =>
      handleContact(
        new Request(url, { ...init, headers: { ...init?.headers, Origin: 'https://solune.dev' } }),
        s.env,
        s.verify,
      )) as typeof fetch;
    if (mailError)
      await assert.rejects(
        submitContactForm(data, valid.turnstileToken, 'https://api.solune.dev/contact', bridge),
        (e) => e instanceof ContactRequestError && e.code === 'email_unavailable',
      );
    else {
      await submitContactForm(data, valid.turnstileToken, 'https://api.solune.dev/contact', bridge);
      assert.equal(s.mail.length, 1);
    }
  }
});

test('Producción rechaza localhost aunque se añada accidentalmente a ALLOWED_ORIGINS', async () => {
  const s = setup();
  s.env.ALLOWED_ORIGINS += ',http://localhost:5173';
  assert.equal((await s.run(valid, 'POST', 'http://localhost:5173')).status, 403);
  assert.equal(s.validations(), 0);
});
test('La excepción de action/hostname exige development, localhost y la clave oficial de prueba', async () => {
  const verification = {
    success: true,
    hostname: 'dummy',
    action: 'test',
    challenge_ts: new Date().toISOString(),
  };
  for (const secret of ['1x0000000000000000000000000000000AA', 'unit-test-not-a-real-secret']) {
    const s = setup({ secret, verification });
    s.env.ENVIRONMENT = 'development';
    s.env.ALLOWED_ORIGINS = 'http://localhost:5173';
    assert.equal(
      (await s.run(valid, 'POST', 'http://localhost:5173')).status,
      secret.startsWith('1x') ? 200 : 403,
    );
  }
  const production = setup({ secret: '1x0000000000000000000000000000000AA' });
  assert.equal((await production.run()).status, 503);
  assert.equal(production.validations(), 0);
});
test('Producción exige success booleano, timestamp reciente y hostname exacto también para www', async () => {
  for (const override of [
    { success: 'true' },
    { challenge_ts: new Date(Date.now() + 60000).toISOString() },
    { challenge_ts: undefined },
  ]) {
    const s = setup({
      verification: {
        success: true,
        action: 'contact',
        hostname: 'solune.dev',
        challenge_ts: new Date().toISOString(),
        ...override,
      },
    });
    assert.equal((await s.run()).status, 403);
  }
  const s = setup({
    verification: {
      success: true,
      action: 'contact',
      hostname: 'www.solune.dev',
      challenge_ts: new Date().toISOString(),
    },
  });
  assert.equal((await s.run(valid, 'POST', 'https://www.solune.dev')).status, 200);
});
