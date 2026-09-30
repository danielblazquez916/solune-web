import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { t, useLocale, type MessageKey } from '../../i18n';
import './capabilities.css';

const development = [
  ['react', 'about.034'],
  ['typescript', 'about.035'],
  ['vite', 'services.026'],
  ['api', 'services.027'],
  ['responsive', 'services.028'],
  ['performance', 'services.029'],
  ['seo', 'services.030'],
  ['accessibility', 'services.031'],
  ['animation', 'services.032'],
] as const;
const integrations = [
  ['api', 'services.066'],
  ['crm', 'services.067'],
  ['booking', 'services.068'],
  ['cms', 'services.069'],
  ['automation', 'services.070'],
  ['email', 'services.071'],
] as const;
type Icon = (typeof development | typeof integrations)[number][0];

const icons: Partial<Record<Icon, ReactNode>> = {
  api: (
    <>
      <rect x="5" y="22" width="18" height="20" rx="4" />
      <rect x="41" y="22" width="18" height="20" rx="4" />
      <path d="M23 28h18m-5-5 5 5-5 5M41 36H23m5-5-5 5 5 5" />
    </>
  ),
  responsive: (
    <>
      <rect x="6" y="10" width="39" height="29" rx="3" />
      <path d="M17 49h18M26 39v10" />
      <rect x="40" y="26" width="17" height="29" rx="3" />
      <path d="M46 49h5" />
    </>
  ),
  performance: (
    <>
      <path d="M10 48a26 26 0 1 1 44 0M32 8v6M12 20l5 4m35-4-5 4M8 38h7m34 0h7M32 37l12-14" />
      <circle cx="32" cy="39" r="5" />
    </>
  ),
  seo: (
    <>
      <circle cx="27" cy="27" r="18" />
      <path d="m40 40 16 16M17 32l8-9 7 5 7-10" />
    </>
  ),
  accessibility: (
    <>
      <circle cx="32" cy="11" r="5" />
      <path d="M10 24l22 4 22-4M32 28v13M21 57l11-16 11 16" />
    </>
  ),
  animation: (
    <>
      <path d="M7 22h10M3 32h14M7 42h10" />
      <rect x="23" y="13" width="34" height="38" rx="9" />
      <path d="m36 24 11 8-11 8Z" />
    </>
  ),
  crm: (
    <>
      <circle cx="25" cy="22" r="8" />
      <path d="M9 53v-5a16 16 0 0 1 32 0v5M42 15a8 8 0 0 1 0 16m4 8a13 13 0 0 1 9 13" />
    </>
  ),
  booking: (
    <>
      <rect x="9" y="13" width="46" height="43" rx="5" />
      <path d="M20 7v12M44 7v12M9 27h46M22 41l7 7 14-14" />
    </>
  ),
  cms: (
    <>
      <rect x="9" y="8" width="46" height="48" rx="4" />
      <path d="M9 20h46M27 20v36M35 30h12M35 39h12M35 48h8" />
    </>
  ),
  automation: (
    <>
      <rect x="24" y="5" width="16" height="14" rx="3" />
      <rect x="5" y="45" width="16" height="14" rx="3" />
      <rect x="43" y="45" width="16" height="14" rx="3" />
      <path d="M32 19v13M13 45V32h38v13M8 39l5 6 5-6m28 0 5 6 5-6" />
    </>
  ),
  email: (
    <>
      <rect x="6" y="14" width="52" height="36" rx="5" />
      <path d="m7 17 25 19 25-19M7 48l16-17m34 17L41 31" />
    </>
  ),
};

function CapabilityIcon({ icon }: { icon: Icon }) {
  if (icon === 'vite' || icon === 'typescript') {
    return <img src={`/technologies/${icon}.svg`} alt="" width="160" height="160" />;
  }
  if (icon === 'react') {
    return (
      <svg viewBox="-32 -32 64 64" fill="none" stroke="#61dafb" strokeWidth="2" aria-hidden="true">
        <ellipse rx="29" ry="11" />
        <ellipse rx="29" ry="11" transform="rotate(60)" />
        <ellipse rx="29" ry="11" transform="rotate(120)" />
        <circle r="5" fill="#61dafb" stroke="none" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[icon]}
    </svg>
  );
}

export default function CapabilityExplorer({ kind }: { kind: 'development' | 'integrations' }) {
  useLocale();
  const [selected, setSelected] = useState(0);
  const id = useId();
  const options = kind === 'development' ? development : integrations;
  const active = options[selected];
  const name = t(active[1]).trim();
  return (
    <div className="capability-explorer">
      <div
        className="capability-preview"
        id={id}
        role="region"
        aria-label={t('capability.detail')}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="capability-preview-meta eyebrow">
          <span>{t('capability.selected')}</span>
          <span>
            {String(selected + 1).padStart(2, '0')} / {String(options.length).padStart(2, '0')}
          </span>
        </div>
        <div className="capability-art" key={active[0]} aria-hidden="true">
          <CapabilityIcon icon={active[0]} />
        </div>
        <h3>{name}</h3>
        <p className="capability-description">{t(`capability.${active[0]}` as MessageKey)}</p>
      </div>
      <div className="capability-controls">
        <p className="eyebrow">{t('capability.choose')}</p>
        <div className="capability-options" role="group" aria-label={t('capability.choose')}>
          {options.map(([icon, label], index) => (
            <button
              type="button"
              className="capability-option"
              key={icon}
              aria-pressed={selected === index}
              aria-controls={id}
              onClick={() => setSelected(index)}
            >
              <span className="eyebrow" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{t(label).trim()}</span>
              <span className="capability-option-indicator" aria-hidden="true">
                {selected === index ? '−' : '+'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
