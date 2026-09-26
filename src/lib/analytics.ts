import { analyticsConfigured, analyticsCookieSeconds, ga4Id } from '../data/legal';
import { getConsent } from './consent';
import { createAnalytics } from './analyticsCore';

const analytics = createAnalytics(
  { configured: analyticsConfigured, id: ga4Id, cookieSeconds: analyticsCookieSeconds },
  () => !!getConsent()?.analytics,
);
export const syncAnalytics = analytics.sync;
