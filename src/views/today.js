// Nutrición: resumen del día, comidas, agua y peso. Incluye el buscador rápido de alimentos.
import { $, $$, esc, icon, uid, num, round, parseNum, norm, dayKey, shiftDay, parseDay, fmtDateLong, dayLabel, haptic, debounce, sum } from '../utils.js';
import { state, update, day, ensureDay, totals, targetFor, makeEntry, addEntries, allFoods, foodById, latestWeight } from '../store.js';
import { sheet, confirmSheet, toast, pickSheet, emptyState, bar } from '../ui.js';
import { ring } from '../charts.js';
import { offByBarcode, offSearch } from '../off.js';

let cur = dayKey();
let lastSeenToday = dayKey();

const mealNames = () => state.settings.meals;
const visibleMeals = (entries) => mealNames().map((n, i) => ({ i, name: n || '' })).filter((m) => m.name || entries.some((e) => e.meal === m.i));
const macroLine = (e) => `P ${num(e.p)} · H ${num(e.c)} · G ${num(e.f)}`;

// =====================================================================
// Vista
// =====================================================================
export function render() {
  if (dayKey() !== lastSeenToday) { cur = dayKey(); lastSeenToday = cur; }
  const d = day(cur);
  const t = totals(d.entries);
  const tg = targetFor(cur);
  const left = tg.kcal - t.kcal;
  const isToday = cur === dayKey();
  const w = state.weights.find((x) => x.date === cur);
  const lw = latestWeight();
  const glasses = Math.max(1, Math.round(state.settings.waterGoal / state.settings.glass));
  const filled = Math.round(d.water / state.settings.glass);

  const macro = (k, label, color) => `<div>
      <div class="macro__k"><span>${label}</span></div>
      ${bar(t[k], tg[k], color)}
      <div class="macro__v">${num(t[k])}<small> / ${num(tg[k])} g</small></div></div>`;

  return `<section class="view view--narrow">
    ${!state.ui.onboarded ? `<a class="callout" href="#/ajustes/objetivos" style="margin-bottom:.875rem">${icon('target')}<div><b>Configura tus objetivos</b><br>Calcula tus calorías y macros según tu peso, actividad y meta (perder grasa, mantener o ganar músculo). ›</div></a>` : ''}
    <div class="daynav">
      <button class="icon-btn" data-act="day" data-d="-1" aria-label="Día anterior">${icon('chevL')}</button>
      <button class="daynav__t" data-act="pick-day"><b>${dayLabel(cur)}</b><small>${isToday ? fmtDateLong(parseDay(cur)) : (cur > dayKey() ? 'Planificando' : fmtDateLong(parseDay(cur)))}</small></button>
      <button class="icon-btn" data-act="day" data-d="1" aria-label="Día siguiente">${icon('chevR')}</button>
    </div>

    <div class="card">
      <div class="summary">
        <div class="ringbox">${ring(t.kcal, tg.kcal, { size: 152, stroke: 13 })}
          <div class="ringbox__c"><b>${num(Math.abs(left))}</b><small>${left >= 0 ? 'kcal restantes' : 'kcal de más'}</small></div>
        </div>
        <div class="kv">
          <div class="kv__row"><span>Objetivo</span><b>${num(tg.kcal)}</b></div>
          <div class="kv__row"><span>Consumido</span><b>${num(t.kcal)}</b></div>
          <div class="kv__row"><span>${left >= 0 ? 'Restante' : 'Exceso'}</span><b style="color:${left >= 0 ? 'var(--accent-text)' : 'var(--danger)'}">${num(Math.abs(left))}</b></div>
          ${tg.bonus ? `<span class="chip chip--sm chip--accent">${icon('flame', 'row__chev')} +${num(tg.bonus)} por entreno</span>` : ''}
        </div>
      </div>
      <div class="macros">
        ${macro('p', 'Proteína', 'var(--prot)')}
        ${macro('c', 'Hidratos', 'var(--carb)')}
        ${macro('f', 'Grasa', 'var(--fat)')}
      </div>
    </div>

    <div class="mt">${visibleMeals(d.entries).map((m) => mealCard(m, d.entries.filter((e) => e.meal === m.i || (m.i === mealNames().length - 1 && e.meal >= mealNames().length)))).join('')}</div>

    <div class="card mt">
      <div class="water">
        <span class="row__icon" style="background:var(--prot)">${icon('drop')}</span>
        <div style="flex:1;min-width:0">
          <div class="spread"><b>Agua</b><span class="small muted num">${num(d.water / 1000, 2)} / ${num(state.settings.waterGoal / 1000, 1)} L</span></div>
          <div class="water__glasses" style="margin-top:.5rem">${Array.from({ length: glasses }, (_, i) => `<span class="glass ${i < filled ? 'on' : ''}"></span>`).join('')}</div>
        </div>
        <button class="icon-btn icon-btn--fill" data-act="water" data-d="-1" aria-label="Quitar vaso">${icon('minus')}</button>
        <button class="icon-btn icon-btn--accent" data-act="water" data-d="1" aria-label="Añadir vaso">${icon('plus')}</button>
      </div>
    </div>

    <div class="rows mt">
      <button class="row row--link" data-act="weight">
        <span class="row__icon" style="background:#7A5CF0">${icon('scale')}</span>
        <span class="row__main"><span class="row__title">Peso ${isToday ? 'de hoy' : 'del día'}</span><span class="row__sub">${w ? `${num(w.kg, 1)} kg${w.bf ? ` · ${num(w.bf, 1)} % grasa` : ''}` : lw ? `Último: ${num(lw.kg, 1)} kg (${dayLabel(lw.date).toLowerCase()})` : 'Pésate por la mañana, en ayunas'}</span></span>
        <span class="row__end">${w ? icon('check', 'row__chev') : icon('plus', 'row__chev')}</span>
      </button>
    </div>
  </section>`;
}

