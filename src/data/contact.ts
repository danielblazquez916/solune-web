export const contactApiUrl = (import.meta.env.VITE_CONTACT_API_URL || '').trim();
export const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
export const contactConfigured = Boolean(contactApiUrl && turnstileSiteKey);
