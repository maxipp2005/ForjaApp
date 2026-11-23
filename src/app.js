// Punto de entrada: rutas, delegación de eventos, atajos y Service Worker.
import { $, $$ } from './utils.js';
import { state, activeSession } from './store.js';
import { parse, go } from './router.js';
import { toast } from './ui.js';
import { unlockAudio } from './sound.js';
import * as today from './views/today.js';
import * as gym from './views/gym.js';
import * as mma from './views/mma.js';
import * as progress from './views/progress.js';
import * as settings from './views/settings.js';

const VIEWS = { hoy: today, gym, mma, progreso: progress, ajustes: settings };
const main = $('#main');
let current = null;

function render() {
  if (today.closePickerIfOpen()) { /* el gesto "atrás" cierra primero el buscador */ }
  const { view, sub, id } = parse();
  const name = VIEWS[view] ? view : 'hoy';
  const mod = VIEWS[name];
  current?.mod.unmount?.();
  main.innerHTML = mod.render(sub, id);
  current = { view: name, sub, id, mod };
  mod.mount?.(main, sub, id);
  $$('.nav__item').forEach((a) => { const on = a.dataset.route === name; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const dot = $('#gymDot'); if (dot) dot.hidden = !state.gym.active;
  scrollTo(0, 0);
}

main.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !main.contains(el)) return;
  const fn = current?.mod.actions?.[el.dataset.act];
  if (fn) { e.preventDefault(); Promise.resolve(fn(el, e, main, current.sub, current.id)).then(() => { const dot = $('#gymDot'); if (dot) dot.hidden = !state.gym.active; }); }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && today.closePickerIfOpen()) return;
  if (e.metaKey || e.ctrlKey || e.altKey || $('#sheet').open || today.pickerOpen()) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  const map = { 1: 'hoy', 2: 'gym', 3: 'mma', 4: 'progreso', 5: 'ajustes' };
  if (map[e.key]) go(map[e.key]);
});

addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

// Tema
settings.applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', settings.applyTheme);

// Service Worker: sin conexión y actualizaciones
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      const offer = (w) => toast('Hay una nueva versión de Forja', { action: 'Actualizar', timeout: 12000, onAction: () => w.postMessage('skip-waiting') });
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', () => { const w = reg.installing; w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); }); });
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloading) { reloading = true; location.reload(); } });
    } catch (err) { console.warn('[Forja] Service Worker no registrado', err); }
  });
}

addEventListener('hashchange', render);
if (!location.hash) history.replaceState(null, '', '#/hoy');
render();
