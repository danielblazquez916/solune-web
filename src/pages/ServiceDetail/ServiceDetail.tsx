import { t, useLocale } from '../../i18n';
import { Link, useParams } from 'react-router-dom';
import { getServices } from '../../data/services';
import { getProjects } from '../../data/projects';
import SEO from '../../components/ui/SEO';
import {
  Button,
  ContactCTA,
  Eyebrow,
  PageHero,
  Reveal,
  SectionTitle,
} from '../../components/ui/Primitives';
import ProjectCard from '../../components/projects/ProjectCard';
import NotFound from '../NotFound/NotFound';

export default function ServiceDetail() {
  useLocale();
  const { slug } = useParams();
  const service = getServices().find((item) => item.slug === slug);
  if (!service) return <NotFound />;
  return (
    <>
      <SEO title={service.name} description={service.intro} />
      <div className="container breadcrumb">
        <Link to="/servicios">{t('servicedetail.001')}</Link>
        <span>/</span>
        <span>{service.name}</span>
      </div>
      <PageHero
        label={`${service.number} / ${service.name}`}
        lines={service.headline}
        text={service.intro}
      >
        <Button to={`/contacto?servicio=${service.slug}`}>
          {t('servicedetail.002')}
          {service.name.toUpperCase()}
        </Button>
      </PageHero>
      <section className="container section-space capabilities-section">
        <SectionTitle number="01" label={t('servicedetail.003')} />
        <div className="capabilities-list">
          {service.capabilities.map((capability, i) => (
            <Reveal key={capability} delay={i * 0.025}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{capability}</h2>
            </Reveal>
          ))}
        </div>
      </section>
      <section className={`service-visual visual-${service.slug}`}>
        <div className="service-visual-grid" aria-hidden="true" />
        <Eyebrow>{service.caption}</Eyebrow>
        <div className="service-symbol" aria-hidden="true">
          {service.visual}
        </div>
        <span className="eyebrow">
          {t('servicedetail.004')}
          {service.short} {t('servicedetail.005')}
        </span>
      </section>
      <section className="container section-space process-section">
        <SectionTitle number="02" label={t('servicedetail.006')} />
        <h2 className="section-display">
          {t('servicedetail.007')}
          <br />
          {t('servicedetail.008')}
        </h2>
        <ol className="process-list">
          {service.process.map((step, index) => (
            <li key={step}>
              <span className="eyebrow">0{index + 1}</span>
              <h3>{step}</h3>
              <span aria-hidden="true">↗</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="benefits container section-space">
        <SectionTitle number="03" label={t('servicedetail.009')} />
        <div>
          {service.benefits.map((benefit, i) => (
            <Reveal key={benefit}>
              <span className="eyebrow">0{i + 1} —</span>
              <h3>{benefit}</h3>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="container related-project section-space">
        <SectionTitle number="04" label={t('servicedetail.010')}>
          <Link className="text-link" to="/proyectos">
            {t('servicedetail.011')}
          </Link>
        </SectionTitle>
        <ProjectCard project={getProjects()[service.related]} />
      </section>
      <ContactCTA />
    </>
  );
}
