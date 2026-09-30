import { afterEach, beforeEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import CapabilityExplorer from '../../src/pages/ServiceDetail/CapabilityExplorer';
import { setLocale } from '../../src/i18n';

beforeEach(() => setLocale('es'));
afterEach(cleanup);

it.each(['development', 'integrations'] as const)(
  'updates the preview for every %s option',
  (kind) => {
    render(<CapabilityExplorer kind={kind} />);
    const panel = screen.getByRole('region');
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(kind === 'development' ? 9 : 6);
    const descriptions = new Set<string>();
    for (const button of buttons) {
      fireEvent.click(button);
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(button.getAttribute('aria-controls')).toBe(panel.id);
      expect(buttons.filter((item) => item.getAttribute('aria-pressed') === 'true')).toHaveLength(
        1,
      );
      expect(within(panel).getByRole('heading').textContent).toBe(button.children[1].textContent);
      descriptions.add(panel.querySelector('.capability-description')!.textContent!);
      expect(panel.querySelector('svg, img')).not.toBeNull();
    }
    expect(descriptions.size).toBe(buttons.length);
  },
);

it('shows distinct brand assets and preserves the choice when changing language', () => {
  render(<CapabilityExplorer kind="development" />);
  fireEvent.click(screen.getByRole('button', { name: 'TypeScript' }));
  expect(screen.getByRole('region').querySelector('img')?.getAttribute('src')).toBe(
    '/technologies/typescript.svg',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Vite' }));
  expect(screen.getByRole('region').querySelector('img')?.getAttribute('src')).toBe(
    '/technologies/vite.svg',
  );
  act(() => setLocale('en'));
  expect(screen.getByRole('button', { name: 'Vite' }).getAttribute('aria-pressed')).toBe('true');
  expect(
    screen.getByRole('region', { name: 'Technology or capability details' }).textContent,
  ).toContain('A fast development environment');
});
