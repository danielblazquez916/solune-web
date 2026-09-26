import { t, useLocale } from '../../i18n';
import { useId, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProjects, type Project } from '../../data/projects';
import { BrandMark, ProjectArtwork } from '../../components/projects/ProjectCard';
import MockupExperience, { BookingDemo } from '../../components/projects/MockupExperience';
import SEO from '../../components/ui/SEO';
import { Eyebrow, Reveal } from '../../components/ui/Primitives';
import NotFound from '../NotFound/NotFound';
import Photo from '../../components/ui/Photo';

function getSections() {
  return [
    t('projectdetail.001'),
    t('projectdetail.002'),
    t('projectdetail.003'),
    t('projectdetail.004'),
    t('projectdetail.005'),
    t('projectdetail.006'),
    t('projectdetail.007'),
    t('projectdetail.008'),
    t('projectdetail.009'),
  ];
}

function GuideSection({
  index,
  title,
  children,
}: {
  index: number;
  title?: string;
  children: ReactNode;
}) {
  useLocale();
  return (
    <section className="guide-section container" id={`guide-${index}`}>
      <div className="guide-section-title">
        <Eyebrow>
          0{index} / {getSections()[index - 1]}
        </Eyebrow>
        <h2>{title || getSections()[index - 1]}</h2>
      </div>
      {children}
    </section>
  );
}

function ComponentsShowcase({ project }: { project: Project }) {
  useLocale();
  const inputId = useId();
  const [saved, setSaved] = useState(false);
  return (
    <div className={`component-showcase ${project.theme}`}>
      <div className="component-library">
        <Eyebrow>{t('projectdetail.010')}</Eyebrow>
        <h3>{project.theme === 'nova' ? t('projectdetail.011') : t('projectdetail.012')}</h3>
        <button className="brand-button" onClick={() => setSaved(!saved)} aria-pressed={saved}>
          {saved ? t('projectdetail.013') : t('projectdetail.014')}
        </button>
        <label htmlFor={inputId}>{t('contactform.011')}</label>
        <input id={inputId} placeholder={t('projectdetail.015')} autoComplete="off" />
        <div className="sample-treatment">
          <span className="eyebrow">{t('projectdetail.016')}</span>
          <h4>{project.treatments[0].name}</h4>
          <p>{project.treatments[0].description}</p>
          <span>
            {project.treatments[0].duration} <span aria-hidden="true">↗</span>
          </span>
        </div>
        <p className="sample-caption">{t('projectdetail.017')}</p>
      </div>
      <BookingDemo project={project} />
    </div>
  );
}

