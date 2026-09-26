import { NavLink, Link } from 'react-router-dom';
import { t, useLocale, type MessageKey } from '../../i18n';
import SEO from '../../components/ui/SEO';
import { PageHero } from '../../components/ui/Primitives';
import { legalDetails, analyticsConfigured, analyticsCookieNames } from '../../data/legal';
import { CONSENT_KEY, LANGUAGE_KEY, openCookieSettings } from '../../lib/consent';
import './legal.css';
import { contactConfigured } from '../../data/contact';

type Tab = 'notice' | 'privacy' | 'cookies';
const tabs: { tab: Tab; url: string; label: MessageKey }[] = [
  { tab: 'notice', url: '/legal', label: 'legal.notice' },
  { tab: 'privacy', url: '/privacidad', label: 'legal.privacy' },
  { tab: 'cookies', url: '/cookies', label: 'legal.cookies' },
];
function Copy({
  section,
}: {
  section:
    | 'contract'
    | 'use'
    | 'rights'
    | 'availability'
    | 'law'
    | 'overview'
    | 'information'
    | 'purpose'
    | 'security'
    | 'sources'
    | 'retention'
    | 'providers'
    | 'international'
    | 'dataRights'
    | 'definition'
    | 'change';
}) {
  return (
    <section className="legal-section">
      <h2>{t(`legal.${section}.title`)}</h2>
      <p>{t(`legal.${section}.text`)}</p>
    </section>
  );
}
function Identity() {
  const fields: { label: MessageKey; value: string }[] = [
    { label: 'legal.owner', value: legalDetails.owner },
    { label: 'legal.taxId', value: legalDetails.taxId },
    { label: 'legal.address', value: legalDetails.address },
    { label: 'legal.registry', value: legalDetails.registry },
  ];
  return (
    <section className="legal-section">
      <h2>{t('legal.identityTitle')}</h2>
      <p>{t('legal.identityText')}</p>
      <dl className="legal-identity">
        <div>
          <dt>{t('legal.brand')}</dt>
          <dd>Luma</dd>
        </div>
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{t(field.label)}</dt>
            <dd className={field.value ? '' : 'legal-pending'}>
              {field.value || t('legal.pending')}
            </dd>
          </div>
        ))}
        <div>
          <dt>{t('legal.website')}</dt>
          <dd>
            <a href={legalDetails.website}>{legalDetails.website}</a>
          </dd>
        </div>
        <div>
          <dt>{t('legal.contact')}</dt>
          <dd>
            <a href={`mailto:${legalDetails.email}`}>{legalDetails.email}</a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