function mealCard(m, entries) {
  const t = totals(entries);
  return `<div class="meal" data-meal="${m.i}">
    <div class="meal__head">
      <div class="meal__title"><b>${esc(m.name || 'Otros')}</b>${entries.length ? `<small>${num(t.kcal)} kcal · P ${num(t.p)} g</small>` : ''}</div>
      <button class="icon-btn" data-act="meal-menu" aria-label="Opciones de ${esc(m.name)}">${icon('dots')}</button>
      <button class="icon-btn icon-btn--accent" data-act="add" aria-label="Añadir a ${esc(m.name)}">${icon('plus')}</button>
    </div>
    ${entries.map((e) => `<button class="entry" data-act="entry" data-id="${e.id}">
      <span class="entry__main"><span class="entry__name">${esc(e.name)}</span><span class="entry__meta">${e.g ? `${num(e.g)} g · ` : ''}${macroLine(e)}</span></span>
      <span class="entry__kcal">${num(e.kcal)}<small> kcal</small></span></button>`).join('')}
  </div>`;
}

const refresh = (root) => { const y = scrollY; root.innerHTML = render(); scrollTo(0, y); };

// =====================================================================
// Buscador de alimentos
// =====================================================================
let pk = null; // { meal, q, off: [], offState }

function foodRow(f, extra = '') {
  const portion = f.unit && f.unitG ? ` · 1 ${f.unit} = ${num(f.unitG)} g` : '';
  return `<div class="food" data-food="${esc(f.id)}">
    <button class="food__main" data-pk="open" style="text-align:left">
      <div class="food__name">${esc(f.name)}</div>
      <div class="food__meta">${f.brand ? esc(f.brand) + ' · ' : ''}${num(f.kcal)} kcal/100 g · P ${num(f.p, 1)}${portion}${extra}</div>
    </button>
    <button class="food__add" data-pk="quick" aria-label="Añadir ${esc(f.name)} (cantidad habitual)">${icon('plus')}</button>
  </div>`;
}

function rankFoods(q) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  const res = [];
  for (const f of allFoods()) {
    const hay = norm(f.name + ' ' + (f.brand || ''));
    if (!words.every((w) => hay.includes(w))) continue;
    let score = (state.recent[f.id]?.n || 0) * 3;
    if (norm(f.name).startsWith(words[0])) score += 10;
    if (f.source !== 'db') score += 2;
    res.push([score, f]);
  }
  return res.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).slice(0, 60).map((x) => x[1]);
}

