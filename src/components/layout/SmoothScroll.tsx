import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let scroll: Lenis | undefined;

export function pauseSmoothScroll(paused: boolean) {
  if (paused) scroll?.stop();
  else scroll?.start();
}

export function scrollPage(target: number | HTMLElement, immediate = false) {
  if (scroll) {
    scroll.resize();
    scroll.scrollTo(target, { immediate, force: true });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'auto' });
  } else target.scrollIntoView({ behavior: immediate ? 'instant' : 'auto' });
}

export default function SmoothScroll() {
  const navigate = useNavigate();
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine)');
    function configure() {
      scroll?.destroy();
      scroll = undefined;
      if (!preference.matches) return;
      scroll = new Lenis({
        autoRaf: true,
        lerp: 0.16,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        stopInertiaOnNavigate: true,
        prevent: (node) => node.matches('textarea, select, [data-lenis-prevent]'),
      });
      if (document.querySelector('dialog[open]')) scroll.stop();
    }
    function onAnchor(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null;
      const hash = link?.getAttribute('href');
      if (!hash || hash === '#' || link?.target || link?.hasAttribute('download')) return;
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      if (location.hash === hash) scrollPage(target);
      else navigate({ pathname: location.pathname, search: location.search, hash });
      if (id === 'main') target.focus({ preventScroll: true });
    }
    function onKey(event: KeyboardEvent) {
      if (
        scroll &&
        !scroll.isStopped &&
        ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Tab', ' '].includes(
          event.key,
        )
      ) {
        scroll.scrollTo(window.scrollY, { immediate: true });
      }
    }
    configure();
    preference.addEventListener('change', configure);
    document.addEventListener('click', onAnchor);
    window.addEventListener('keydown', onKey);
    return () => {
      preference.removeEventListener('change', configure);
      document.removeEventListener('click', onAnchor);
      window.removeEventListener('keydown', onKey);
      scroll?.destroy();
      scroll = undefined;
    };
  }, [navigate]);
  return null;
}
