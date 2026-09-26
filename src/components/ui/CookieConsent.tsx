import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { t, useLocale } from '../../i18n';
import { getConsent, saveConsent, subscribeConsent } from '../../lib/consent';
import { analyticsConfigured } from '../../data/legal';
import { pauseSmoothScroll } from '../layout/SmoothScroll';
import '../../styles/consent.css';

export default function CookieConsent() {
  useLocale();
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => null);
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  function configure() {
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPreferences(getConsent()?.preferences ?? false);
    setAnalytics(getConsent()?.analytics ?? false);
    setOpen(true);
  }
  useEffect(() => {
    window.addEventListener('luma:cookie-settings', configure);
    return () => window.removeEventListener('luma:cookie-settings', configure);
  }, []);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    pauseSmoothScroll(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.current?.close();
      document.body.style.overflow = previous;
      if (!document.querySelector('dialog[open]')) pauseSmoothScroll(false);
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    };
  }, [open]);
  function decide(pref: boolean, stats: boolean) {
    setOpen(false);
    saveConsent(pref, analyticsConfigured && stats);
  }
  return (
    <>
      {!consent && !open && (
        <section className="cookie-banner" aria-labelledby="cookie-banner-title">
          <div className="cookie-banner-copy">
            <p className="eyebrow">{t('cookies.eyebrow')}</p>
            <h2 id="cookie-banner-title">{t('cookies.bannerTitle')}</h2>
            <p>
              {t(analyticsConfigured ? 'cookies.bannerText' : 'cookies.bannerInactive')}{' '}
              <Link to="/cookies">{t('cookies.policyLink')}</Link>
            </p>
          </div>
          <div className="cookie-actions">
            <button className="consent-button" onClick={() => decide(true, true)}>
              {t('cookies.accept')}
            </button>
            <button className="consent-button" onClick={() => decide(false, false)}>
              {t('cookies.reject')}
            </button>
            <button className="consent-configure" onClick={configure}>
              {t('cookies.configure')}
            </button>
          </div>
        </section>
      )}
      <dialog
        ref={dialog}
        className="cookie-dialog"
        data-lenis-prevent
        aria-labelledby="cookie-settings-title"
        onCancel={() => setOpen(false)}
      >
        <div className="cookie-dialog-heading">
          <p className="eyebrow">{t('cookies.eyebrow')}</p>
          <button
            className="cookie-close"
            autoFocus
            aria-label={t('cookies.close')}
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <h2 id="cookie-settings-title">{t('cookies.settingsTitle')}</h2>
        <p className="cookie-settings-intro">{t('cookies.intro')}</p>
        <div className="consent-category">
          <div>
            <h3>{t('cookies.necessary')}</h3>
            <p>{t('cookies.necessaryText')}</p>
          </div>
          <span className="cookie-always">{t('cookies.always')}</span>
        </div>
        <div className="consent-category">
          <div>
            <label htmlFor="cookie-preferences">{t('cookies.preferences')}</label>
            <p id="cookie-preferences-text">{t('cookies.preferencesText')}</p>
          </div>
          <input
            id="cookie-preferences"
            type="checkbox"
            role="switch"
            checked={preferences}
            aria-describedby="cookie-preferences-text"
            onChange={(event) => setPreferences(event.target.checked)}
          />
        </div>
        <div className="consent-category">
          <div>
            <label htmlFor="cookie-analytics">{t('cookies.analytics')}</label>
            <p id="cookie-analytics-text">
              {t(analyticsConfigured ? 'cookies.analyticsText' : 'cookies.analyticsInactive')}
            </p>
          </div>
          <input
            id="cookie-analytics"
            type="checkbox"
            role="switch"
            checked={analyticsConfigured && analytics}
            disabled={!analyticsConfigured}
            aria-describedby="cookie-analytics-text"
            onChange={(event) => setAnalytics(event.target.checked)}
          />
        </div>
        <p className="cookie-settings-note">{t('cookies.duration')}</p>
        <div className="cookie-actions dialog-actions">
          <button className="consent-button" onClick={() => decide(preferences, analytics)}>
            {t('cookies.save')}
          </button>
          <button className="consent-configure" onClick={() => decide(false, false)}>
            {t('cookies.reject')}
          </button>
        </div>
        <Link to="/cookies" className="cookie-policy" onClick={() => setOpen(false)}>
          {t('cookies.policyLink')} ↗
        </Link>
      </dialog>
    </>
  );
}
