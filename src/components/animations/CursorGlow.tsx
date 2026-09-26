import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const light = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const allowed = matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let cleanup = () => {};
    function configure() {
      cleanup();
      const element = light.current;
      if (!element || !allowed.matches) return;
      let frame = 0;
      let x = 0,
        y = 0,
        targetX = 0,
        targetY = 0;
      let visible = false;
      function tick() {
        x += (targetX - x) * 0.12;
        y += (targetY - y) * 0.12;
        element!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2)
          frame = requestAnimationFrame(tick);
        else frame = 0;
      }
      function move(event: PointerEvent) {
        if (event.pointerType !== 'mouse') return;
        targetX = event.clientX;
        targetY = event.clientY;
        if (!visible) {
          x = targetX;
          y = targetY;
          visible = true;
          element!.style.opacity = '1';
        }
        if (!frame) frame = requestAnimationFrame(tick);
      }
      function hide() {
        visible = false;
        element!.style.opacity = '0';
        cancelAnimationFrame(frame);
        frame = 0;
      }
      window.addEventListener('pointermove', move, { passive: true });
      document.documentElement.addEventListener('pointerleave', hide);
      window.addEventListener('blur', hide);
      cleanup = () => {
        hide();
        window.removeEventListener('pointermove', move);
        document.documentElement.removeEventListener('pointerleave', hide);
        window.removeEventListener('blur', hide);
      };
    }
    configure();
    allowed.addEventListener('change', configure);
    return () => {
      cleanup();
      allowed.removeEventListener('change', configure);
    };
  }, []);
  return (
    <div className="cursor-glow-layer" aria-hidden="true">
      <div ref={light} className="cursor-glow">
        <span />
      </div>
    </div>
  );
}
