import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const requireWorker = createRequire(new URL('../worker/package.json', import.meta.url));
const { build } = requireWorker('esbuild');
const { Miniflare, Log, LogLevel, convertV4MiniflareOptions } = requireWorker('miniflare');
const built = await build({
  entryPoints: [
    new URL('../worker/src/index.ts', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'),
  ],
  bundle: true,
  format: 'esm',
  write: false,
});
const used = new Set();
const mf = new Miniflare(
  convertV4MiniflareOptions({
    log: new Log(LogLevel.ERROR),
    workers: [
      {
        name: 'solune-test',
        modules: true,
        script: built.outputFiles[0].text,
        compatibilityDate: '2026-09-26',
        bindings: {
          ENVIRONMENT: 'production',
          ALLOWED_ORIGINS: 'https://solune.dev',
          RESEND_API_KEY: 'runtime-test-not-a-real-secret',
          TURNSTILE_SECRET_KEY: 'runtime-test-not-a-real-secret',
        },
        outboundService: async (request) => {
          if (request.url === 'https://api.resend.com/emails') {
            assert.equal(
              request.headers.get('Authorization'),
              'Bearer runtime-test-not-a-real-secret',
            );
            const email = await request.json();
            assert.equal(email.from, 'Solune · Web <formularios@solune.dev>');
            assert.deepEqual(email.to, ['hola@solune.dev']);
            assert.equal(email.reply_to, 'test@example.com');
            return Response.json({ id: 'runtime-test-message' });
          }
          assert.equal(request.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
          const body = await request.json();
          assert.equal(body.secret, 'runtime-test-not-a-real-secret');
          const success = !used.has(body.response);
          used.add(body.response);
          return Response.json({
            success,
            hostname: 'solune.dev',
            action: 'contact',
            challenge_ts: new Date().toISOString(),
          });
        },
      },
    ],
  }),
);
try {
  const data = {
    name: 'Prueba local',
    email: 'test@example.com',
    company: 'Prueba',
    phone: '',
    message: 'Prueba local del runtime; no se entrega correo real.',
    privacy: true,
    turnstileToken: 'runtime-test-token',
  };
  const send = () =>
    mf.dispatchFetch('https://api.solune.dev/contact', {
      method: 'POST',
      headers: { Origin: 'https://solune.dev', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  const response = await send();
  assert.equal(response.status, 200, await response.clone().text());
  assert.deepEqual(await response.json(), { ok: true, code: 'sent' });
  assert.equal((await send()).status, 403);
  console.log(
    'PASS: workerd + Siteverify y Resend simulados; POST válido 200 y token repetido 403. Sin envío real.',
  );
} finally {
  await mf.dispose();
}
