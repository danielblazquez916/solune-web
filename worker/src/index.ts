import { normalizeContact, validateContact, type ContactData } from '../../shared/contact.ts';

export interface Env {
  ENVIRONMENT: 'development' | 'production';
  TURNSTILE_SECRET_KEY: string;
  ALLOWED_ORIGINS: string;
  RESEND_API_KEY: string;
}

interface ResendEmail {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
}

interface ResendResponse {
  id?: string;
}

// Public Cloudflare dummy key; only accepted for local development.
const TEST_SECRET = '1x0000000000000000000000000000000AA';
const PRODUCTION_ORIGINS = new Set(['https://solune.dev', 'https://www.solune.dev']);

const MAX_BODY_BYTES = 32 * 1024;

const fields = new Set([
  'name',
  'email',
  'company',
  'phone',
  'message',
  'privacy',
  'turnstileToken',
]);

class RequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function readPayload(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) {
    throw new RequestError(415, 'unsupported_media_type');
  }

  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) {
    throw new RequestError(413, 'payload_too_large');
  }

  if (!request.body) {
    throw new RequestError(400, 'invalid_payload');
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];

  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new RequestError(408, 'request_timeout')), 10000);
  });

  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), timeout]);

      if (done) break;

      size += value.byteLength;

      if (size > MAX_BODY_BYTES) {
        throw new RequestError(413, 'payload_too_large');
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(size);

    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const payload: unknown = JSON.parse(
      new TextDecoder('utf-8', {
        fatal: true,
        ignoreBOM: false,
      }).decode(bytes),
    );

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new RequestError(400, 'invalid_payload');
    }

    return payload as Record<string, unknown>;
  } catch (error) {
    void reader.cancel().catch(() => {});

    if (error instanceof RequestError) {
      throw error;
    }

    throw new RequestError(400, 'invalid_payload');
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    reader.releaseLock();
  }
}

export function contactEmail(data: ContactData): ResendEmail {
  return {
    from: 'Solune · Web <formularios@solune.dev>',
    to: ['hola@solune.dev'],
    reply_to: data.email,
    subject: 'Nueva consulta desde Solune',
    text: [
      `Nombre:\n${data.name}`,
      `Empresa / negocio:\n${data.company}`,
      `Email:\n${data.email}`,
      `Teléfono:\n${data.phone || 'No facilitado'}`,
      `Mensaje:\n${data.message}`,
    ].join('\n\n'),
  };
}

export async function handleContact(
  request: Request,
  env: Env,
  outboundFetch: typeof fetch = fetch,
): Promise<Response> {
  const origin = request.headers.get('Origin');

  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const authorized =
    !!origin &&
    origin !== 'null' &&
    allowed.includes(origin) &&
    (env.ENVIRONMENT === 'development' ||
      (env.ENVIRONMENT === 'production' && PRODUCTION_ORIGINS.has(origin)));

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
  });

  if (authorized) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  const respond = (status: number, code: string) =>
    new Response(
      JSON.stringify({
        ok: status === 200,
        code,
      }),
      {
        status,
        headers,
      },
    );

  if (new URL(request.url).pathname !== '/contact') {
    return respond(404, 'not_found');
  }

  if (!['POST', 'OPTIONS'].includes(request.method)) {
    headers.set('Allow', 'POST, OPTIONS');
    return respond(405, 'method_not_allowed');
  }

  if (!authorized) {
    return respond(403, 'origin_forbidden');
  }

  if (request.method === 'OPTIONS') {
    const requestedHeaders = (request.headers.get('Access-Control-Request-Headers') || '')
      .toLowerCase()
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    if (
      request.headers.get('Access-Control-Request-Method') !== 'POST' ||
      requestedHeaders.some((h) => h !== 'content-type')
    ) {
      return respond(403, 'preflight_forbidden');
    }

    headers.set('Access-Control-Allow-Methods', 'POST');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Access-Control-Max-Age', '600');

    return new Response(null, {
      status: 204,
      headers,
    });
  }

  try {
    const payload = await readPayload(request);

    if (Object.keys(payload).some((key) => !fields.has(key))) {
      throw new RequestError(400, 'invalid_payload');
    }

    for (const field of ['name', 'email', 'company', 'message'] as const) {
      if (typeof payload[field] !== 'string') {
        throw new RequestError(400, 'invalid_fields');
      }
    }

    if (
      (payload.phone !== undefined && typeof payload.phone !== 'string') ||
      payload.privacy !== true
    ) {
      throw new RequestError(400, 'invalid_fields');
    }

    const data = {
      name: payload.name,
      email: payload.email,
      company: payload.company,
      message: payload.message,
      phone: payload.phone ?? '',
      privacy: payload.privacy,
    } as ContactData;

    if (Object.keys(validateContact(data)).length) {
      throw new RequestError(400, 'invalid_fields');
    }

    if (
      typeof payload.turnstileToken !== 'string' ||
      !payload.turnstileToken.trim() ||
      payload.turnstileToken.length > 2048
    ) {
      throw new RequestError(403, 'turnstile_invalid');
    }

    if (
      !env.TURNSTILE_SECRET_KEY ||
      !env.RESEND_API_KEY ||
      (env.ENVIRONMENT !== 'development' && /^[123]x0+[AB]A$/.test(env.TURNSTILE_SECRET_KEY))
    ) {
      throw new RequestError(503, 'service_unavailable');
    }

    /*
     * Validar Turnstile
     */
    let result: {
      success?: boolean;
      hostname?: string;
      action?: string;
      challenge_ts?: string;
    };

    try {
      const response = await outboundFetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: payload.turnstileToken,
            remoteip: request.headers.get('CF-Connecting-IP') || undefined,
          }),
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!response.ok) {
        throw new Error('verification_unavailable');
      }

      result = await response.json();
    } catch {
      throw new RequestError(503, 'verification_unavailable');
    }

    const age = Date.now() - Date.parse(result?.challenge_ts || '');

    const hostname = new URL(origin!).hostname;

    const localTest =
      env.ENVIRONMENT === 'development' &&
      env.TURNSTILE_SECRET_KEY === TEST_SECRET &&
      (hostname === 'localhost' || hostname === '127.0.0.1');

    if (
      result?.success !== true ||
      !Number.isFinite(age) ||
      age < -30000 ||
      age > 300000 ||
      (!localTest && result.action !== 'contact') ||
      (!localTest && result.hostname !== hostname)
    ) {
      throw new RequestError(403, 'turnstile_invalid');
    }

    /*
     * Enviar email mediante Resend
     */
    try {
      const normalized = normalizeContact(data);

      const response = await outboundFetch('https://api.resend.com/emails', {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(contactEmail(normalized)),

        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error('resend_failed');
      }

      const delivery = (await response.json()) as ResendResponse;

      if (!delivery.id) {
        throw new Error('delivery_unconfirmed');
      }
    } catch {
      throw new RequestError(502, 'email_unavailable');
    }

    return respond(200, 'sent');
  } catch (error) {
    return error instanceof RequestError
      ? respond(error.status, error.code)
      : respond(500, 'service_unavailable');
  }
}

export default {
  fetch: (request: Request, env: Env) => {
    return handleContact(request, env);
  },
} satisfies ExportedHandler<Env>;
