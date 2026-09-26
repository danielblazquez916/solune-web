import { t, useLocale } from './i18n';
import { Suspense } from 'react';
import Navigation from './components/navigation/Navigation';
import Footer from './components/layout/Footer';
import RouteEffects from './components/layout/RouteEffects';
import AppRoutes from './router/AppRoutes';
import CursorGlow from './components/animations/CursorGlow';
import InitialLoad from './components/layout/InitialLoad';
import SmoothScroll from './components/layout/SmoothScroll';
import CookieConsent from './components/ui/CookieConsent';
import Analytics from './components/layout/Analytics';

export default function App() {
  useLocale();
  return (
    <>
      <SmoothScroll />
      <Analytics />
      <div id="top" />
      <CursorGlow />
      <a className="skip-link" href="#main">
        {t('app.001')}
      </a>
      <Navigation />
      <main id="main" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="route-loading" role="status">
              {t('app.loading')}
              <span>…</span>
            </div>
          }
        >
          <AppRoutes />
          <InitialLoad />
          <RouteEffects />
        </Suspense>
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}
