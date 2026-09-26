type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};
export function deleteAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((part) => part.trim().split('=')[0])
    .filter((name) => /^_ga(?:_|$)/.test(name));
  const host = location.hostname;
  const domains = [
    '',
    ...host
      .split('.')
      .map((_, index, parts) => parts.slice(index).join('.'))
      .filter((domain) => domain.includes('.'))
      .flatMap((domain) => [domain, `.${domain}`]),
  ];
  const paths = [
    '/',
    ...location.pathname
      .split('/')
      .map((_, index, parts) => parts.slice(0, index + 1).join('/') || '/'),
  ];
  for (const name of names)
    for (const domain of domains)
      for (const path of new Set(paths)) {
        document.cookie = `${name}=; Max-Age=0; Path=${path};${domain ? ` Domain=${domain};` : ''} SameSite=Lax`;
      }
}

// Only known site routes are measured. Never transmit queries, hashes or user-entered paths.
export function analyticsPath(path: string) {
  return /^\/(?:nosotros|proyectos(?:\/(?:clinica-dental|estudio-estetica))?|servicios(?:\/(?:diseno-web|desarrollo-web|ui-ux|integraciones|mantenimiento))?|contacto|legal|privacidad|cookies)?$/.test(
    path,
  )
    ? path
    : '/404';
}
export function createAnalytics(
  {
    configured: analyticsConfigured,
    id: ga4Id,
    cookieSeconds: analyticsCookieSeconds,
  }: { configured: boolean; id: string; cookieSeconds: number },
  isAllowed: () => boolean,
) {
  let active = false;
  let lastPath = '';
  let generation = 0;
  let loadedScript: HTMLScriptElement | null = null;
  const adDenials = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };

  function pageView() {
    if (!active || !isAllowed()) return;
    const path = analyticsPath(location.pathname);
    if (lastPath === path) return;
    lastPath = path;
    (window as unknown as AnalyticsWindow).gtag?.('event', 'page_view', {
      send_to: ga4Id,
      page_location: `${location.origin}${path}`,
      page_title: `LUMA | ${path}`,
      page_referrer: '',
    });
  }
  function syncAnalytics() {
    const win = window as unknown as AnalyticsWindow;
    if (!analyticsConfigured || !isAllowed()) {
      const wasActive = active || !!loadedScript;
      active = false;
      lastPath = '';
      generation++;
      if (ga4Id) win[`ga-disable-${ga4Id}`] = true;
      if (wasActive) win.gtag?.('consent', 'update', { analytics_storage: 'denied', ...adDenials });
      loadedScript?.remove();
      loadedScript = null;
      deleteAnalyticsCookies();
      // A downloaded tag cannot be unloaded. Reload only after withdrawal to discard its listeners/timers.
      if (wasActive) window.location.reload();
      return;
    }
    if (active) {
      pageView();
      return;
    }
    if (loadedScript) return;
    const token = ++generation;
    win[`ga-disable-${ga4Id}`] = false;
    win.dataLayer = [];
    win.gtag = function () {
      win.dataLayer!.push(arguments);
    };
    win.gtag('consent', 'default', { analytics_storage: 'denied', ...adDenials });
    win.gtag('set', 'allow_google_signals', false);
    win.gtag('set', 'allow_ad_personalization_signals', false);
    win.gtag('consent', 'update', { analytics_storage: 'granted', ...adDenials });
    win.gtag('js', new Date());
    win.gtag('config', ga4Id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: analyticsCookieSeconds,
      cookie_update: false,
      cookie_domain: location.hostname,
      cookie_path: '/',
      page_location: `${location.origin}${analyticsPath(location.pathname)}`,
      page_referrer: '',
      page_title: 'LUMA',
    });
    const script = document.createElement('script');
    script.id = 'luma-ga4';
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    loadedScript = script;
    script.onload = () => {
      if (token !== generation || !isAllowed()) return;
      active = true;
      pageView();
    };
    script.onerror = () => {
      script.remove();
      if (token === generation) loadedScript = null;
    };
    document.head.append(script);
  }

  return { sync: syncAnalytics };
}
