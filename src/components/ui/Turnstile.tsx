import { useEffect, useRef, useState } from 'react';
import { t, useLocale } from '../../i18n';

type WidgetOptions = {
  sitekey: string;
  theme: 'dark';
  size: 'flexible' | 'compact';
  language: 'es' | 'en';
  action: 'contact';
  retry: 'never';
  'refresh-expired': 'manual';
  'refresh-timeout': 'manual';
  'response-field': false;
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
  'timeout-callback': () => void;
  'unsupported-callback': () => void;
};
type TurnstileApi = {
  render: (element: HTMLElement, options: WidgetOptions) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
let loading: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timer = window.setTimeout(fail, 15000);
    function fail() {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error('turnstile_unavailable'));
    }
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    document.head.append(script);
  }).catch((error) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

export type VerificationState = 'pending' | 'ready' | 'expired' | 'error' | 'slow';
export default function Turnstile({
  siteKey,
  resetKey,
  onChange,
}: {
  siteKey: string;
  resetKey: number;
  onChange: (token: string, state: VerificationState) => void;
}) {
  const locale = useLocale();
  const element = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VerificationState>('pending');
  const [retry, setRetry] = useState(0);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    if (!element.current) return;
    const measure = () => setCompact(element.current!.clientWidth < 300);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let disposed = false;
    let widget: string | undefined;
    let api: TurnstileApi | undefined;
    let slowTimer: ReturnType<typeof setTimeout> | undefined;
    function update(token: string, next: VerificationState) {
      if (disposed) return;
      if (next !== 'pending') clearTimeout(slowTimer);
      setState(next);
      onChange(token, next);
    }
    update('', 'pending');
    slowTimer = setTimeout(() => update('', 'slow'), 25000);
    void loadTurnstile()
      .then((loaded) => {
        if (disposed || !element.current) return;
        api = loaded;
        widget = api.render(element.current, {
          sitekey: siteKey,
          theme: 'dark',
          size: compact ? 'compact' : 'flexible',
          language: locale,
          action: 'contact',
          retry: 'never',
          'refresh-expired': 'manual',
          'refresh-timeout': 'manual',
          'response-field': false,
          callback: (token) => update(token, 'ready'),
          'expired-callback': () => update('', 'expired'),
          'error-callback': () => update('', 'error'),
          'timeout-callback': () => update('', 'expired'),
          'unsupported-callback': () => update('', 'error'),
        });
      })
      .catch(() => update('', 'error'));
    return () => {
      disposed = true;
      clearTimeout(slowTimer);
      if (widget !== undefined) api?.remove(widget);
    };
  }, [siteKey, locale, resetKey, retry, onChange, compact]);
  return (
    <div className="contact-verification">
      <div ref={element} className="contact-turnstile" style={{ minHeight: compact ? 140 : 65 }} />
      <p role="status" aria-live="polite">
        {t(`contact.security.${state}`)}
      </p>
      {(state === 'error' || state === 'expired' || state === 'slow') && (
        <button type="button" className="text-link" onClick={() => setRetry((value) => value + 1)}>
          {t('contact.security.retry')}
        </button>
      )}
      <p className="contact-verification-note">
        {t('contact.security.note')}{' '}
        <a
          href="https://www.cloudflare.com/privacypolicy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('contact.security.privacy')}
        </a>
        .
      </p>
    </div>
  );
}
