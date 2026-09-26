import { t, useLocale } from '../../i18n';
import SEO from '../../components/ui/SEO';
import { Button, Eyebrow } from '../../components/ui/Primitives';

export default function NotFound() {
  useLocale();
  return (
    <section className="not-found container">
      <SEO title={t('notfound.001')} description={t('notfound.002')} noindex />
      <Eyebrow>{t('notfound.003')}</Eyebrow>
      <h1>
        4<span>◎</span>4
      </h1>
      <h2>{t('notfound.004')}</h2>
      <p>{t('notfound.005')}</p>
      <Button to="/">{t('notfound.006')}</Button>
    </section>
  );
}