function pickerBody() {
  const q = pk.q.trim();
  if (q) {
    const local = rankFoods(q);
    let html = local.length ? local.map((f) => foodRow(f)).join('') : '<p class="small muted" style="padding:.75rem .25rem">Nada en tu lista. Prueba en Open Food Facts o crea el alimento.</p>';
    html += `<h3 class="section-title">Open Food Facts</h3>`;
    if (pk.offState === 'loading') html += '<p class="small muted center" style="padding:1rem">Buscando…</p>';
    else if (pk.offState === 'error') html += '<p class="small center" style="padding:1rem;color:var(--danger)">No se pudo conectar. Revisa la conexión e inténtalo de nuevo.</p>';
    else if (pk.offState === 'done' && !pk.off.length) html += '<p class="small muted center" style="padding:1rem">Sin resultados.</p>';
    if (pk.offState === 'done') html += pk.off.map((f) => foodRow(f)).join('');
    if (pk.offState !== 'loading') html += `<button class="btn btn--block mt" data-pk="off">${icon('search')} Buscar «${esc(q)}» en supermercados</button>`;
    html += `<button class="btn btn--ghost btn--block mt" data-pk="create">${icon('plus')} Crear «${esc(q)}»</button>`;
    return html;
  }
  const recents = Object.entries(state.recent).sort((a, b) => b[1].at - a[1].at).map(([id]) => foodById(id)).filter(Boolean).slice(0, 15);
  const mine = state.foods.filter((f) => f.source === 'custom');
  let html = `<div class="quick-actions">
      <button class="qa" data-pk="kcal">${icon('bolt')}Calorías rápidas</button>
      <button class="qa" data-pk="barcode">${icon('barcode')}Código de barras</button>
      <button class="qa" data-pk="create">${icon('plus')}Crear alimento</button></div>`;
  if (state.savedMeals.length) html += `<h3 class="section-title">Comidas guardadas</h3>` + state.savedMeals.map((m) => `
    <div class="food" data-saved="${m.id}"><button class="food__main" data-pk="saved" style="text-align:left"><div class="food__name">${esc(m.name)}</div>
    <div class="food__meta">${m.items.length} alimentos · ${num(sum(m.items, (i) => i.kcal))} kcal · P ${num(sum(m.items, (i) => i.p))}</div></button>
    <button class="food__add" data-pk="saved" aria-label="Añadir ${esc(m.name)}">${icon('plus')}</button></div>`).join('');
  if (recents.length) html += `<h3 class="section-title">Recientes</h3>` + recents.map((f) => foodRow(f, ` · ${num(state.recent[f.id].g)} g`)).join('');
  if (mine.length) html += `<h3 class="section-title">Mis alimentos</h3>` + mine.map((f) => foodRow(f)).join('');
  html += `<h3 class="section-title">Alimentos comunes</h3>` + allFoods().filter((f) => f.source === 'db').sort((a, b) => a.name.localeCompare(b.name)).map((f) => foodRow(f)).join('');
  return html;
}

function paintPicker() { const b = $('#pkBody'); if (b) b.innerHTML = `<div class="picker__inner">${pickerBody()}</div>`; }

export function openPicker(meal, root) {
  closePicker();
  pk = { meal, q: '', off: [], offState: '', root };
  const el = document.createElement('div');
  el.className = 'picker';
  el.id = 'picker';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Añadir alimento');
  el.innerHTML = `<div class="picker__top"><div class="picker__inner" style="display:grid;gap:.625rem;width:100%">
      <div class="picker__bar"><button class="icon-btn" data-pk="close" aria-label="Cerrar">${icon('close')}</button>
        <b>${esc(mealNames()[meal] || 'Añadir')}</b>
        <button class="btn btn--sm" data-pk="meal">Cambiar</button></div>
      <label class="search">${icon('search')}<input class="input" id="pkQ" type="search" placeholder="Buscar alimento o marca" autocomplete="off" enterkeyhint="search" aria-label="Buscar alimento"></label>
    </div></div>
    <div class="picker__body" id="pkBody"></div>`;
  document.body.appendChild(el);
  document.body.style.overflow = 'hidden';
  paintPicker();
  const input = $('#pkQ');
  input.addEventListener('input', debounce(() => { pk.q = input.value; pk.off = []; pk.offState = ''; paintPicker(); $('#pkBody').scrollTop = 0; }, 120));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); input.blur(); searchOFF(); } });
  if (matchMedia('(hover: hover)').matches) input.focus();
  el.addEventListener('click', onPickerClick);
}