function GoogleLinks() {
  return (
    <ul className="legal-links">
      <li>
        <a
          href="https://policies.google.com/privacy?hl=es"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('legal.googlePrivacy')} ↗
        </a>
      </li>
      <li>
        <a
          href="https://business.safety.google/adsprocessorterms/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('legal.googleTerms')} ↗
        </a>
      </li>
      <li>
        <a
          href="https://support.google.com/analytics/answer/11593727?hl=es"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('legal.googleData')} ↗
        </a>
      </li>
    </ul>
  );
}
function StorageTable({ category }: { category: 'necessary' | 'preferences' | 'analytics' }) {
  const names =
    category === 'necessary'
      ? [CONSENT_KEY]
      : category === 'preferences'
        ? [LANGUAGE_KEY]
        : analyticsCookieNames;
  return (
    <section className="legal-section">
      <h2>{t(`cookies.${category}`)}</h2>
      <p>
        {t(
          category === 'necessary'
            ? 'legal.storageConsent'
            : category === 'preferences'
              ? 'legal.storageLanguage'
              : analyticsConfigured
                ? 'legal.storageAnalytics'
                : 'cookies.analyticsInactive',
        )}
      </p>
      {names.length > 0 && (
        <div
          className="legal-table-scroll"
          tabIndex={0}
          role="region"
          aria-label={t(`cookies.${category}`)}
        >
          <table>
            <caption className="sr-only">{t(`cookies.${category}`)}</caption>
            <thead>
              <tr>
                {(['name', 'provider', 'purpose', 'duration', 'type'] as const).map((column) => (
                  <th scope="col" key={column}>
                    {t(`legal.column.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {names.map((name) => (
                <tr key={name}>
                  <th scope="row">
                    <code>{name}</code>
                  </th>
                  <td>
                    {category === 'analytics'
                      ? 'Google Analytics / Google Ireland Limited'
                      : 'Luma'}
                  </td>
                  <td>{t(`legal.table.${category}`)}</td>
                  <td>
                    {t(
                      category === 'necessary' ? 'legal.consentDuration' : 'legal.storageDuration',
                    )}
                  </td>
                  <td>{category === 'analytics' ? 'Cookie' : 'localStorage'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
export default function Legal({ tab }: { tab: Tab }) {
  const locale = useLocale();
  const selected = tabs.find((item) => item.tab === tab)!;
  return (
    <div className="legal-page">
      <SEO title={t(selected.label)} description={t('legal.description')} />
      <PageHero label={t('legal.eyebrow')} lines={[t(selected.label)]} />
      <div className="container legal-layout">
        <div className="legal-meta">
          <p className="eyebrow">
            {t('legal.updated')}{' '}
            <time dateTime="2026-09-26">{locale === 'es' ? '26.09.2026' : '25 Sep 2026'}</time>
          </p>
          <span className="eyebrow">LUMA / {locale.toUpperCase()}</span>
        </div>
        <nav className="legal-tabs" aria-label={t('legal.navigation')}>
          {tabs.map((item) => (
            <NavLink key={item.tab} to={item.url}>
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <article className="legal-copy">
          {!legalDetails.owner || !legalDetails.taxId || !legalDetails.address ? (
            <p className="legal-pending-note">{t('legal.pendingNotice')}</p>
          ) : null}
          {tab === 'notice' && (
            <>
              <Identity />
              <Copy section="contract" />
              <Copy section="use" />
              <Copy section="rights" />
              <Copy section="availability" />
              <section className="legal-section">
                <h2>{t('legal.personalTitle')}</h2>
                <p>
                  <Link to="/privacidad">{t('legal.privacy')}</Link> ·{' '}
                  <Link to="/cookies">{t('legal.cookies')}</Link>
                </p>
              </section>
              <Copy section="law" />
            </>
          )}
          {tab === 'privacy' && (
            <>
              <Copy section="overview" />
              <section className="legal-section">
                <h2>{t('legal.controller')}</h2>
                <p>
                  {legalDetails.owner || t('legal.pending')} ·{' '}
                  <a href={`mailto:${legalDetails.email}`}>{legalDetails.email}</a>
                </p>
                <Link to="/legal">{t('legal.fullIdentity')}</Link>
              </section>
              <section className="legal-section">
                <h2>{t('legal.currentMode')}</h2>
                <p>{t(contactConfigured ? 'legal.liveForm' : 'legal.demoForm')}</p>
              </section>
              <Copy section="information" />
              <Copy section="purpose" />
              <Copy section="security" />
              <section className="legal-section">
                <h2>{t('legal.turnstile.title')}</h2>
                <p>{t('legal.turnstile.text')}</p>
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('contact.security.privacy')} ↗
                </a>
              </section>
              <Copy section="sources" />
              <section className="legal-section">
                <h2>{t('legal.preferenceTitle')}</h2>
                <p>{t('legal.preferenceText')}</p>
                <button className="text-link" onClick={openCookieSettings}>
                  {t('cookies.configure')}
                </button>
              </section>
              <section className="legal-section">
                <h2>{t('legal.analyticsTitle')}</h2>
                <p>{t(analyticsConfigured ? 'legal.analyticsActive' : 'legal.analyticsOff')}</p>
                {analyticsConfigured && (
                  <>
                    <p>{t('legal.analyticsDetails')}</p>
                    <GoogleLinks />
                  </>
                )}
              </section>
              <Copy section="retention" />
              <Copy section="providers" />
              <p className="legal-provider-status">
                {t('legal.infrastructure')} {legalDetails.infrastructure || t('legal.pending')}
              </p>
              {(analyticsConfigured || contactConfigured) && <Copy section="international" />}
              <Copy section="dataRights" />
              <p>
                <a href={`mailto:${legalDetails.email}`}>{legalDetails.email}</a> ·{' '}
                <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">
                  {t('legal.aepd')} ↗
                </a>
              </p>
            </>
          )}
          {tab === 'cookies' && (
            <>
              <Copy section="definition" />
              <StorageTable category="necessary" />
              <StorageTable category="preferences" />
              <StorageTable category="analytics" />
              <section className="legal-section">
                <h2>{t('legal.turnstile.title')}</h2>
                <p>{t('legal.turnstile.text')}</p>
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('contact.security.privacy')} ↗
                </a>
              </section>
              <Copy section="change" />
              <button className="consent-button" onClick={openCookieSettings}>
                {t('cookies.configure')}
              </button>
              <p className="legal-crosslink">
                <Link to="/privacidad">{t('legal.privacy')}</Link>
              </p>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
