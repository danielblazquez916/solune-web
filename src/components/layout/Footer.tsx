import { t, useLocale } from '../../i18n';
import { Link } from 'react-router-dom';
import { getNavItems } from '../navigation/Navigation';
import { openCookieSettings } from '../../lib/consent';

export default function Footer() {
  useLocale();
  return (
    <footer className="site-footer container">
      <div className="footer-top">
        <div>
          <p className="eyebrow">
            {t('footer.001')}
            <br />
            {t('footer.002')}
          </p>
          <a className="footer-email" href="mailto:hola@solune.dev">
            {t('footer.003')}
          </a>
        </div>
        <nav aria-label={t('footer.004')}>
          {getNavItems()
            .slice(1)
            .map(([to, name]) => (
              <Link key={to} to={to}>
                {name}
              </Link>
            ))}
        </nav>
        <div className="footer-location">
          <p className="eyebrow">
            {t('footer.005')}
            <br />
            {t('footer.006')}
          </p>
          <p className="eyebrow muted">
            {t('footer.007')}
            <br />
            <span className="social-note">{t('footer.008')}</span>
          </p>
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        {t('footer.009')}
        <span>®</span>
        <span className="footer-spark">✳</span>
      </div>
      <div className="footer-bottom eyebrow">
        <span>
          © {new Date().getFullYear()} {t('footer.010')}
        </span>
        <span>{t('footer.011')}</span>
        <nav className="footer-legal" aria-label={t('legal.navigation')}>
          <Link to="/legal">{t('legal.notice')}</Link>
          <Link to="/privacidad">{t('footer.012')}</Link>
          <Link to="/cookies">{t('legal.cookies')}</Link>
          <button onClick={openCookieSettings}>{t('cookies.configure')}</button>
        </nav>
        <a href="#top">{t('footer.013')}</a>
      </div>
    </footer>
  );
}
