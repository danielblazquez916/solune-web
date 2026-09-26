import { t, useLocale } from '../../i18n';
import { Link } from 'react-router-dom';
import type { Project } from '../../data/projects';
import { Reveal } from '../ui/Primitives';
import Photo from '../ui/Photo';

export function BrandMark({ theme }: { theme: Project['theme'] }) {
  useLocale();
  return theme === 'nova' ? (
    <span className="nova-logo">
      <svg aria-hidden="true" viewBox="0 0 40 40">
        <path d="M6 28V12h8l12 16V12h8v16h-8L14 12v16Z" fill="currentColor" />
      </svg>
      {t('projectcard.001')}
      <span className="logo-sub">{t('projectcard.002')}</span>
    </span>
  ) : (
    <span className="eter-logo">
      {t('projectcard.003')}
      <span className="logo-sub">{t('projectcard.004')}</span>
    </span>
  );
}

export function ProjectArtwork({ project, large = false }: { project: Project; large?: boolean }) {
  useLocale();
  return (
    <div className={`project-artwork ${project.theme} ${large ? 'large-artwork' : ''}`}>
      {project.theme === 'nova' ? (
        <>
          <div className="nova-art-grid" />
          <div className="nova-art-word">
            {t('projectcard.001')}
            <span>®</span>
          </div>
          <div className="nova-poster">
            <BrandMark theme="nova" />
            <Photo
              name="dental-interior"
              alt={t('projectcard.005')}
              sizes="(max-width: 550px) 70vw, 35vw"
            />
            <div className="nova-poster-bottom">
              <span>
                {t('projectcard.006')}
                <br />
                {t('projectcard.007')}
              </span>
              <span className="round-icon">↗</span>
            </div>
          </div>
          <span className="artwork-caption">{t('projectcard.008')}</span>
          <div className="nova-orb" />
        </>
      ) : (
        <>
          <Photo className="eter-art-photo" name="eter-still-life" alt={t('projectcard.009')} />
          <div className="eter-art-shade" />
          <span className="eter-art-label">{t('projectcard.010')}</span>
          <div className="eter-art-word">
            {t('projectcard.003')}
            <span>{t('projectcard.011')}</span>
          </div>
          <div className="eter-art-card">
            <span>{t('projectcard.012')}</span>
            <small>
              {t('projectcard.013')}
              <br />
              {t('projectcard.014')}
            </small>
          </div>
          <span className="artwork-caption">{t('projectcard.015')}</span>
        </>
      )}
    </div>
  );
}

export default function ProjectCard({ project }: { project: Project }) {
  useLocale();
  return (
    <Reveal className={`project-card project-card-${project.theme}`}>
      <Link
        to={`/proyectos/${project.slug}`}
        aria-label={t('projectcard.016', { v0: project.name })}
        className="project-link"
      >
        <ProjectArtwork project={project} />
        <span className="project-view">{t('projectcard.017')}</span>
        <div className="project-caption">
          <div>
            <span className="eyebrow">
              {project.number} / {project.sector}
            </span>
            <h3>
              {project.name}
              <span aria-hidden="true">↗</span>
            </h3>
          </div>
          <div className="project-tags">
            <span>{t('projectcard.018')}</span>
            <span>{project.services.slice(1).join(' / ')}</span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
