import { t, useLocale } from '../../i18n';
import { useState } from 'react';

export default function Marquee() {
  useLocale();
  const [paused, setPaused] = useState(false);
  return (
    <section className={`marquee ${paused ? 'is-paused' : ''}`} aria-label={t('marquee.001')}>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((i) => (
          <div className="marquee-copy" key={i}>
            {t('marquee.002')}
            <span>✳</span> {t('marquee.003')}
            <span>✳</span> {t('marquee.004')}
            <span>✳</span> {t('marquee.005')} <span>✳</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setPaused(!paused)}
        aria-label={paused ? t('marquee.006') : t('marquee.007')}
      >
        {paused ? '▶' : 'Ⅱ'}
      </button>
    </section>
  );
}
