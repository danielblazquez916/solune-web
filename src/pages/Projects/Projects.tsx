import { t, useLocale } from '../../i18n';
import SEO from '../../components/ui/SEO';
import { ContactCTA, PageHero } from '../../components/ui/Primitives';
import ProjectCard from '../../components/projects/ProjectCard';
import { getProjects } from '../../data/projects';

export default function Projects() {
  useLocale();
  return (
    <>
      <SEO title={t('projectdetail.019')} description={t('projects.040')} />
      <PageHero
        label={t('projects.041')}
        lines={[t('home.020'), t('projects.042')]}
        text={t('projects.043')}
      />
      <section className="container projects-page">
        <div className="projects-notice eyebrow">
          <span>{t('projects.044')}</span>
          <span>{t('projects.045')}</span>
        </div>
        <div className="projects-editorial">
          {getProjects().map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