function closePicker() {
  $('#picker')?.remove();
  document.body.style.overflow = '';
  if (pk?.root) refresh(pk.root);
  pk = null;
}
export const pickerOpen = () => !!pk;
export const closePickerIfOpen = () => { if (pk) { closePicker(); return true; } return false; };

async function searchOFF() {
  if (!pk || !pk.q.trim()) return;
  pk.offState = 'loading'; paintPicker();
  try { pk.off = await offSearch(pk.q.trim()); pk.offState = 'done'; }
  catch (e) { console.warn(e); pk.offState = 'error'; }
  if (pk) paintPicker();
}

const findFood = (id) => foodById(id) || pk?.off.find((f) => f.id === id) || null;

/** Guarda en "mis alimentos" los productos de Open Food Facts al usarlos (para tenerlos sin conexión). */
function persistFood(f) {
  if (f.source === 'off' && !state.foods.some((x) => x.id === f.id)) update((s) => s.foods.push({ ...f }), { silent: true });
}

function defaultGrams(f) { return state.recent[f.id]?.g || f.unitG || 100; }

function addFood(f, g, meal) {
  persistFood(f);
  const e = makeEntry(f, g, meal);
  addEntries(cur, [e]);
  haptic(12);
  return e;
}

async function onPickerClick(ev) {
  const b = ev.target.closest('[data-pk]');
  if (!b || !pk) return;
  const act = b.dataset.pk;
  const id = b.closest('[data-food]')?.dataset.food;
  if (act === 'close') return closePicker();
  if (act === 'meal') {
    const v = await pickSheet('Añadir a', mealNames().map((n, i) => ({ value: String(i), label: n })).filter((o) => o.label), String(pk.meal));
    if (v !== undefined) { pk.meal = +v; $('#picker .picker__bar b').textContent = mealNames()[pk.meal]; }
    return;
  }
  if (act === 'off') return searchOFF();
  if (act === 'quick') {
    const f = findFood(id); if (!f) return;
    const e = addFood(f, defaultGrams(f), pk.meal);
    toast(`${f.name} · ${num(e.g)} g · ${num(e.kcal)} kcal`, { action: 'Deshacer', onAction: () => removeEntry(e.id) });
    b.innerHTML = icon('check');
    setTimeout(() => { if (b.isConnected) b.innerHTML = icon('plus'); }, 900);
    return;
  }
  if (act === 'open') {
    const f = findFood(id); if (!f) return;
    const r = await amountSheet(f, { g: defaultGrams(f), meal: pk.meal });
    if (r?.action === 'save') { addFood(f, r.g, r.meal); toast(`Añadido a ${mealNames()[r.meal]}`); if (pk) paintPicker(); }
    return;
  }
  if (act === 'saved') {
    const m = state.savedMeals.find((x) => x.id === b.closest('[data-saved]').dataset.saved);
    const entries = m.items.map((it) => ({ ...it, id: uid(), meal: pk.meal }));
    addEntries(cur, entries);
    haptic(12);
    toast(`${m.name} añadida (${num(sum(entries, (e) => e.kcal))} kcal)`, { action: 'Deshacer', onAction: () => entries.forEach((e) => removeEntry(e.id)) });
    return;
  }
  if (act === 'kcal') { const ok = await quickCaloriesSheet(pk.meal); if (ok) closePicker(); return; }
  if (act === 'create') {
    const f = await foodEditor({ name: pk.q.trim() });
    if (f) { pk.q = ''; $('#pkQ').value = ''; const r = await amountSheet(f, { g: f.unitG || 100, meal: pk.meal }); if (r?.action === 'save') { addFood(f, r.g, r.meal); toast('Añadido'); } paintPicker(); }
    return;
  }
  if (act === 'barcode') return barcodeFlow();
}

