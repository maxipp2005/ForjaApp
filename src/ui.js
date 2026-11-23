// Componentes de interfaz reutilizables: avisos, hojas modales y selectores.
import { $, esc, icon } from './utils.js';

// ---------- Avisos (toasts) ----------
export function toast(msg, { action, onAction, timeout = 3800 } = {}) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  box.appendChild(el);
  const close = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 300); };
  if (action) el.querySelector('button').onclick = () => { onAction?.(); close(); };
  setTimeout(close, timeout);
  while (box.children.length > 3) box.firstChild.remove();
}

// ---------- Hoja modal ----------
/**
 * Abre una hoja con un formulario. Resuelve con { value, data } al cerrarse.
 * value = valor del botón pulsado ('' si se cerró con Esc o tocando fuera).
 */
export function sheet({ title, text = '', body = '', actions, onOpen } = {}) {
  const dlg = $('#sheet');
  // Formulario nuevo en cada apertura: así no se acumulan escuchadores de hojas anteriores.
  const prevForm = $('#sheetInner');
  const form = prevForm.cloneNode(false);
  prevForm.replaceWith(form);
  actions ??= [{ label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'primary' }];
  const primary = actions.find((a) => a.kind === 'primary' || a.kind === 'accent');
  form.innerHTML = `
    ${primary ? `<button class="sr-only" value="${primary.value}" tabindex="-1" aria-hidden="true"></button>` : ''}
    ${title ?`<h2 class="sheet__title">${esc(title)}</h2>` : ''}
    ${text ? `<p class="sheet__text">${text}</p>` : ''}
    ${body}
    ${actions.length ? `<div class="sheet__actions">${actions.map((a) =>
      `<button class="btn btn--${a.kind || 'ghost'}" value="${a.value}" ${a.value === 'cancel' || a.novalidate ? 'formnovalidate' : ''}>${esc(a.label)}</button>`).join('')}</div>` : ''}`;
  dlg.returnValue = '';
  return new Promise((resolve) => {
    const close = (value) => { dlg.close(value); };
    const onBackdrop = (e) => { if (e.target === dlg) close(''); };
    dlg.addEventListener('click', onBackdrop);
    dlg.addEventListener('close', () => {
      dlg.removeEventListener('click', onBackdrop);
      const data = Object.fromEntries(new FormData(form));
      resolve({ value: dlg.returnValue, data, form });
    }, { once: true });
    dlg.showModal();
    onOpen?.(form, close);
    const first = form.querySelector('[autofocus]');
    if (first && matchMedia('(hover: hover)').matches) first.focus();
  });
}

export async function confirmSheet(title, text, { ok = 'Eliminar', kind = 'danger' } = {}) {
  const { value } = await sheet({ title, text, actions: [{ label: 'Cancelar', value: 'cancel' }, { label: ok, value: 'ok', kind }] });
  return value === 'ok';
}

/** Lista de opciones a elegir. options: [{ value, label, color?, hint? }] */
export async function pickSheet(title, options, current, { footer = '' } = {}) {
  const body = `<div class="opt-list">${options.map((o) => `
    <button type="button" class="opt ${o.value === current ? 'is-on' : ''}" data-v="${esc(o.value ?? '')}">
      ${o.color !== undefined ? `<i style="background:${o.color || 'var(--line-strong)'}"></i>` : ''}
      <span>${esc(o.label)}</span>${o.hint ? `<small>${esc(o.hint)}</small>` : ''}
      ${o.value === current ? icon('check', 'row__chev') : ''}
    </button>`).join('')}</div>${footer}`;
  let picked;
  const res = await sheet({
    title, body, actions: [{ label: 'Cerrar', value: 'cancel' }],
    onOpen: (form, close) => form.querySelectorAll('[data-v]').forEach((b) =>
      b.addEventListener('click', () => { picked = b.dataset.v; close('pick'); })),
  });
  return res.value === 'pick' ? picked : undefined;
}

// ---------- Fragmentos HTML ----------
export const toggle = (key, on, label) =>
  `<label class="switch"><input type="checkbox" data-setting="${key}" ${on ? 'checked' : ''} aria-label="${esc(label || key)}"><span></span></label>`;

export const viewHeader = (title, sub = '', end = '') =>
  `<header class="vh"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${end}</header>`;

export const emptyState = (ic, title, text, action = '') =>
  `<div class="empty">${icon(ic)}<b>${esc(title)}</b><p>${text}</p>${action}</div>`;

export const back = (href, label) => `<a class="back" href="${href}">${icon('chevL')} ${esc(label)}</a>`;

/** Barra de progreso fina */
export const bar = (value, max, color = 'var(--accent)') =>
  `<span class="bar"><i style="width:${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%;background:${color}"></i></span>`;
