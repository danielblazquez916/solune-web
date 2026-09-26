import { useEffect } from 'react';
import { t } from '../../i18n';

// Mounted inside Suspense, so route code and its styles are ready before measuring assets.
export default function InitialLoad() {
  useEffect(() => {
    const screen = document.getElementById('boot-screen');
    const root = document.getElementById('root');
    if (!screen || !root) return;
    screen.setAttribute('aria-label', t('app.loading'));
    const controller = new AbortController();
    const { signal } = controller;
    let frame = 0;
    let deadline = 0;
    let minimum = 0;
    let removal = 0;

    function reveal() {
      if (signal.aborted) return;
      window.clearTimeout(deadline);
      const delay = Math.max(0, 180 - performance.now());
      minimum = window.setTimeout(() => {
        if (signal.aborted) return;
        root!.inert = false;
        root!.removeAttribute('aria-busy');
        screen!.classList.add('is-ready');
        screen!.setAttribute('aria-hidden', 'true');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        removal = window.setTimeout(() => screen!.remove(), reduced ? 0 : 340);
      }, delay);
    }

    frame = requestAnimationFrame(() => {
      const visibleImages = [...document.querySelectorAll<HTMLImageElement>('#root img')].filter(
        (image) => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
        },
      );
      const resources = visibleImages.map((image) => {
        image.loading = 'eager';
        return image.decode().catch(() => undefined);
      });
      // A stalled font/image must never trap the visitor behind the screen.
      const safety = new Promise<void>((resolve) => {
        deadline = window.setTimeout(resolve, 4000);
      });
      void Promise.race([Promise.allSettled([document.fonts.ready, ...resources]), safety]).then(
        reveal,
      );
    });
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
      [deadline, minimum, removal].forEach((timer) => window.clearTimeout(timer));
    };
  }, []);
  return null;
}
