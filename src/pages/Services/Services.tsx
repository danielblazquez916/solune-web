import { t, useLocale } from '../../i18n';
import SEO from '../../components/ui/SEO';
import { ContactCTA, PageHero, SectionTitle } from '../../components/ui/Primitives';
import ServiceList from '../../components/ui/ServiceList';

export default function Services() {
  useLocale();
  return (
    <>
      <SEO title={t('servicedetail.001')} description={t('services.101')} />
      <PageHero
        label={t('services.102')}
        lines={[t('services.103'), t('services.104')]}
        text={t('services.105')}
      />
      <section className="container section-space">
        <SectionTitle number="01" label={t('services.106')} />
        <ServiceList detailed />
      </section>
      <section className="container service-promise">
        <span className="yellow big-spark" aria-hidden="true">
          ✳
        </span>
        <h2>
          {t('services.107')}
          <br />
          {t('services.108')}
        </h2>
        <p>{t('services.109')}</p>
      </section>
      <ContactCTA />
    </>
  );
}
