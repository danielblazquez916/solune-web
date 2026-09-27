import { t, useLocale } from '../../i18n';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getServices } from '../../data/services';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLogo from '../ui/BrandLogo';
import { pauseSmoothScroll, scrollPage } from '../layout/SmoothScroll';

export function getNavItems() {
  return [
    ['/', t('navigation.001')],
    ['/nosotros', t('navigation.002')],
    ['/proyectos', t('navigation.003')],
    ['/servicios', t('navigation.004')],
    ['/contacto', t('navigation.005')],
  ];
}

export default function Navigation() {
  useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useEffect(() => {
    let previous = window.scrollY > 8;
    setScrolled(previous);
    function onScroll() {
      const next = window.scrollY > 8;
      if (next !== previous) {
        previous = next;
        setScrolled(next);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    pauseSmoothScroll(open);
    if (open) {
      dialog.current?.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      if (dialog.current?.open) {
        dialog.current.close();
        trigger.current?.focus();
      }
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      pauseSmoothScroll(false);
    };
  }, [open]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <Link
          to="/"
          aria-label={t('navigation.006')}
          className="wordmark"
          onClick={(event) => {
            if (
              location.pathname !== '/' ||
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) scrollPage(0, true);
            else if (matchMedia('(pointer: fine)').matches) scrollPage(0);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <BrandLogo />
          {t('footer.009')}
        </Link>
        <span className="header-descriptor eyebrow">{t('navigation.007')}</span>
        <div className="header-controls">
          <LanguageSwitcher />
          <button
            ref={trigger}
            className="menu-toggle"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
          >
            {t('navigation.008')}{' '}
            <span className="menu-icon">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>
      <dialog
        data-lenis-prevent
        id="site-menu"
        className="fullscreen-menu"
        ref={dialog}
        onCancel={() => setOpen(false)}
        aria-label={t('navigation.009')}
      >
        <div className="menu-top">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="wordmark"
            aria-label={t('navigation.006')}
          >
            <BrandLogo />
            {t('footer.009')}
          </Link>
          <div className="header-controls">
            <LanguageSwitcher />
            <button className="menu-toggle" onClick={() => setOpen(false)} autoFocus>
              {t('navigation.010')}
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
        <div className="menu-body">
          <nav>
            {getNavItems().map(([to, name], index) => (
              <NavLink end={to === '/'} onClick={() => setOpen(false)} key={to} to={to}>
                <span className="eyebrow">0{index}</span>
                <span>{name}</span>
                <span className="menu-link-arrow" aria-hidden="true">
                  ↗
                </span>
              </NavLink>
            ))}
          </nav>
          <aside>
            <div className="mini-orbit" aria-hidden="true" />
            <p className="eyebrow">{t('navigation.011')}</p>
            <div className="menu-services">
              {getServices().map((service) => (
                <Link
                  key={service.slug}
                  to={`/servicios/${service.slug}`}
                  onClick={() => setOpen(false)}
                >
                  {service.name}
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
            <a href="mailto:hola@solune.dev">{t('footer.003')}</a>
            <p className="eyebrow muted">{t('navigation.012')}</p>
          </aside>
        </div>
      </dialog>
    </>
  );
}
