import { t, useLocale } from '../../i18n';
import { useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import SEO from '../../components/ui/SEO';
import { Button, ContactCTA, Eyebrow, Reveal, SectionTitle } from '../../components/ui/Primitives';
import Marquee from '../../components/ui/Marquee';
import ProjectCard from '../../components/projects/ProjectCard';
import './value.css';
import ServiceList from '../../components/ui/ServiceList';
import { getProjects } from '../../data/projects';

export default function Home() {
  useLocale();
  const halo = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  function moveLight(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== 'mouse' || !halo.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    halo.current.style.setProperty('--mx', `${(event.clientX / box.width - 0.5) * 18}px`);
    halo.current.style.setProperty(
      '--my',
      `${((event.clientY - box.top) / box.height - 0.5) * 18}px`,
    );
  }
  return (
    <>
      <SEO title={t('seo.001')} description={t('home.001')} />
      <section className="home-hero container" onPointerMove={moveLight}>
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-kicker">
          <Eyebrow>
            <span className="status-dot" /> {t('home.002')}
          </Eyebrow>
          <Eyebrow className="hero-coordinate">
            {t('home.003')}
            <br />
            {t('home.004')}
          </Eyebrow>
        </div>
        <div className="hero-composition">
          <div className="hero-orbit" ref={halo} aria-hidden="true">
            <div className="orbit-haze" />
            <div className="orbit-ring" />
            <span className="orbit-cross cross-one">+</span>
            <span className="orbit-cross cross-two">+</span>
            <span className="orbit-label">{t('home.005')}</span>
          </div>
          <div className="hero-light-form" aria-hidden="true">
            <svg viewBox="0 0 620 430" role="presentation">
              <defs>
                <filter id="hero-light-blur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="9" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="hero-light-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff1a3" />
                  <stop offset="0.42" stopColor="#ffda55" />
                  <stop offset="1" stopColor="#d58d1b" />
                </linearGradient>
              </defs>
              <path
                className="light-trace light-trace-soft"
                d="M42 182C120 50 316 42 454 112c110 56 52 166-61 142-102-22-203-14-242 76-32 75 53 114 146 76 67-27 106-78 155-139"
                pathLength="1"
              />
              <path
                className="light-trace"
                d="M42 182C120 50 316 42 454 112c110 56 52 166-61 142-102-22-203-14-242 76-32 75 53 114 146 76 67-27 106-78 155-139"
                pathLength="1"
              />
              <path
                className="light-trace light-trace-secondary"
                d="M113 324c45-102 155-93 247-126 77-28 165-82 151-137"
                pathLength="1"
              />
              <circle className="light-node light-node-one" cx="42" cy="182" r="7" />
              <circle className="light-node light-node-two" cx="351" cy="254" r="6" />
              <circle className="light-node light-node-three" cx="414" cy="308" r="5" />
            </svg>
          </div>
          <motion.h1
            className="hero-headline"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span>{t('home.006')}</span>
            <span>
              {t('home.007')}{' '}
              <span className="hero-asterisk" aria-hidden="true">
                ✳
              </span>
            </span>
            <span className="hero-last">
              {t('home.008')}
              <span className="yellow">.</span>
            </span>
          </motion.h1>
          <div className="hero-side-note">
            <span className="technical-cross" aria-hidden="true">
              +
            </span>
            <p>
              {t('home.009')}
              <br />
              {t('home.010')}
              <br />
              {t('home.011')}
            </p>
          </div>
        </div>
        <div className="hero-bottom">
          <a className="scroll-link eyebrow" href="#selected-work">
            <span className="scroll-icon">↓</span> {t('home.012')}
          </a>
          <p>
            {t('home.013')}
            <br className="desktop-break" /> {t('home.014')}
          </p>
          <Button to="/proyectos">{t('home.015')}</Button>
        </div>
        <div className="hero-baseline eyebrow">
          <span>{t('home.016')}</span>
          <span>{t('home.017')}</span>
        </div>
      </section>
      <Marquee />
      <section id="selected-work" className="selected-work container section-space">
        <SectionTitle number="01" label={t('home.018')}>
          <Link to="/proyectos" className="text-link">
            {t('home.019')}
          </Link>
        </SectionTitle>
        <div className="work-intro">
          <Reveal>
            <h2 className="section-display">
              {t('home.020')}
              <br />
              <span className="offset-title">
                {t('home.021')}
                <span className="yellow"> (02)</span>
              </span>
            </h2>
          </Reveal>
          <p>
            {t('home.022')}
            <br />
            {t('home.023')}
            <span className="eyebrow">{t('home.024')}</span>
          </p>
        </div>
        <div className="projects-editorial">
          {getProjects().map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
      <section className="home-services container section-space">
        <SectionTitle number="02" label={t('home.025')} />
        <div className="value-heading">
          <Reveal>
            <h2>
              {t('value.title')}
              <br />
              <span>{t('value.highlight')}</span>
            </h2>
          </Reveal>
          <p>{t('value.intro')}</p>
        </div>
        <div className="value-grid">
          {(['clarity', 'trust', 'contact'] as const).map((kind, index) => (
            <Reveal key={kind} delay={index * 0.08} className={`value-item value-${kind}`}>
              <div className="value-art">
                <span className="eyebrow">{t(`value.${kind}.kicker`)}</span>
                {kind === 'clarity' && (
                  <div className="value-message" aria-hidden="true">
                    <span>{t('value.clarity.visual')}</span>
                    <i />
                    <i />
                    <b>↗</b>
                  </div>
                )}
                {kind === 'trust' && (
                  <div className="value-seal" aria-hidden="true">
                    <span>{t('value.trust.visual')}</span>
                    <strong>l.</strong>
                    <span>{t('value.trust.detail')}</span>
                  </div>
                )}
                {kind === 'contact' && (
                  <div className="value-conversation">
                    <p>{t('value.contact.visual')}</p>
                    <Link to="/contacto">
                      {t('value.contact.action')}
                      <span aria-hidden="true">↗</span>
                    </Link>
                    <svg aria-hidden="true" viewBox="0 0 24 30">
                      <path d="M2 1 22 19 12 19 8 28Z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="eyebrow value-number">
                0{index + 1} / {t(`value.${kind}.label`)}
              </p>
              <h3>{t(`value.${kind}.title`)}</h3>
              <p className="value-description">{t(`value.${kind}.text`)}</p>
            </Reveal>
          ))}
        </div>
        <div className="value-services-link">
          <Link to="/servicios" className="text-link">
            {t('home.032')}
          </Link>
        </div>
        <ServiceList />
      </section>
      <section className="manifesto section-space">
        <div className="container">
          <SectionTitle number="03" label={t('home.033')} />
          <Reveal>
            <h2>
              {t('home.034')}
              <br />
              {t('home.035')}
              <br />
              <span>
                {t('home.we')}
                <br />
                {t('home.036')}
              </span>
            </h2>
          </Reveal>
          <div className="manifesto-bottom">
            <span className="manifesto-symbol" aria-hidden="true">
              ✳
            </span>
            <p>{t('home.037')}</p>
            <Button to="/nosotros" secondary>
              {t('home.038')}
            </Button>
          </div>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
