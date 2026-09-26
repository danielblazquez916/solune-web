import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { scrollPage } from './SmoothScroll';

export default function RouteEffects() {
  const { pathname, hash } = useLocation();
  const reduced = useReducedMotion();
  const initial = useRef(true);
  const previousPath = useRef(pathname);
  useEffect(() => {
    const pageChanged = previousPath.current !== pathname;
    let frame = 0;
    if (hash) {
      const immediate = initial.current || pageChanged;
      frame = requestAnimationFrame(() => {
        let id: string;
        try {
          id = decodeURIComponent(hash.slice(1));
        } catch {
          return;
        }
        const target = document.getElementById(id);
        if (target) scrollPage(target, immediate);
      });
    } else scrollPage(0, true);
    if (!initial.current && pageChanged)
      document.getElementById('main')?.focus({ preventScroll: true });
    previousPath.current = pathname;
    initial.current = false;
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return reduced ? null : (
    <motion.div
      key={pathname}
      aria-hidden="true"
      className="page-transition"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.38, ease: [0.76, 0, 0.24, 1] }}
    >
      <div />
    </motion.div>
  );
}
