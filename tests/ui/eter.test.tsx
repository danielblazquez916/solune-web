import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { getProjects } from '../../src/data/projects';
import { setLocale } from '../../src/i18n';
import MockupExperience from '../../src/components/projects/MockupExperience';
vi.mock('../../src/components/layout/SmoothScroll', () => ({ scrollPage: vi.fn() }));

vi.mock('../../src/components/ui/Photo', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
beforeEach(() => setLocale('es'));
afterEach(cleanup);

it('filtra Éter y lleva el tratamiento correcto a la reserva de demostración', () => {
  render(<MockupExperience project={getProjects()[1]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Corporal', exact: true }));
  expect(screen.queryByRole('heading', { name: 'Cuidado facial' })).toBeNull();
  expect(screen.getByRole('heading', { name: 'Cuidado corporal' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Consultar Cuidado corporal' }));
  expect((screen.getByLabelText('Elige tu tratamiento') as HTMLSelectElement).value).toBe('1');
  fireEvent.click(screen.getByRole('button', { name: 'Probar reserva' }));
  expect(screen.getByRole('status').textContent).toContain('Cuidado corporal');
  expect(screen.getByRole('status').textContent).toContain('No se ha creado ninguna cita real');
  fireEvent.click(
    within(screen.getByRole('navigation')).getByRole('button', { name: 'La clínica' }),
  );
  expect(screen.getByRole('heading', { name: 'Primero, la persona.' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Éter — Inicio del prototipo' }));
  expect(screen.getByRole('heading', { name: /Sentirte bien/ })).toBeTruthy();
});

it('las demos de escritorio y móvil tienen controles independientes e IDs únicos', () => {
  const project = getProjects()[1];
  const { container } = render(
    <>
      <MockupExperience project={project} />
      <MockupExperience project={project} mobile />
    </>,
  );
  const navs = screen.getAllByRole('navigation');
  fireEvent.click(within(navs[1]).getByRole('button', { name: 'Pedir cita' }));
  expect(screen.getAllByRole('heading', { name: /Sentirte bien/ })).toHaveLength(1);
  const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it('muestra el nuevo prototipo en inglés y conserva el recorrido de NOVA', () => {
  setLocale('en');
  const { unmount } = render(<MockupExperience project={getProjects()[1]} />);
  expect(screen.getByRole('button', { name: 'Body', exact: true })).toBeTruthy();
  expect(screen.getByRole('heading', { name: /Feel well/ })).toBeTruthy();
  unmount();
  setLocale('es');
  render(<MockupExperience project={getProjects()[0]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Tratamientos' }));
  expect(screen.getByRole('heading', { name: 'Cada sonrisa, un camino.' })).toBeTruthy();
});