function removeEntry(id) {
  update((s) => { for (const d of Object.values(s.log)) d.entries = d.entries.filter((e) => e.id !== id); });
  if (pk) paintPicker(); else { const root = $('#main'); if (location.hash.startsWith('#/hoy')) refresh(root); }
}

// =====================================================================
// Hojas: cantidad, calorías rápidas, crear alimento, código de barras
// =====================================================================
function amountSheet(f, { g, meal, editing = false }) {
  const chips = [['100 g', 100]];
  if (f.unit && f.unitG) chips.unshift([`½ ${f.unit}`, f.unitG / 2], [`1 ${f.unit}`, f.unitG], [`2 ${f.unit}`, f.unitG * 2]);
  if (state.recent[f.id]?.g && !chips.some((c) => Math.abs(c[1] - state.recent[f.id].g) < 0.5)) chips.push(['Última', state.recent[f.id].g]);
  const body = `<div class="amount">
    <div class="center"><div style="font-weight:650">${esc(f.name)}</div><div class="small muted">${f.brand ? esc(f.brand) + ' · ' : ''}${num(f.kcal)} kcal por 100 g</div></div>
    <div class="amount__big"><input id="amtG" name="g" inputmode="decimal" autocomplete="off" value="${num(g, 1)}" aria-label="Gramos" required><span>g</span></div>
    <div class="chips" style="justify-content:center">${chips.map(([l, v]) => `<button type="button" class="chip" data-g="${v}">${esc(l)}</button>`).join('')}</div>
    <div class="amount__macros" id="amtM"></div>
    <label class="field"><span>Comida</span><select class="select" name="meal">${mealNames().map((n, i) => (n || i === meal) ? `<option value="${i}" ${i === meal ? 'selected' : ''}>${esc(n || 'Otros')}</option>` : '').join('')}</select></label>
  </div>`;
  const paint = () => {
    const v = parseNum($('#amtG')?.value) || 0, k = v / 100;
    const m = $('#amtM');
    if (m) m.innerHTML = [['kcal', f.kcal], ['Prot.', f.p], ['Hidr.', f.c], ['Grasa', f.f]].map(([l, x]) => `<div><b>${num(x * k)}</b><small>${l}</small></div>`).join('');
  };
  return sheet({
    body,
    actions: editing
      ? [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'accent' }]
      : [{ label: 'Cancelar', value: 'cancel' }, { label: 'Añadir', value: 'ok', kind: 'accent' }],
    onOpen: (form) => {
      const inp = $('#amtG');
      inp.addEventListener('input', paint);
      inp.addEventListener('focus', () => inp.select());
      form.querySelectorAll('[data-g]').forEach((c) => c.addEventListener('click', () => { inp.value = num(+c.dataset.g, 1); paint(); }));
      paint();
      setTimeout(() => { inp.focus(); inp.select(); }, 60);
    },
  }).then(({ value, data }) => {
    if (value === 'delete') return { action: 'delete' };
    if (value !== 'ok') return null;
    const v = parseNum(data.g);
    if (!(v > 0)) { toast('Escribe una cantidad válida'); return null; }
    return { action: 'save', g: v, meal: +data.meal };
  });
}

