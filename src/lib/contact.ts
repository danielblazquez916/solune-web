import { normalizeContact, validateContact, type ContactData } from '../../shared/contact.ts';
export { validateContact, contactLimits } from '../../shared/contact.ts';
export type { ContactData, ContactErrors } from '../../shared/contact.ts';

export type ContactFailure =
  | 'invalid_fields'
  | 'turnstile_invalid'
  | 'verification_unavailable'
  | 'email_unavailable'
  | 'service_unavailable'
  | 'network'
  | 'rate_limited';
export class ContactRequestError extends Error {
  code: ContactFailure;
  constructor(code: ContactFailure) {
    super(code);
    this.code = code;
  }
}

export async function submitContactForm(
  data: ContactData,
  token: string,
  endpoint: string,
  request: typeof fetch = fetch,
): Promise<void> {
  if (Object.keys(validateContact(data)).length) throw new ContactRequestError('invalid_fields');
  if (!endpoint) throw new ContactRequestError('service_unavailable');
  if (!token) throw new ContactRequestError('turnstile_invalid');
  let response: Response;
  try {
    response = await request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({ ...normalizeContact(data), turnstileToken: token }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new ContactRequestError('network');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true || result?.code !== 'sent') {
    const known: ContactFailure[] = [
      'invalid_fields',
      'turnstile_invalid',
      'verification_unavailable',
      'email_unavailable',
      'service_unavailable',
    ];
    throw new ContactRequestError(
      response.status === 429
        ? 'rate_limited'
        : known.includes(result?.code)
          ? result.code
          : 'network',
    );
  }
}
