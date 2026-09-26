import { t, useLocale } from '../../i18n';
import SEO from '../../components/ui/SEO';
import {
  ContactCTA,
  Eyebrow,
  PageHero,
  Reveal,
  SectionTitle,
} from '../../components/ui/Primitives';
import Marquee from '../../components/ui/Marquee';
import Photo from '../../components/ui/Photo';
import Toolkit from './Toolkit';
import './about.css';

function getSteps() {
  return [
    [t('about.001'), t('about.002')],
    [t('services.001'), t('about.003')],
    [t('about.004'), t('about.005')],
    [t('about.006'), t('about.007')],
    [t('about.008'), t('about.009')],
  ];
}

export default function About() {
  useLocale();
  return (
    <div className="about-page">
      <SEO title={t('mockupexperience.023')} description={t('about.010')} />
      <div className="about-intro">
        <PageHero
          label={t('about.011')}
          lines={[t('about.012'), t('about.013')]}
          text={t('about.014')}
        />
        <div className="studio-signature container" aria-hidden="true">
          <span>{t('about.signature')}</span>
          <span className="studio-signal">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>{t('about.signatureEnd')}</span>
        </div>
      </div>
      <section className="about-visual container">
        <div className="about-image">
          <Photo name="studio-interior" alt={t('about.015')} />
          <span className="eyebrow">{t('about.016')}</span>
        </div>
        <div className="about-quote">
          <Eyebrow>{t('about.017')}</Eyebrow>
          <h2>
            {t('about.018')}
            <br />
            {t('about.019')}
            <br />
            <em>{t('about.020')}</em>
          </h2>
          <p>{t('about.021')}</p>
        </div>
      </section>
      <section className="container section-space">
        <SectionTitle number="01" label={t('about.022')} />
        <div className="values-grid">
          {[
            [t('about.023'), t('about.024')],
            [t('about.025'), t('about.026')],
            [t('about.027'), t('about.028')],
          ].map(([title, text], i) => (
            <Reveal key={title}>
              <Eyebrow>0{i + 1} /</Eyebrow>
              <h2>{title}</h2>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <Marquee />
      <section className="container section-space">
        <SectionTitle number="02" label={t('about.029')} />
        <h2 className="section-display">
          {t('about.030')}
          <br />
          <span className="muted-line">{t('about.031')}</span>
        </h2>
        <ol className="about-process">
          {getSteps().map(([title, text], i) => (
            <li key={title}>
              <span className="eyebrow">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <Toolkit />
      <ContactCTA />
    </div>
  );
}