async function quickCaloriesSheet(meal, existing = null) {
  const e = existing || { name: '', kcal: '', p: '', c: '', f: '' };
  const v = (x) => (x === '' || x == null ? '' : num(x, 1));
  const { value, data } = await sheet({
    title: existing ? 'Editar' : 'Calorías rápidas',
    text: existing ? '' : 'Para cuando comes fuera o solo sabes las calorías. Los macros son opcionales.',
    body: `<div class="form-stack">
      <label class="field"><span>Descripción</span><input class="input" name="name" maxlength="80" value="${esc(e.name)}" placeholder="Ej. Menú del día"></label>
      <label class="field"><span>Calorías (kcal)</span><input class="input" name="kcal" inputmode="decimal" required value="${v(e.kcal)}" autofocus></label>
      <div class="form-row-3">
        <label class="field"><span>Proteína</span><input class="input" name="p" inputmode="decimal" value="${v(e.p)}" placeholder="g"></label>
        <label class="field"><span>Hidratos</span><input class="input" name="c" inputmode="decimal" value="${v(e.c)}" placeholder="g"></label>
        <label class="field"><span>Grasa</span><input class="input" name="f" inputmode="decimal" value="${v(e.f)}" placeholder="g"></label>
      </div>
      ${existing ? '' : `<label class="field"><span>Comida</span><select class="select" name="meal">${mealNames().map((n, i) => n ? `<option value="${i}" ${i === meal ? 'selected' : ''}>${esc(n)}</option>` : '').join('')}</select></label>`}
    </div>`,
    actions: existing
      ? [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'accent' }]
      : [{ label: 'Cancelar', value: 'cancel' }, { label: 'Añadir', value: 'ok', kind: 'accent' }],
  });
  if (value === 'delete') { removeEntry(existing.id); return true; }
  if (value !== 'ok') return false;
  const kcal = parseNum(data.kcal);
  if (!(kcal >= 0)) { toast('Escribe las calorías'); return false; }
  const vals = { name: data.name.trim() || 'Calorías rápidas', kcal, p: parseNum(data.p) || 0, c: parseNum(data.c) || 0, f: parseNum(data.f) || 0 };
  if (existing) update((s) => Object.assign(ensureDay(s, cur).entries.find((x) => x.id === existing.id), vals));
  else addEntries(cur, [{ id: uid(), meal: +data.meal, foodId: null, g: 0, ...vals }]);
  return true;
}

export async function foodEditor(base = {}) {
  const f = { name: '', brand: '', kcal: '', p: '', c: '', f: '', unit: '', unitG: '', ...base };
  const v = (x) => (x === '' || x == null ? '' : num(x, 1));
  const { value, data } = await sheet({
    title: base.id ? 'Editar alimento' : 'Nuevo alimento',
    text: base.id ? '' : 'Copia los valores por 100 g de la etiqueta.',
    body: `<div class="form-stack">
      <label class="field"><span>Nombre</span><input class="input" name="name" required maxlength="80" value="${esc(f.name)}" ${f.name ? '' : 'autofocus'}></label>
      <label class="field"><span>Marca (opcional)</span><input class="input" name="brand" maxlength="60" value="${esc(f.brand)}"></label>
      <div class="form-row">
        <label class="field"><span>kcal / 100 g</span><input class="input" name="kcal" inputmode="decimal" required value="${v(f.kcal)}" ${f.name ? 'autofocus' : ''}></label>
        <label class="field"><span>Proteína</span><input class="input" name="p" inputmode="decimal" value="${v(f.p)}" placeholder="g"></label>
        <label class="field"><span>Hidratos</span><input class="input" name="c" inputmode="decimal" value="${v(f.c)}" placeholder="g"></label>
        <label class="field"><span>Grasa</span><input class="input" name="f" inputmode="decimal" value="${v(f.f)}" placeholder="g"></label>
      </div>
      <div class="form-row">
        <label class="field"><span>Porción (opcional)</span><input class="input" name="unit" maxlength="20" value="${esc(f.unit)}" placeholder="Ej. barrita"></label>
        <label class="field"><span>Gramos por porción</span><input class="input" name="unitG" inputmode="decimal" value="${v(f.unitG)}"></label>
      </div></div>`,
  });
  if (value !== 'ok') return null;
  const kcal = parseNum(data.kcal);
  if (!data.name.trim() || !(kcal >= 0)) { toast('Faltan el nombre o las calorías'); return null; }
  const food = {
    id: base.id || 'c:' + uid(), code: base.code || '', source: base.source === 'off' ? 'off' : 'custom',
    name: data.name.trim(), brand: data.brand.trim(), kcal,
    p: parseNum(data.p) || 0, c: parseNum(data.c) || 0, f: parseNum(data.f) || 0,
    unit: data.unit.trim(), unitG: parseNum(data.unitG) || 0,
  };
  update((s) => { const i = s.foods.findIndex((x) => x.id === food.id); if (i >= 0) s.foods[i] = food; else s.foods.push(food); }, { silent: true });
  return food;
}

