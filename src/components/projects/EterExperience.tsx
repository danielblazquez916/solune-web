import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { t, useLocale } from '../../i18n';
import type { Project } from '../../data/projects';
import { BrandMark } from './ProjectCard';
import Photo from '../ui/Photo';
import { scrollPage } from '../layout/SmoothScroll';

type View = 'home' | 'treatments' | 'space' | 'booking';

export default function EterExperience({
  project,
  mobile,
  renderBooking,
}: {
  project: Project;
  mobile: boolean;
  renderBooking: (index: number) => ReactNode;
}) {
  useLocale();
  const id = useId();
  const [view, setView] = useState<View>('home');
  const [category, setCategory] = useState(-1);
  const [chosen, setChosen] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);
  function changeView(next: View) {
    if (next === view) return;
    navigating.current = true;
    setView(next);
  }
  useLayoutEffect(() => {
    if (!navigating.current || !panel.current) return;
    navigating.current = false;
    const top = panel.current.getBoundingClientRect().top;
    if (top < 120) scrollPage(Math.max(0, window.scrollY + top - 120), true);
    panel.current.focus({ preventScroll: true });
  }, [view]);
  const categories = [t('eter.facial'), t('eter.body'), t('eter.wellbeing')];
  const navigation: { id: View; label: string }[] = [
    { id: 'home', label: t('mockupexperience.019') },
    { id: 'treatments', label: t('mockupexperience.020') },
    { id: 'space', label: t('eter.clinic') },
    { id: 'booking', label: t('eter.book') },
  ];
  const book = (index = 0) => {
    setChosen(index);
    changeView('booking');
  };
  const treatments = (
    <section className="eter-treatments" aria-labelledby={`${id}-treatments`}>
      <div className="eter-section-heading">
        <span className="eter-kicker">{t('eter.care')}</span>
        <h3 id={`${id}-treatments`}>{t('eter.treatmentsTitle')}</h3>
        <p>{t('eter.treatmentsIntro')}</p>
      </div>
      <div className="eter-filters" role="group" aria-label={t('eter.filter')}>
        {[t('eter.all'), ...categories].map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={category === i - 1}
            onClick={() => setCategory(i - 1)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="eter-treatment-grid">
        {project.treatments.map(
          (item, i) =>
            (category < 0 || category === i) && (
              <article className="eter-treatment" key={item.name}>
                <div className={`eter-treatment-art eter-treatment-art-${i}`} aria-hidden="true">
                  <span>{['◯', '∿', '✳'][i]}</span>
                  <small>{categories[i]}</small>
                </div>
                <div className="eter-treatment-copy">
                  <span className="eter-kicker">
                    0{i + 1} / {categories[i]}
                  </span>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <div className="eter-treatment-meta">
                    <span>{item.duration}</span>
                    <span>{item.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => book(i)}
                    aria-label={t('mockupexperience.046', { v0: item.name })}
                  >
                    {t('eter.explore')} <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ),
        )}
      </div>
      <p className="eter-demo-note">{t('eter.rates')}</p>
    </section>
  );
  const space = (
    <section className="eter-space">
      <Photo name="eter-clinic" alt={t('eter.imageAlt')} sizes="(max-width: 700px) 100vw, 55vw" />
      <div>
        <span className="eter-kicker">{t('eter.spaceLabel')}</span>
        <h3>{t('eter.spaceTitle')}</h3>
        <p>{t('eter.spaceText')}</p>
        <button type="button" className="eter-pill" onClick={() => book()}>
          {t('eter.firstVisit')} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
  return (
    <div className={`mockup-frame eter eter-clinic ${mobile ? 'phone-frame' : ''}`}>
      <div className="browser-chrome" aria-hidden="true">
        <span>● ● ●</span>
        <span>eter.concept / {view}</span>
        <span>↗</span>
      </div>
      <div className="eter-site">
        <header className="eter-nav">
          <button
            type="button"
            className="eter-brand-home"
            aria-label={t('eter.home')}
            onClick={() => changeView('home')}
          >
            <BrandMark theme="eter" />
          </button>
          <nav
            aria-label={t('mockupexperience.026', {
              v0: project.name,
              v1: mobile ? t('mockup.mobile') : '',
            })}
          >
            {navigation.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-current={view === item.id ? 'page' : undefined}
                aria-controls={`${id}-panel`}
                onClick={() => changeView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <div id={`${id}-panel`} className="eter-page" key={view} ref={panel} tabIndex={-1}>
          {view === 'home' && (
            <>
              <section className="eter-hero">
                <Photo
                  name="eter-clinic"
                  alt={t('eter.imageAlt')}
                  sizes="(max-width: 700px) 100vw, 85vw"
                />
                <div className="eter-hero-content">
                  <span className="eter-kicker">{t('eter.heroLabel')}</span>
                  <h3>
                    {t('eter.heroTitle')}
                    <em>{t('eter.heroEmphasis')}</em>
                  </h3>
                  <p>{t('eter.heroText')}</p>
                  <button className="eter-pill" type="button" onClick={() => book()}>
                    {t('eter.firstVisit')} <span aria-hidden="true">↗</span>
                  </button>
                </div>
                <div className="eter-hero-foot">
                  <span>{t('eter.signature')}</span>
                  <span>{t('eter.city')}</span>
                </div>
              </section>
              <div className="eter-principles">
                {[t('eter.principle1'), t('eter.principle2'), t('eter.principle3')].map(
                  (text, i) => (
                    <div key={text}>
                      <span>0{i + 1}</span>
                      <p>{text}</p>
                    </div>
                  ),
                )}
              </div>
              {treatments}
              {space}
            </>
          )}
          {view === 'treatments' && treatments}
          {view === 'space' && (
            <>
              {space}
              <div className="eter-philosophy">
                <span className="eter-kicker">{t('eter.philosophy')}</span>
                <h3>{t('eter.philosophyTitle')}</h3>
                <p>{t('eter.philosophyText')}</p>
              </div>
            </>
          )}
          {view === 'booking' && (
            <section className="eter-booking-layout">
              <div className="eter-booking-intro">
                <span className="eter-kicker">{t('eter.firstStep')}</span>
                <h3>{t('eter.bookingTitle')}</h3>
                <p>{t('eter.bookingText')}</p>
                <Photo name="eter-clinic" alt={t('eter.imageAlt')} />
              </div>
              {renderBooking(chosen)}
            </section>
          )}
        </div>
        <footer className="eter-footer">
          <BrandMark theme="eter" />
          <div>
            <span className="eter-kicker">{t('eter.visit')}</span>
            <h4>{t('eter.city')}</h4>
            <p>{t('eter.visitText')}</p>
          </div>
          <div>
            <span className="eter-kicker">{t('eter.contact')}</span>
            <button type="button" onClick={() => book()}>
              {t('eter.book')} <span aria-hidden="true">↗</span>
            </button>
            <p>{t('eter.appointmentOnly')}</p>
          </div>
          <small>{t('mockupexperience.058')}</small>
        </footer>
      </div>
    </div>
  );
}
