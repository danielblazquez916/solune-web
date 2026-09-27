import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactMethods from '../../src/pages/Contact/ContactMethods';
import { setLocale } from '../../src/i18n';
const mocks = vi.hoisted(() => ({ cal: vi.fn(), api: vi.fn(), pause: vi.fn() }));
vi.mock('@calcom/embed-react', () => ({
  getCalApi: mocks.api,
  default: ({ calLink }: { calLink: string }) => (
    <div data-testid="official-calendar">{calLink}</div>
  ),
}));
vi.mock('../../src/components/layout/SmoothScroll', () => ({ pauseSmoothScroll: mocks.pause }));
beforeEach(() => {
  setLocale('es');
  vi.clearAllMocks();
  mocks.api.mockResolvedValue(mocks.cal);
  window.turnstile = { render: vi.fn(() => 'test-widget'), remove: vi.fn() };
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function page() {
  return render(
    <MemoryRouter>
      <ContactMethods />
    </MemoryRouter>,
  );
}
it('conserva el borrador y un único Turnstile; las pestañas admiten teclado y no precargan Cal', async () => {
  page();
  await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Ana' } });
  const email = screen.getByRole('tab', { name: 'Prefiero un email' });
  fireEvent.keyDown(email, { key: 'ArrowRight' });
  expect(
    screen.getByRole('tab', { name: 'Prefiero una reunión' }).getAttribute('aria-selected'),
  ).toBe('true');
  expect(document.getElementById('contact-panel-email')?.hasAttribute('inert')).toBe(true);
  expect(screen.queryByRole('textbox', { name: /Nombre/ })).toBeNull();
  expect(mocks.api).not.toHaveBeenCalled();
  fireEvent.click(email);
  expect((screen.getByLabelText(/^Nombre/) as HTMLInputElement).value).toBe('Ana');
  expect(window.turnstile?.render).toHaveBeenCalledTimes(1);
});
it('abre el embed oficial en modal, pausa scroll, admite Escape y restaura el foco', async () => {
  page();
  fireEvent.click(screen.getByRole('tab', { name: 'Prefiero una reunión' }));
  const trigger = screen.getByRole('button', { name: 'Elegir día y hora' });
  trigger.focus();
  fireEvent.click(trigger);
  await screen.findByTestId('official-calendar');
  expect(screen.getByTestId('official-calendar').textContent).toBe('solune/reunion-solune');
  expect(mocks.pause).toHaveBeenCalledWith(true);
  const ready = mocks.cal.mock.calls.find(
    ([action, options]) => action === 'on' && options.action === 'linkReady',
  )![1].callback;
  act(() => ready());
  expect(screen.queryByText('Estamos abriendo la agenda…')).toBeNull();
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(mocks.pause).toHaveBeenLastCalledWith(false);
  expect(document.body.style.overflow).toBe('');
  expect(mocks.cal.mock.calls.filter(([a]) => a === 'off')).toHaveLength(2);
});
it('muestra el fallo del proveedor, permite reintentar y cierra con botón', async () => {
  page();
  fireEvent.click(screen.getByRole('tab', { name: 'Prefiero una reunión' }));
  fireEvent.click(screen.getByRole('button', { name: 'Elegir día y hora' }));
  await screen.findByTestId('official-calendar');
  const fail = mocks.cal.mock.calls.find(
    ([action, options]) => action === 'on' && options.action === 'linkFailed',
  )![1].callback;
  act(() => fail());
  expect(screen.getByText(/La agenda está tardando/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Volver a cargar la agenda' }));
  await waitFor(() => expect(mocks.api).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar agenda' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