async function barcodeFlow() {
  const canScan = 'BarcodeDetector' in window && navigator.mediaDevices?.getUserMedia;
  let stream = null, stop = false;
  const res = await sheet({
    title: 'Código de barras',
    text: canScan ? 'Escanéalo con la cámara o escribe el número.' : 'Escribe el número que aparece bajo las barras. En iPhone puedes mantener pulsado el campo y elegir <b>Escanear texto</b> para leerlo con la cámara.',
    body: `${canScan ? '<video id="bcVideo" playsinline muted style="width:100%;border-radius:1rem;background:#000;aspect-ratio:4/3;object-fit:cover"></video>' : ''}
      <label class="field"><span>Código</span><input class="input" name="code" inputmode="numeric" pattern="[0-9]{6,14}" placeholder="8410000000000" autocomplete="off" ${canScan ? '' : 'autofocus'} required></label>`,
    actions: [{ label: 'Cancelar', value: 'cancel' }, { label: 'Buscar', value: 'ok', kind: 'accent' }],
    onOpen: async (form, close) => {
      if (!canScan) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const v = $('#bcVideo'); v.srcObject = stream; await v.play();
        const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
        const loop = async () => {
          if (stop) return;
          try { const codes = await det.detect(v); if (codes[0]) { form.code.value = codes[0].rawValue; haptic(30); close('ok'); return; } } catch {}
          setTimeout(loop, 250);
        };
        loop();
      } catch { toast('No se pudo abrir la cámara'); }
    },
  });
  stop = true;
  stream?.getTracks().forEach((t) => t.stop());
  if (res.value !== 'ok') return;
  const code = (res.data.code || '').replace(/\D/g, '');
  if (code.length < 6) return toast('Código no válido');
  const known = state.foods.find((f) => f.code === code);
  let food = known;
  if (!food) {
    toast('Buscando producto…', { timeout: 1500 });
    try { food = await offByBarcode(code); } catch { return toast('Sin conexión con Open Food Facts'); }
  }
  if (!food) {
    toast('Producto no encontrado: créalo con su etiqueta');
    food = await foodEditor({ code });
    if (!food) return;
  }
  const r = await amountSheet(food, { g: defaultGrams(food), meal: pk?.meal ?? 0 });
  if (r?.action === 'save') { addFood(food, r.g, r.meal); toast(`Añadido: ${food.name}`); if (pk) paintPicker(); }
}

