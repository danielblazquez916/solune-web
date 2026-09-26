// Public configuration only. Never put credentials in VITE_* values.
export const legalDetails = {
  owner: import.meta.env.VITE_LEGAL_OWNER || '',
  taxId: import.meta.env.VITE_LEGAL_TAX_ID || '',
  address: import.meta.env.VITE_LEGAL_ADDRESS || '',
  registry: import.meta.env.VITE_LEGAL_REGISTRY || '',
  website: import.meta.env.VITE_LEGAL_WEBSITE || 'https://solune.dev',
  email: import.meta.env.VITE_LEGAL_EMAIL || 'hola@solune.dev',
  infrastructure: import.meta.env.VITE_LEGAL_INFRASTRUCTURE || '',
};
const measurementId = import.meta.env.VITE_GA4_ID || '';
export const ga4Id = /^G-[A-Z0-9]+$/.test(measurementId) ? measurementId : '';
// Confirm enhanced measurement and advertising features are OFF in the GA4 property first.
export const analyticsConfigured = Boolean(
  ga4Id && import.meta.env.VITE_GA4_PRIVACY_READY === 'true',
);
export const analyticsCookieSeconds = 180 * 86400;
export const analyticsCookieNames = analyticsConfigured ? ['_ga', `_ga_${ga4Id.slice(2)}`] : [];
