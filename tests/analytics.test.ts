import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, analyticsPath } from '../src/lib/analyticsCore.ts';

function environment() {
  const scripts: any[] = [];
  const deletions: string[] = [];
  let reloads = 0;
  let allowed = false;
  const location = {
    origin: 'https://example.test',
    hostname: 'example.test',
    pathname: '/contacto',
    search: '?email=private@example.test',
    hash: '#private',
    reload: () => {
      reloads++;
    },
  };
  const win: any = { location };
  const doc = {
    get cookie() {
      return '_ga=123; _ga_TEST=456; essential=keep';
    },
    set cookie(value: string) {
      deletions.push(value);
    },
    head: { append: (script: any) => scripts.push(script) },
    createElement: () => ({
      remove() {
        this.removed = true;
      },
      removed: false,
      onload: null,
      onerror: null,
    }),
  };
  Object.assign(globalThis, { window: win, document: doc, location });
  const controller = createAnalytics(
    { configured: true, id: 'G-TEST', cookieSeconds: 180 * 86400 },
    () => allowed,
  );
  const commands = () => (win.dataLayer || []).map((args: any) => Array.from(args) as any[]);
  return {
    scripts,
    deletions,
    win,
    location,
    controller,
    commands,
    allow: (value: boolean) => {
      allowed = value;
    },
    reloads: () => reloads,
  };
}

test('Ningún script ni evento se crea sin consentimiento o sin configuración', () => {
  const e = environment();
  e.controller.sync();
  assert.equal(e.scripts.length, 0);
  assert.equal(e.commands().length, 0);
  assert.equal(e.reloads(), 0);
  createAnalytics({ configured: false, id: '', cookieSeconds: 180 * 86400 }, () => true).sync();
  assert.equal(e.scripts.length, 0);
});

test('Aceptación: un script, consentimiento previo, page views sin duplicados ni datos de URL', () => {
  const e = environment();
  e.allow(true);
  e.controller.sync();
  e.controller.sync();
  assert.equal(e.scripts.length, 1);
  assert.equal(e.commands().filter((c) => c[0] === 'event').length, 0);
  e.scripts[0].onload();
  e.controller.sync();
  const views = () => e.commands().filter((c) => c[0] === 'event');
  assert.equal(views().length, 1);
  assert.equal(views()[0][2].page_location, 'https://example.test/contacto');
  assert.ok(!JSON.stringify(e.commands()).includes('private'));
  const config = e.commands().find((c) => c[0] === 'config')![2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.cookie_update, false);
  assert.equal(config.cookie_expires, 15552000);
  assert.equal(e.commands()[0][2].analytics_storage, 'denied');
  e.location.pathname = '/nosotros';
  e.controller.sync();
  e.controller.sync();
  assert.equal(views().length, 2);
});

test('Retirada: bloqueo, cookies eliminadas, sin más eventos y recarga del runtime', () => {
  const e = environment();
  e.allow(true);
  e.controller.sync();
  e.scripts[0].onload();
  e.allow(false);
  e.controller.sync();
  assert.equal(e.win['ga-disable-G-TEST'], true);
  assert.equal(e.scripts[0].removed, true);
  assert.equal(e.reloads(), 1);
  assert.ok(e.deletions.some((c) => c.startsWith('_ga=;')));
  assert.ok(e.deletions.some((c) => c.startsWith('_ga_TEST=;')));
  assert.ok(e.deletions.every((c) => !c.startsWith('essential=')));
  e.location.pathname = '/proyectos';
  e.controller.sync();
  assert.equal(e.commands().filter((c) => c[0] === 'event').length, 1);
});

test('Retirar permiso durante la descarga impide el evento tardío', () => {
  const e = environment();
  e.allow(true);
  e.controller.sync();
  const lateLoad = e.scripts[0].onload;
  e.allow(false);
  e.controller.sync();
  lateLoad();
  assert.equal(e.commands().filter((c) => c[0] === 'event').length, 0);
});

test('No envía rutas desconocidas que puedan contener datos personales', () => {
  assert.equal(analyticsPath('/cliente/private@example.test'), '/404');
  assert.equal(analyticsPath('/proyectos/clinica-dental'), '/proyectos/clinica-dental');
});
