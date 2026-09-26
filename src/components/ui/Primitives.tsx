import { t, useLocale } from '../../i18n';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

export function Arrow() {
  useLocale();
  return (
    <span aria-hidden="true" className="arrow">
      ↗
    </span>
  );
}

export function Button({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  useLocale();
  return (
    <Link className={`button ${secondary ? 'button-secondary' : ''}`} to={to}>
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  useLocale();
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  useLocale();
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PageHero({
  label,
  lines,
  text,
  children,
}: {
  label: string;
  lines: string[];
  text?: string;
  children?: ReactNode;
}) {
  useLocale();
  return (
    <section className="page-hero container">
      <Eyebrow>
        <span className="status-dot" />
        {label}
      </Eyebrow>
      <h1 className="display">
        {lines.map((line, index) => (
          <span key={line} className={index === lines.length - 1 ? 'muted-line' : ''}>
            {line}
          </span>
        ))}
      </h1>
      <div className="hero-after">
        {text && <p className="lead">{text}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({
  number,
  label,
  children,
}: {
  number: string;
  label: string;
  children?: ReactNode;
}) {
  useLocale();
  return (
    <div className="section-heading">
      <Eyebrow>
        ({number}) — {label}
      </Eyebrow>
      {children}
    </div>
  );
}

export function ContactCTA() {
  useLocale();
  return (
    <section className="contact-cta container">
      <Eyebrow>
        <span className="status-dot" /> {t('primitives.001')}
      </Eyebrow>
      <Link to="/contacto" className="cta-title">
        {t('primitives.002')}
        <br />
        <span>{t('primitives.003')}</span>
        <span className="cta-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <div className="cta-bottom">
        <p>{t('primitives.004')}</p>
        <span className="eyebrow">{t('primitives.005')}</span>
      </div>
    </section>
  );
}
