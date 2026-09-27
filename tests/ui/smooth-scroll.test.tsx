import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SmoothScroll from '../../src/components/layout/SmoothScroll';

let smoothEnabled = true;

beforeEach(() => {
  smoothEnabled = true;
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: smoothEnabled,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  });
  // Keep animation frames pending: these tests exercise real Lenis wheel routing.
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(4000);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function field(scrollHeight = 100, scrollTop = 0, isolated = false) {
  render(
    <MemoryRouter>
      <SmoothScroll />
      <div {...(isolated ? { 'data-lenis-prevent': true } : {})}>
        <textarea aria-label="Mensaje" style={{ overflowY: 'auto', overscrollBehaviorY: 'auto' }} />
      </div>
    </MemoryRouter>,
  );
  const textarea = screen.getByRole('textbox');
  Object.defineProperties(textarea, {
    scrollHeight: { value: scrollHeight },
    clientHeight: { value: 100 },
    scrollTop: { value: scrollTop, writable: true },
  });
  return textarea;
}

function wheel(target: HTMLElement, deltaY: number) {
  const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

it('mantiene el scroll suave de la página sobre un campo sin desbordamiento', () => {
  expect(wheel(field(), 120).defaultPrevented).toBe(true);
  expect(document.documentElement.classList.contains('lenis-smooth')).toBe(true);
});

it.each([120, -120])('permite scroll nativo dentro de un mensaje largo (%s)', (deltaY) => {
  expect(wheel(field(600, 200), deltaY).defaultPrevented).toBe(false);
});

it.each([[0, -120], [500, 120]])('devuelve el scroll a la página en el límite %s', (top, deltaY) => {
  expect(wheel(field(600, top), deltaY).defaultPrevented).toBe(true);
  expect(document.documentElement.classList.contains('lenis-smooth')).toBe(true);
});

it('conserva el aislamiento del scroll de los diálogos', () => {
  expect(wheel(field(100, 0, true), 120).defaultPrevented).toBe(false);
});

it('conserva scroll nativo si no se cumplen las preferencias de movimiento y puntero', () => {
  smoothEnabled = false;
  expect(wheel(field(), 120).defaultPrevented).toBe(false);
  expect(document.documentElement.classList.contains('lenis')).toBe(false);
});
