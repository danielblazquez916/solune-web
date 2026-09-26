import { t, useLocale } from '../../i18n';
import { useLocation } from 'react-router-dom';

export default function SEO({
  title,
  description,
  noindex = false,
}: {
  title: string;
  description: string;
  noindex?: boolean;
}) {
  const locale = useLocale();
  const { pathname } = useLocation();
  const base = (import.meta.env.VITE_SITE_URL || 'https://solune.dev').replace(/\/$/, '');
  const fullTitle = title === t('seo.001') ? t('seo.002') : t('seo.003', { v0: title });
  const canonical = `${base}${pathname}${locale === 'en' ? '?lang=en' : ''}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="es" href={`${base}${pathname}`} />
      <link rel="alternate" hrefLang="en" href={`${base}${pathname}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={`${base}${pathname}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={locale === 'es' ? 'es_ES' : 'en_GB'} />
      <meta property="og:locale:alternate" content={locale === 'es' ? 'en_GB' : 'es_ES'} />
      <meta property="og:image" content={`${base}/og-cover.png`} />
      {noindex && <meta name="robots" content="noindex,follow" />}
    </>
  );
}
