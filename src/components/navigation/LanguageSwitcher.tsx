import { locales, setLocale, t, useLocale } from '../../i18n';

export default function LanguageSwitcher() {
  const locale = useLocale();
  return (
    <div className="language-switcher" role="group" aria-label={t('language.selector')}>
      {locales.map((language) => (
        <button
          key={language}
          type="button"
          lang={language}
          aria-label={`${language.toUpperCase()} — ${t(`language.${language}`)}`}
          aria-pressed={locale === language}
          onClick={() => setLocale(language)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