export default function ProjectDetail() {
  useLocale();
  const { slug } = useParams();
  const projects = getProjects();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <NotFound />;
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const dental = project.theme === 'nova';
  return (
    <div className={`case-study case-${project.theme}`} key={project.slug}>
      <SEO
        title={project.name}
        description={t('projectdetail.018', { v0: project.name, v1: project.sector.toLowerCase() })}
      />
      <header className="case-hero container">
        <div className="breadcrumb">
          <Link to="/proyectos">{t('projectdetail.019')}</Link>
          <span>/</span>
          <span>{project.name}</span>
        </div>
        <div className="case-meta eyebrow">
          <span>
            <span className="status-dot" /> {t('projectdetail.020')}
            {project.number}
          </span>
          <span>{t('projectdetail.021')}</span>
          <span>{project.year}</span>
        </div>
        <h1>
          {project.name}
          <span>®</span>
        </h1>
        <div className="case-intro">
          <p>{project.tagline}</p>
          <span className="eyebrow">{project.services.join(' / ')}</span>
        </div>
      </header>
      <div className="case-artwork container">
        <ProjectArtwork project={project} large />
      </div>
      <nav className="guide-index container" aria-label={t('projectdetail.022')}>
        {getSections().map((section, i) => (
          <a href={`#guide-${i + 1}`} key={section}>
            0{i + 1} {section}
          </a>
        ))}
      </nav>
      <GuideSection index={1} title={dental ? t('projectdetail.023') : t('projectdetail.024')}>
        <div className="concept-copy">
          <p className="lead">{project.description}</p>
          <p>{t('projectdetail.025')}</p>
          <div className="concept-tags">
            {(dental
              ? [
                  t('projectdetail.026'),
                  t('projectdetail.027'),
                  t('projectdetail.028'),
                  t('projectdetail.029'),
                  t('projectdetail.030'),
                ]
              : [
                  t('projectdetail.031'),
                  t('projectdetail.032'),
                  t('projectdetail.033'),
                  t('projectdetail.034'),
                  t('projectdetail.035'),
                ]
            ).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </GuideSection>
      <GuideSection index={2} title={dental ? t('projectdetail.036') : t('projectdetail.037')}>
        <div className={`logo-showcase ${project.theme}`}>
          <div>
            <BrandMark theme={project.theme} />
            <span className="eyebrow">{t('projectdetail.038')}</span>
          </div>
          <div>
            <BrandMark theme={project.theme} />
            <span className="eyebrow">{t('projectdetail.039')}</span>
          </div>
          <div className="symbol-showcase">
            <span>{dental ? t('projectdetail.040') : t('projectcard.012')}</span>
            <p className="eyebrow">{t('projectdetail.041')}</p>
          </div>
        </div>
      </GuideSection>
      <GuideSection index={3} title={dental ? t('projectdetail.042') : t('projectdetail.043')}>
        <div className="color-palette">
          {project.colors.map((color) => (
            <div
              className="color-swatch"
              key={color.hex}
              style={{ background: color.hex, color: color.ink }}
            >
              <span className="swatch-dot" />
              <div>
                <h3>{color.name}</h3>
                <span className="eyebrow">{color.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </GuideSection>
      <GuideSection index={4} title={t('projectdetail.044')}>
        <div className={`typography-showcase ${project.theme}`}>
          <div className="type-display">
            <Eyebrow>
              {t('projectdetail.045')}
              {dental ? t('projectdetail.046') : t('projectdetail.047')}
            </Eyebrow>
            <span>{dental ? t('projectdetail.048') : t('projectdetail.049')}</span>
            <p>{dental ? t('projectdetail.050') : t('projectdetail.051')}</p>
          </div>
          <div className="type-specimens">
            <div>
              <Eyebrow>
                {t('projectdetail.052')}
                {dental ? t('projectdetail.053') : t('projectdetail.054')}
              </Eyebrow>
              <h3>{dental ? t('projectdetail.055') : t('projectdetail.056')}</h3>
            </div>
            <div>
              <Eyebrow>{t('projectdetail.057')}</Eyebrow>
              <p>{t('projectdetail.058')}</p>
            </div>
            <div>
              <Eyebrow>{t('projectdetail.059')}</Eyebrow>
              <span className="eyebrow">{t('projectdetail.060')}</span>
            </div>
          </div>
        </div>
      </GuideSection>
      <GuideSection index={5} title={dental ? t('projectdetail.061') : t('projectdetail.062')}>
        <div className={`grid-showcase ${project.theme}`}>
          <div className="grid-columns" aria-label={t('projectdetail.063')}>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
          <div className="grid-composition">
            <div>{t('projectdetail.064')}</div>
            <div>{t('projectdetail.065')}</div>
            <div>
              {t('projectdetail.066')}
              <br />
              {t('projectdetail.067')}
            </div>
          </div>
          <div className="grid-specs eyebrow">
            <span>{t('projectdetail.068')}</span>
            <span>{t('projectdetail.069')}</span>
            <span>
              {t('projectdetail.070')}
              {dental ? '24' : '32'} {t('projectdetail.071')}
            </span>
            <span>{t('projectdetail.072')}</span>
            <span>
              {t('projectdetail.073')}
              {dental ? '8' : '0'} {t('projectdetail.071')}
            </span>
            <span>{t('projectdetail.074')}</span>
          </div>
        </div>
      </GuideSection>
      <GuideSection index={6} title={t('projectdetail.075')}>
        <ComponentsShowcase project={project} />
      </GuideSection>
      <GuideSection index={7} title={dental ? t('projectdetail.076') : t('projectdetail.077')}>
        <p className="guide-note">
          {t('projectdetail.078')} {dental ? t('projectdetail.079') : t('projectdetail.080')}
          {t('projectdetail.081')}
        </p>
        <MockupExperience project={project} />
        <div className={`experience-gallery ${project.theme}`}>
          <Photo
            name={dental ? 'dental-interior' : 'eter-still-life'}
            alt={dental ? t('projectdetail.082') : t('projectdetail.083')}
          />
          <div>
            <Eyebrow>{t('projectdetail.084')}</Eyebrow>
            <h3>{dental ? t('projectdetail.085') : t('projectdetail.086')}</h3>
            <p>{dental ? t('projectdetail.087') : t('projectdetail.088')}</p>
          </div>
        </div>
      </GuideSection>
      <GuideSection index={8} title={t('projectdetail.089')}>
        <div className={`mobile-showcase ${project.theme}`}>
          <div className="mobile-copy">
            <Eyebrow>{t('projectdetail.090')}</Eyebrow>
            <h3>{dental ? t('projectdetail.091') : t('projectdetail.092')}</h3>
            <p>{t('projectdetail.093')}</p>
          </div>
          <MockupExperience project={project} mobile />
        </div>
      </GuideSection>
      <GuideSection index={9} title={t('projectdetail.094')}>
        <div className="details-showcase">
          <Reveal>
            <span className="detail-number">01</span>
            <h3>{t('projectdetail.095')}</h3>
            <p>{t('projectdetail.096')}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <span className="detail-number">02</span>
            <h3>{t('projectdetail.097')}</h3>
            <p>{t('projectdetail.098')}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="detail-number">03</span>
            <h3>{t('projectdetail.099')}</h3>
            <p>{t('projectdetail.100')}</p>
          </Reveal>
        </div>
      </GuideSection>
      <nav className="project-navigation container" aria-label={t('projectdetail.101')}>
        <Link className="text-link" to="/proyectos">
          {t('projectdetail.102')}
        </Link>
        <Link className="next-project" to={`/proyectos/${next.slug}`}>
          <span className="eyebrow">
            {t('projectdetail.103')}
            {next.sector}
          </span>
          <span>
            {next.name} <span aria-hidden="true">↗</span>
          </span>
        </Link>
      </nav>
    </div>
  );
}