// =====================================================================
// Acciones de la vista
// =====================================================================
export const actions = {
  day(el, e, root) { cur = shiftDay(cur, +el.dataset.d); refresh(root); },
  async 'pick-day'(el, e, root) {
    const { value, data } = await sheet({ title: 'Ir a un día', body: `<input class="input" type="date" name="d" value="${cur}" required>`, actions: [{ label: 'Hoy', value: 'today', novalidate: true }, { label: 'Ir', value: 'ok', kind: 'accent' }] });
    if (value === 'today') cur = dayKey(); else if (value === 'ok' && data.d) cur = data.d;
    refresh(root);
  },
  add(el, e, root) { openPicker(+el.closest('[data-meal]').dataset.meal, root); },
  async entry(el, e, root) {
    const id = el.dataset.id;
    const en = day(cur).entries.find((x) => x.id === id);
    if (!en) return;
    if (!en.foodId || !en.g) { await quickCaloriesSheet(en.meal, en); return refresh(root); }
    const f = foodById(en.foodId) || { id: en.foodId, name: en.name, brand: en.brand, kcal: (en.kcal / en.g) * 100, p: (en.p / en.g) * 100, c: (en.c / en.g) * 100, f: (en.f / en.g) * 100 };
    const r = await amountSheet(f, { g: en.g, meal: en.meal, editing: true });
    if (r?.action === 'delete') { removeEntry(id); toast('Eliminado', { action: 'Deshacer', onAction: () => { addEntries(cur, [en]); refresh(root); } }); }
    else if (r?.action === 'save') {
      const k = r.g / en.g;
      update((s) => Object.assign(ensureDay(s, cur).entries.find((x) => x.id === id), { g: r.g, meal: r.meal, kcal: en.kcal * k, p: en.p * k, c: en.c * k, f: en.f * k }));
    }
    refresh(root);
  },
  async 'meal-menu'(el, e, root) {
    const meal = +el.closest('[data-meal]').dataset.meal;
    const entries = day(cur).entries.filter((x) => x.meal === meal);
    const prev = day(shiftDay(cur, -1)).entries.filter((x) => x.meal === meal);
    const opts = [];
    if (prev.length) opts.push({ value: 'copy', label: `Copiar de ayer (${num(sum(prev, (x) => x.kcal))} kcal)` });
    if (entries.length) opts.push({ value: 'save', label: 'Guardar como comida habitual' }, { value: 'clear', label: 'Vaciar esta comida' });
    if (!opts.length) return toast('Añade alimentos primero');
    const v = await pickSheet(mealNames()[meal] || 'Comida', opts);
    if (v === 'copy') { addEntries(cur, prev.map((x) => ({ ...x, id: uid() }))); toast('Copiado de ayer'); }
    if (v === 'save') {
      const { value, data } = await sheet({ title: 'Guardar comida', text: 'Podrás añadirla entera con un toque desde el buscador.', body: `<input class="input" name="name" required maxlength="60" placeholder="Ej. Desayuno de entreno" value="${esc(mealNames()[meal] || '')}" autofocus>` });
      if (value === 'ok' && data.name.trim()) {
        update((s) => s.savedMeals.unshift({ id: uid(), name: data.name.trim(), items: entries.map(({ id, meal: _m, ...rest }) => rest) }));
        toast('Comida guardada');
      }
    }
    if (v === 'clear' && await confirmSheet('¿Vaciar comida?', `Se quitarán ${entries.length} alimentos.`, { ok: 'Vaciar' })) {
      update((s) => { const d = ensureDay(s, cur); d.entries = d.entries.filter((x) => x.meal !== meal); });
    }
    refresh(root);
  },
  water(el, e, root) {
    const g = state.settings.glass;
    update((s) => { const d = ensureDay(s, cur); d.water = Math.max(0, d.water + g * +el.dataset.d); });
    haptic(8);
    refresh(root);
  },
  async weight(el, e, root) {
    await weightSheet(cur);
    refresh(root);
  },
};

export async function weightSheet(key) {
  const w = state.weights.find((x) => x.date === key);
  const lw = latestWeight();
  const { value, data } = await sheet({
    title: `Peso · ${dayLabel(key).toLowerCase()}`,
    body: `<div class="amount"><div class="amount__big"><input name="kg" inputmode="decimal" value="${w ? num(w.kg, 1) : lw ? num(lw.kg, 1) : ''}" required aria-label="Kilos" autofocus><span>kg</span></div>
      <label class="field"><span>% de grasa corporal (opcional)</span><input class="input" name="bf" inputmode="decimal" value="${w?.bf ? num(w.bf, 1) : ''}"></label></div>`,
    actions: w ? [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'accent' }] : undefined,
    onOpen: (form) => setTimeout(() => form.kg.select(), 60),
  });
  if (value === 'delete') update((s) => { s.weights = s.weights.filter((x) => x.date !== key); });
  if (value !== 'ok') return;
  const kg = parseNum(data.kg);
  if (!(kg > 20 && kg < 400)) return toast('Peso no válido');
  update((s) => {
    s.weights = s.weights.filter((x) => x.date !== key);
    s.weights.push({ date: key, kg: round(kg, 2), ...(parseNum(data.bf) > 0 ? { bf: round(parseNum(data.bf), 1) } : {}) });
    if (key === dayKey()) s.profile.weight = round(kg, 1);
  });
  toast('Peso guardado');
}

export function unmount() { if (pk) { $('#picker')?.remove(); document.body.style.overflow = ''; pk = null; } }
