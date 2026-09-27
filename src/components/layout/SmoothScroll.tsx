import { useEffect, useLayoutEffect } from 'react';
import {
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let scroll: Lenis | undefined;

/**
 * Guarda la posición de scroll asociada a cada entrada
 * del historial de React Router.
 */
const scrollPositions = new Map<string, number>();

export function pauseSmoothScroll(paused: boolean) {
  if (paused) {
    scroll?.stop();
  } else {
    scroll?.start();
  }
}

export function scrollPage(
  target: number | HTMLElement,
  immediate = false,
) {
  if (scroll) {
    scroll.resize();

    scroll.scrollTo(target, {
      immediate,
      force: true,
    });

    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({
      top: target,
      behavior: immediate ? 'instant' : 'auto',
    });

    return;
  }

  target.scrollIntoView({
    behavior: immediate ? 'instant' : 'auto',
  });
}

export default function SmoothScroll() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  /*
   * Evitamos que el navegador y Lenis intenten restaurar
   * el scroll simultáneamente.
   */
  useEffect(() => {
    const previous = window.history.scrollRestoration;

    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  /*
   * Inicialización de Lenis.
   */
  useEffect(() => {
    const preference = matchMedia(
      '(prefers-reduced-motion: no-preference) and (pointer: fine)',
    );

    function configure() {
      scroll?.destroy();
      scroll = undefined;

      if (!preference.matches) {
        return;
      }

      scroll = new Lenis({
        autoRaf: true,
        lerp: 0.16,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
        stopInertiaOnNavigate: true,
        // Deja scroll nativo dentro de un campo solo mientras pueda desplazarse.
        // En sus límites, la rueda vuelve a desplazar la página con Lenis.
        allowNestedScroll: true,

        prevent: (node) =>
          node.matches(
            'select, [data-lenis-prevent]',
          ),
      });

      if (document.querySelector('dialog[open]')) {
        scroll.stop();
      }
    }

    configure();

    preference.addEventListener('change', configure);

    return () => {
      preference.removeEventListener('change', configure);

      scroll?.destroy();
      scroll = undefined;
    };
  }, []);

  /*
   * Guardamos continuamente la posición correspondiente
   * a la entrada actual del historial.
   */
  useEffect(() => {
    function saveScrollPosition() {
      scrollPositions.set(
        location.key,
        window.scrollY,
      );
    }

    saveScrollPosition();

    window.addEventListener(
      'scroll',
      saveScrollPosition,
      { passive: true },
    );

    return () => {
      saveScrollPosition();

      window.removeEventListener(
        'scroll',
        saveScrollPosition,
      );
    };
  }, [location.key]);

  /*
   * Restauración / reinicio de scroll.
   *
   * POP     = atrás / adelante
   * PUSH    = navegación normal
   * REPLACE = navegación reemplazando historial
   */
  useLayoutEffect(() => {
    let frame: number;

    frame = requestAnimationFrame(() => {
      /*
       * ATRÁS / ADELANTE
       *
       * Recuperamos exactamente la posición guardada.
       */
      if (navigationType === 'POP') {
        const savedPosition =
          scrollPositions.get(location.key);

        if (savedPosition !== undefined) {
          scrollPage(savedPosition, true);
          return;
        }

        /*
         * Si no existe una posición guardada pero hay hash,
         * usamos el anchor como fallback.
         */
        if (location.hash) {
          const id = decodeURIComponent(
            location.hash.slice(1),
          );

          const target =
            document.getElementById(id);

          if (target) {
            scrollPage(target, true);
          }
        }

        return;
      }

      /*
       * NAVEGACIÓN A UN ANCHOR
       */
      if (location.hash) {
        const id = decodeURIComponent(
          location.hash.slice(1),
        );

        const target =
          document.getElementById(id);

        if (target) {
          scrollPage(target);
          return;
        }
      }

      /*
       * NAVEGACIÓN NORMAL A OTRA RUTA
       *
       * Empieza arriba sin animar desde la posición
       * de la página anterior.
       */
      scrollPage(0, true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    location.key,
    location.pathname,
    location.search,
    location.hash,
    navigationType,
  ]);

  /*
   * Anchors internos.
   */
  useEffect(() => {
    function onAnchor(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>(
              'a[href^="#"]',
            )
          : null;

      const hash = link?.getAttribute('href');

      if (
        !hash ||
        hash === '#' ||
        link?.target ||
        link?.hasAttribute('download')
      ) {
        return;
      }

      let id: string;

      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }

      const target =
        document.getElementById(id);

      if (!target) {
        return;
      }

      event.preventDefault();

      /*
       * Si ya estamos en ese hash no creamos otra
       * entrada innecesaria en el historial.
       */
      if (location.hash === hash) {
        scrollPage(target);
      } else {
        navigate({
          pathname: location.pathname,
          search: location.search,
          hash,
        });
      }

      if (id === 'main') {
        target.focus({
          preventScroll: true,
        });
      }
    }

    document.addEventListener(
      'click',
      onAnchor,
    );

    return () => {
      document.removeEventListener(
        'click',
        onAnchor,
      );
    };
  }, [
    navigate,
    location.pathname,
    location.search,
    location.hash,
  ]);

  /*
   * Mantiene Lenis sincronizado con navegación
   * mediante teclado.
   */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        scroll &&
        !scroll.isStopped &&
        [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          'Tab',
          ' ',
        ].includes(event.key)
      ) {
        scroll.scrollTo(
          window.scrollY,
          { immediate: true },
        );
      }
    }

    window.addEventListener(
      'keydown',
      onKey,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        onKey,
      );
    };
  }, []);

  return null;
}
