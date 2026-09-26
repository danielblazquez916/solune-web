import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeConsent, refreshConsent } from '../../lib/consent';
import { syncAnalytics } from '../../lib/analytics';

export default function Analytics() {
  const { pathname } = useLocation();
  useEffect(() => {
    const update = () => {
      refreshConsent();
      syncAnalytics();
    };
    const unsubscribe = subscribeConsent(syncAnalytics);
    const timer = window.setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => {
      unsubscribe();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  useEffect(() => {
    refreshConsent();
    syncAnalytics();
  }, [pathname]);
  return null;
}
