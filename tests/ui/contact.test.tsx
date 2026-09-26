import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactForm from '../../src/components/ui/ContactForm';
import { setLocale } from '../../src/i18n';

let callbacks: {
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
};
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  setLocale('es');
  window.turnstile = {
    render: vi.fn((_element, options) => {
      callbacks = options;
      return 'test-widget';
    }),
    remove: vi.fn(),
  };
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
async function form() {
  render(
    <MemoryRouter>
      <ContactForm />
    </MemoryRouter>,
  );
  await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());
  fireEvent.change(screen.getByLabelText(/^Nombre/), { target: { value: 'Ana García' } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText(/Empresa/), { target: { value: 'Estudio' } });
  fireEvent.change(screen.getByLabelText(/Cuéntanos/), {
    target: { value: 'Una consulta de prueba suficientemente larga.' },
  });
  fireEvent.click(screen.getByRole('checkbox'));
  await act(async () => callbacks.callback('test-only-token'));
  return screen.getByRole('button', { name: /ENCENDER LA IDEA/ });
}
describe('Formulario real con respuestas de red simuladas', () => {
  it('doble envío simultáneo realiza un POST; éxito limpia datos y reinicia widget', async () => {
    let resolve!: (value: Response) => void;
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    const button = await form();
    const nativeForm = button.closest('form')!;
    act(() => {
      fireEvent.submit(nativeForm);
      fireEvent.submit(nativeForm);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((button as HTMLButtonElement).disabled).toBe(true);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body).turnstileToken).toBe('test-only-token');
    expect(init.credentials).toBe('omit');
    await act(async () => resolve(Response.json({ ok: true, code: 'sent' })));
    expect(screen.getByText('MENSAJE ENVIADO')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /VOLVER AL FORMULARIO/ }));
    expect((screen.getByLabelText(/^Nombre/) as HTMLInputElement).value).toBe('');
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalledTimes(2));
  });
  it('error del correo conserva datos, informa y permite reintentar con token nuevo', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ ok: false, code: 'email_unavailable' }, { status: 502 }),
    );
    const button = await form();
    fireEvent.click(button);
    await screen.findByText(/No se ha podido confirmar el envío del correo/);
    expect((screen.getByLabelText(/^Nombre/) as HTMLInputElement).value).toBe('Ana García');
    expect(screen.queryByText('MENSAJE ENVIADO')).toBeNull();
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalledTimes(2));
    await act(async () => callbacks.callback('new-test-token'));
    expect(
      (screen.getByRole('button', { name: /ENCENDER LA IDEA/ }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });
  it('token expirado bloquea el envío hasta completar nueva verificación', async () => {
    const button = await form();
    await act(async () => callbacks['expired-callback']());
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/La verificación ha caducado/)).toBeTruthy();
    fireEvent.submit(button.closest('form')!);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'REINTENTAR VERIFICACIÓN' }));
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalledTimes(2));
  });
  it('Turnstile rechazado por servidor conserva datos y muestra error específico', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ ok: false, code: 'turnstile_invalid' }, { status: 403 }),
    );
    const button = await form();
    fireEvent.click(button);
    await screen.findByText(/La verificación no es válida/);
    expect((screen.getByLabelText(/^Email/) as HTMLInputElement).value).toBe('ana@example.com');
  });
  it('el widget no envía datos del cliente; cambia el idioma sin borrar el formulario', async () => {
    await form();
    const options = vi.mocked(window.turnstile!.render).mock.calls[0][1];
    expect(options.action).toBe('contact');
    expect(JSON.stringify(options)).not.toContain('ana@example.com');
    await act(async () => setLocale('en'));
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalledTimes(2));
    expect((screen.getByLabelText(/^Name/) as HTMLInputElement).value).toBe('Ana García');
  });
});
