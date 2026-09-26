import { t, useLocale } from '../../i18n';
import { useId, useState } from 'react';
import type { Project } from '../../data/projects';
import { BrandMark } from './ProjectCard';
import Photo from '../ui/Photo';

export function BookingDemo({
  project,
  initialTreatment,
}: {
  project: Project;
  initialTreatment?: number;
}) {
  useLocale();
  const prefix = useId();
  const [treatment, setTreatment] = useState(initialTreatment ?? 0);
  const [day, setDay] = useState(12);
  const [time, setTime] = useState('10:00');
  const [done, setDone] = useState(false);
  return (
    <div className="booking-demo">
      <div className="booking-heading">
        <span className="eyebrow">{t('mockupexperience.001')}</span>
        <h3>{project.theme === 'nova' ? t('mockupexperience.002') : t('mockupexperience.003')}</h3>
        <p>{t('mockupexperience.004')}</p>
      </div>
      <label htmlFor={`${prefix}-treatment`}>{t('mockupexperience.005')}</label>
      <select
        id={`${prefix}-treatment`}
        value={treatment}
        onChange={(e) => {
          setTreatment(Number(e.target.value));
          setDone(false);
        }}
      >
        {project.treatments.map((item, index) => (
          <option key={index} value={index}>
            {item.name}
          </option>
        ))}
      </select>
      <fieldset className="calendar">
        <legend>{t('mockupexperience.006')}</legend>
        <div className="calendar-week" aria-hidden="true">
          {[
            t('mockupexperience.007'),
            t('mockupexperience.008'),
            t('mockupexperience.009'),
            t('mockupexperience.010'),
            t('mockupexperience.011'),
            t('mockupexperience.012'),
            t('mockupexperience.013'),
          ].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="calendar-days">
          {[0, 1, 2].map((i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
            <button
              type="button"
              key={date}
              aria-label={t('mockupexperience.014', { v0: date })}
              aria-pressed={day === date}
              className={day === date ? 'selected' : ''}
              onClick={() => {
                setDay(date);
                setDone(false);
              }}
            >
              {date}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="booking-times">
        <legend>{t('mockupexperience.015')}</legend>
        {['10:00', '12:30', '16:00'].map((hour) => (
          <button
            type="button"
            key={hour}
            className={time === hour ? 'selected' : ''}
            aria-pressed={time === hour}
            onClick={() => {
              setTime(hour);
              setDone(false);
            }}
          >
            {hour}
          </button>
        ))}
      </fieldset>
      <button className="brand-button" onClick={() => setDone(true)}>
        {t('mockupexperience.016')}
        <span aria-hidden="true">↗</span>
      </button>
      <p role="status" className="booking-status">
        {done
          ? t('mockupexperience.017', { v0: project.treatments[treatment].name, v1: day, v2: time })
          : t('mockupexperience.018')}
      </p>
    </div>
  );
}

export default function MockupExperience({
  project,
  mobile = false,
}: {
  project: Project;
  mobile?: boolean;
}) {
  useLocale();
  const [view, setView] = useState('home');
  const [chosenTreatment, setChosenTreatment] = useState(0);
  const views = [
    { id: 'home', label: t('mockupexperience.019') },
    {
      id: 'treatments',
      label: project.theme === 'nova' ? t('mockupexperience.020') : t('mockupexperience.021'),
    },
    {
      id: 'team',
      label: project.theme === 'nova' ? t('mockupexperience.022') : t('mockupexperience.023'),
    },
    { id: 'booking', label: t('mockupexperience.024') },
  ];
  const panelId = useId();
  return (
    <div className={`mockup-frame ${project.theme} ${mobile ? 'phone-frame' : ''}`}>
      <div className="browser-chrome" aria-hidden="true">
        <span>● ● ●</span>
        <span>
          {project.theme === 'nova' ? 'nova' : 'eter'}
          {t('mockupexperience.025')}
          {view.toLowerCase()}
        </span>
        <span>↗</span>
      </div>
      <div className="mockup-shell">
        <header className="mockup-nav">
          <BrandMark theme={project.theme} />
          <nav
            aria-label={t('mockupexperience.026', {
              v0: project.name,
              v1: mobile ? t('mockup.mobile') : '',
            })}
          >
            {views.map((item) => (
              <button
                key={item.id}
                aria-current={view === item.id ? 'page' : undefined}
                aria-controls={panelId}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <div id={panelId} className="mockup-panel">
          {view === 'home' && (
            <div className={`mock-home ${project.theme}-home`}>
              <div className="mock-home-copy">
                <span className="eyebrow">
                  {project.theme === 'nova' ? t('mockupexperience.027') : t('mockupexperience.028')}
                </span>
                <h3>
                  {project.theme === 'nova' ? (
                    <>
                      {t('mockupexperience.029')}
                      <br />
                      {t('mockupexperience.030')}
                      <br />
                      <em>{t('mockupexperience.031')}</em>
                    </>
                  ) : (
                    <>
                      {t('mockupexperience.032')}
                      <br />
                      {t('mockupexperience.033')}
                      <br />
                      <em>{t('mockupexperience.034')}</em>
                    </>
                  )}
                </h3>
                <p>
                  {project.theme === 'nova' ? t('mockupexperience.035') : t('mockupexperience.036')}
                </p>
                <button className="brand-button" onClick={() => setView('booking')}>
                  {project.theme === 'nova' ? t('mockupexperience.037') : t('mockupexperience.038')}{' '}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
              <div className="mock-home-image">
                <Photo
                  name={project.theme === 'nova' ? 'dental-interior' : 'eter-still-life'}
                  alt={
                    project.theme === 'nova' ? t('mockupexperience.039') : t('mockupexperience.040')
                  }
                />
                {project.theme === 'eter' && (
                  <span className="eter-image-caption">
                    {t('mockupexperience.041')}
                    <br />
                    {t('mockupexperience.042')}
                  </span>
                )}
              </div>
            </div>
          )}
          {view === 'treatments' && (
            <div className="mock-treatments">
              <span className="eyebrow">{t('mockupexperience.043')}</span>
              <h3>
                {project.theme === 'nova' ? t('mockupexperience.044') : t('mockupexperience.045')}
              </h3>
              {project.treatments.map((item, i) => (
                <article key={item.name}>
                  <span>0{i + 1}</span>
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <span>
                    {item.duration}
                    <br />
                    {item.price}
                  </span>
                  <button
                    aria-label={t('mockupexperience.046', { v0: item.name })}
                    onClick={() => {
                      setChosenTreatment(i);
                      setView('booking');
                    }}
                  >
                    ↗
                  </button>
                </article>
              ))}
            </div>
          )}
          {view === 'team' && (
            <div className="mock-team">
              <div>
                <span className="eyebrow">{t('mockupexperience.047')}</span>
                <h3>
                  {project.theme === 'nova' ? t('mockupexperience.048') : t('mockupexperience.049')}
                </h3>
                <p>
                  {project.theme === 'nova' ? t('mockupexperience.050') : t('mockupexperience.051')}
                </p>
                <div className="mock-specialists">
                  <span>
                    {project.theme === 'nova'
                      ? t('mockupexperience.052')
                      : t('mockupexperience.053')}
                  </span>
                  <span>
                    {project.theme === 'nova'
                      ? t('mockupexperience.054')
                      : t('mockupexperience.055')}
                  </span>
                </div>
                <small>{t('mockupexperience.056')}</small>
              </div>
              <Photo
                name={project.theme === 'nova' ? 'dental-interior' : 'studio-interior'}
                alt={t('mockupexperience.057')}
              />
            </div>
          )}
          {view === 'booking' && (
            <BookingDemo project={project} initialTreatment={chosenTreatment} />
          )}
        </div>
        <div className="mock-footer">
          <span>{project.name} © 2026</span>
          <span>{t('mockupexperience.058')}</span>
        </div>
      </div>
    </div>
  );
}
