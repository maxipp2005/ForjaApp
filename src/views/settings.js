// Ajustes: objetivos (calculadora), comidas, agua, gimnasio, alimentos propios, apariencia, datos e instalación.
import { $, esc, icon, num, round, parseNum, download, dayKey, isIOS, isStandalone } from '../utils.js';
import { state, update, exportData, importData, resetAll, latestWeight } from '../store.js';
import { sheet, confirmSheet, toast, toggle, viewHeader, back, emptyState } from '../ui.js';
import { ACTIVITY, GOALS, computeTargets, kcalFromMacros } from '../nutrition.js';
import { foodEditor } from './today.js';
import { go } from '../router.js';

export const APP_VERSION = '1.0.0';

const row = (title, sub, end) => `<div class="row"><div class="row__main"><div class="row__title">${title}</div>${sub ? `<div class="row__sub">${sub}</div>` : ''}</div><div class="row__end">${end}</div></div>`;
const link = (href, ic, color, title, sub = '', end = '') => `<a class="row row--link" href="${href}"><span class="row__icon" style="background:${color}">${icon(ic)}</span><span class="row__main"><span class="row__title">${title}</span>${sub ? `<span class="row__sub">${sub}</span>` : ''}</span><span class="row__end">${end}${icon('chevR', 'row__chev')}</span></a>`;

// =====================================================================
// Inicio de ajustes
// =====================================================================
function home() {
  const s = state.settings, t = state.targets;
  return `<section class="view view--narrow">
    ${viewHeader('Ajustes')}
    <div class="rows">
      ${link('#/ajustes/objetivos', 'target', '#1FA968', 'Objetivos y calorías', `${num(t.kcal)} kcal · P ${num(t.p)} · H ${num(t.c)} · G ${num(t.f)}`)}
      ${link('#/ajustes/alimentos', 'food', '#F0A020', 'Mis alimentos y comidas', `${state.foods.length} alimentos · ${state.savedMeals.length} comidas guardadas`)}
    </div>

    <h2 class="section-title">Comidas del día</h2>
    <div class="rows">${s.meals.map((m, i) => `<div class="row"><span class="row__main"><input class="input" data-meal-name="${i}" value="${esc(m)}" placeholder="Oculta" maxlength="20" aria-label="Comida ${i + 1}"></span></div>`).join('')}</div>
    <p class="small muted mt" style="padding:0 .25rem">Deja un nombre vacío para ocultar esa comida.</p>

    <h2 class="section-title">Agua</h2>
    <div class="rows">
      ${row('Objetivo diario', '', `<input class="input num" style="width:6rem;text-align:right" inputmode="numeric" data-num="waterGoal" value="${s.waterGoal}"> ml`)}
      ${row('Tamaño del vaso', '', `<input class="input num" style="width:6rem;text-align:right" inputmode="numeric" data-num="glass" value="${s.glass}"> ml`)}
    </div>

    <h2 class="section-title">Gimnasio</h2>
    <div class="rows">
      ${row('Descanso entre series', 'Se inicia al marcar una serie', `<select class="select" style="width:auto" data-num-sel="restSec">${[[0, 'Desactivado'], [60, '1:00'], [90, '1:30'], [120, '2:00'], [150, '2:30'], [180, '3:00'], [240, '4:00']].map(([v, l]) => `<option value="${v}" ${v === s.restSec ? 'selected' : ''}>${l}</option>`).join('')}</select>`)}
      ${row('Sonido al terminar el descanso', '', toggle('sound', s.sound, 'Sonido'))}
    </div>

    <h2 class="section-title">Apariencia</h2>
    <div class="rows">${row('Tema', '', `<div class="seg">${[['auto', 'Auto'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<button type="button" data-act="theme" data-v="${v}" class="${s.theme === v ? 'is-on' : ''}">${l}</button>`).join('')}</div>`)}</div>

    <h2 class="section-title">Datos</h2>
    <div class="rows">
      <button class="row row--link" data-act="export"><span class="row__icon" style="background:var(--ok)">${icon('download')}</span><span class="row__main"><span class="row__title">Exportar copia de seguridad</span><span class="row__sub">Archivo .json con todos tus datos</span></span></button>
      <button class="row row--link" data-act="import"><span class="row__icon" style="background:var(--prot)">${icon('upload')}</span><span class="row__main"><span class="row__title">Importar copia</span><span class="row__sub">Para pasar tus datos a otro dispositivo</span></span></button>
      <button class="row row--link" data-act="wipe"><span class="row__icon" style="background:var(--danger)">${icon('trash')}</span><span class="row__main"><span class="row__title" style="color:var(--danger)">Borrar todos los datos</span></span></button>
    </div>
    <p class="small muted mt center">Tus datos se guardan solo en este dispositivo.</p>
    <input type="file" accept="application/json,.json" id="importFile" hidden>

    <div class="rows mt-lg">
      ${link('#/ajustes/instalar', 'phone', '#4C7DF0', 'Instalar en el iPhone', isStandalone() ? 'Ya instalada ✓' : '')}
      ${link('#/ajustes/acerca', 'info', '#141416', 'Acerca de Forja', '', `v${APP_VERSION}`)}
    </div>
  </section>`;
}

// =====================================================================
// Objetivos
// =====================================================================
let draft = null;

function goals() {
  const p = (draft ||= { ...state.profile, weight: latestWeight()?.kg || state.profile.weight });
  const r = computeTargets(p);
  const t = state.targets;
  const seg = (key, opts) => `<div class="seg seg--block">${opts.map(([v, l]) => `<button type="button" data-act="draft" data-k="${key}" data-v="${v}" class="${String(p[key]) === String(v) ? 'is-on' : ''}">${l}</button>`).join('')}</div>`;
  const numIn = (key, label, unit, step = 'numeric') => `<label class="field"><span>${label}</span><input class="input num" inputmode="${step}" data-draft="${key}" value="${num(p[key], 1)}" aria-label="${label}"></label>`;
  const macroKcal = kcalFromMacros(t.p, t.c, t.f);
  return `<section class="view view--narrow">
    ${back('#/ajustes', 'Ajustes')}
    ${viewHeader('Objetivos', 'Calcula tus calorías y macros según tu cuerpo y tu meta')}

    <div class="card form-stack">
      ${seg('sex', [['m', 'Hombre'], ['f', 'Mujer']])}
      <div class="form-row-3">${numIn('age', 'Edad', '')}${numIn('height', 'Altura (cm)', '')}${numIn('weight', 'Peso (kg)', '', 'decimal')}</div>
      <label class="field"><span>Actividad (incluye gimnasio y MMA)</span><select class="select" data-draft-sel="activity">${ACTIVITY.map(([v, l, d]) => `<option value="${v}" ${v === p.activity ? 'selected' : ''}>${l} · ${d}</option>`).join('')}</select></label>
      <div class="field"><span>Objetivo</span>${seg('goal', Object.entries(GOALS).map(([k, g]) => [k, g.label]))}</div>
      ${p.goal !== 'maintain' ? `<div class="field"><span>Ritmo (${p.goal === 'cut' ? 'pérdida' : 'ganancia'} por semana)</span>${seg('rate', p.goal === 'cut' ? [[0.25, '0,25 kg'], [0.5, '0,5 kg'], [0.75, '0,75 kg'], [1, '1 kg']] : [[0.125, '0,12 kg'], [0.25, '0,25 kg'], [0.4, '0,4 kg']])}</div>` : ''}
      <div class="form-row">
        <label class="field"><span>Proteína (g por kg)</span><select class="select" data-draft-sel="proteinPerKg">${[1.6, 1.8, 2, 2.2, 2.4].map((v) => `<option value="${v}" ${v === p.proteinPerKg ? 'selected' : ''}>${num(v, 1)} g/kg</option>`).join('')}</select></label>
        <label class="field"><span>Grasa (% de kcal)</span><select class="select" data-draft-sel="fatPct">${[20, 25, 30, 35].map((v) => `<option value="${v}" ${v === p.fatPct ? 'selected' : ''}>${v} %</option>`).join('')}</select></label>
      </div>
    </div>

    <div class="card mt" style="border:1.5px solid var(--accent-text)">
      <div class="spread"><div><div class="small muted">Recomendado</div><div class="stat__v" style="font-size:2rem">${num(r.kcal)}<small>kcal/día</small></div></div>
        <button class="btn btn--accent" data-act="apply">Aplicar</button></div>
      <div class="grid grid-3 mt">
        <div><div class="small" style="color:var(--prot);font-weight:700">Proteína</div><b class="num">${num(r.p)} g</b></div>
        <div><div class="small" style="color:var(--carb);font-weight:700">Hidratos</div><b class="num">${num(r.c)} g</b></div>
        <div><div class="small" style="color:var(--fat);font-weight:700">Grasa</div><b class="num">${num(r.f)} g</b></div>
      </div>
      <p class="small muted mt">Metabolismo basal ${num(r.bmr)} kcal (Mifflin-St Jeor) · Gasto estimado ${num(r.tdee)} kcal. Es una estimación: si en 2–3 semanas tu peso no va como esperas, ajusta ±100–200 kcal.</p>
    </div>

    <h2 class="section-title">Objetivo actual (editable)</h2>
    <div class="card form-stack">
      <div class="form-row">
        <label class="field"><span>Calorías</span><input class="input num" inputmode="numeric" data-target="kcal" value="${t.kcal}"></label>
        <label class="field"><span>Proteína (g)</span><input class="input num" inputmode="numeric" data-target="p" value="${t.p}"></label>
        <label class="field"><span>Hidratos (g)</span><input class="input num" inputmode="numeric" data-target="c" value="${t.c}"></label>
        <label class="field"><span>Grasa (g)</span><input class="input num" inputmode="numeric" data-target="f" value="${t.f}"></label>
      </div>
      <p class="small muted" id="macroCheck">Los macros suman ${num(macroKcal)} kcal${Math.abs(macroKcal - t.kcal) > 60 ? ` <span style="color:var(--warn)">(${macroKcal > t.kcal ? '+' : ''}${num(macroKcal - t.kcal)} respecto al objetivo)</span>` : ' ✓'}</p>
    </div>

    <h2 class="section-title">Extras</h2>
    <div class="rows">
      ${row('Peso objetivo', 'Se marca en la gráfica de peso', `<input class="input num" style="width:5.5rem;text-align:right" inputmode="decimal" data-profile="weightGoal" value="${state.profile.weightGoal ? num(state.profile.weightGoal, 1) : ''}" placeholder="—"> kg`)}
      ${row('Extra en días de entreno', 'Se suma si ese día registras gimnasio o MMA', `<select class="select" style="width:auto" data-num-sel="trainingBonus">${[0, 100, 200, 300, 400, 500].map((v) => `<option value="${v}" ${v === state.settings.trainingBonus ? 'selected' : ''}>${v ? '+' + v + ' kcal' : 'No'}</option>`).join('')}</select>`)}
    </div>
  </section>`;
}

// =====================================================================
// Mis alimentos y comidas guardadas
// =====================================================================
function foods() {
  const list = state.foods.slice().sort((a, b) => a.name.localeCompare(b.name));
  return `<section class="view view--narrow">
    ${back('#/ajustes', 'Ajustes')}
    ${viewHeader('Mis alimentos', '', `<button class="btn btn--sm btn--accent" data-act="food-new">${icon('plus')} Nuevo</button>`)}
    ${list.length ? `<div class="list">${list.map((f) => `<button class="item" data-act="food-edit" data-id="${esc(f.id)}"><span class="item__main"><span class="item__title">${esc(f.name)}</span>
      <span class="item__meta">${f.brand ? `<span>${esc(f.brand)}</span>` : ''}<span>${num(f.kcal)} kcal · P ${num(f.p, 1)} · H ${num(f.c, 1)} · G ${num(f.f, 1)} /100 g</span>${f.source === 'off' ? '<span class="chip chip--sm">Open Food Facts</span>' : ''}</span></span></button>`).join('')}</div>`
    : emptyState('food', 'Aún no tienes alimentos propios', 'Crea los que más tomas (tu pan, tu proteína, tu yogur…) o añádelos desde el código de barras.')}
    <h2 class="section-title">Comidas guardadas</h2>
    ${state.savedMeals.length ? `<div class="list">${state.savedMeals.map((m) => `<div class="item" data-id="${m.id}"><span class="item__main"><span class="item__title">${esc(m.name)}</span>
      <span class="item__meta">${esc(m.items.map((i) => i.name).join(', '))}</span></span>
      <button class="icon-btn" data-act="meal-del" aria-label="Eliminar">${icon('trash')}</button></div>`).join('')}</div>`
    : '<p class="small muted" style="padding:0 .25rem">En Hoy, toca ··· en una comida y elige «Guardar como comida habitual».</p>'}
  </section>`;
}

function install() {
  const step = (n, t) => `<div class="row"><span class="row__icon" style="background:var(--surface-2);color:var(--text);font-weight:700">${n}</span><div class="row__main">${t}</div></div>`;
  return `<section class="view view--narrow">
    ${back('#/ajustes', 'Ajustes')}
    ${viewHeader('Instalar Forja', isStandalone() ? 'Ya estás usando la app instalada ✓' : 'Úsala como una app nativa, también sin conexión')}
    <h2 class="section-title">iPhone y iPad (Safari)</h2>
    <div class="rows">
      ${step(1, 'Abre la web de Forja en <b>Safari</b>.')}
      ${step(2, 'Pulsa <b>Compartir</b> (cuadrado con flecha). Si no lo ves, toca antes <b>···</b>.')}
      ${step(3, 'Elige <b>Añadir a pantalla de inicio</b>, deja activado <b>Abrir como app web</b> y pulsa <b>Añadir</b>.')}
      ${step(4, 'Abre Forja siempre desde el icono.')}
    </div>
    <h2 class="section-title">PC o Mac</h2>
    <div class="rows">${step(1, 'En Chrome o Edge, pulsa el icono de instalar de la barra de direcciones.')}${step(2, 'En Safari para Mac: <b>Archivo → Añadir al Dock</b>.')}</div>
    <div class="callout mt-lg">${icon('info')}<div>Cada dispositivo guarda sus propios datos. Para pasarlos de uno a otro usa <b>Exportar</b> e <b>Importar</b> en Ajustes.</div></div>
  </section>`;
}

function about() {
  return `<section class="view view--narrow">
    ${back('#/ajustes', 'Ajustes')}
    <div class="center" style="padding:1.25rem 0 .5rem">
      <img src="icons/icon.svg" width="88" height="88" alt="" style="margin:0 auto 1rem;border-radius:1.25rem;box-shadow:var(--shadow)">
      <h1 style="font-size:1.75rem;letter-spacing:-.02em">Forja</h1><p class="muted">Versión ${APP_VERSION}</p>
    </div>
    <div class="card text-block">Nutrición, gimnasio y MMA en una sola app. Sin cuentas ni anuncios. Funciona sin conexión y tus datos no salen de tu dispositivo, salvo las búsquedas que hagas en Open Food Facts.</div>
    <h2 class="section-title">Sobre los datos nutricionales</h2>
    <div class="card text-block">Los alimentos comunes usan valores medios aproximados de tablas de composición (BEDCA/USDA), con los hidratos sin fibra como en las etiquetas europeas. Los productos envasados vienen de Open Food Facts, una base de datos colaborativa: revisa que coincidan con la etiqueta. Las recomendaciones de calorías son estimaciones y no sustituyen el consejo de un dietista-nutricionista o un médico.</div>
  </section>`;
}

const PAGES = { '': home, objetivos: goals, alimentos: foods, instalar: install, acerca: about };
export function render(sub = '') { if (sub !== 'objetivos') draft = null; return (PAGES[sub] || home)(); }

const rerender = (root, sub) => { const y = scrollY; root.innerHTML = render(sub); mount(root, sub); scrollTo(0, y); };

export function mount(root, sub) {
  const view = root.firstElementChild;
  view.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.setting) update((s) => { s.settings[t.dataset.setting] = t.checked; });
    if (t.dataset.numSel) update((s) => { s.settings[t.dataset.numSel] = +t.value; });
    if (t.dataset.mealName != null) update((s) => { s.settings.meals[+t.dataset.mealName] = t.value.trim(); });
    if (t.dataset.num) { const v = Math.round(parseNum(t.value)); if (v > 0) update((s) => { s.settings[t.dataset.num] = v; }); else t.value = state.settings[t.dataset.num]; }
    if (t.dataset.draftSel) { draft[t.dataset.draftSel] = +t.value; rerender(root, sub); }
    if (t.dataset.draft) { const v = parseNum(t.value); if (v > 0) { draft[t.dataset.draft] = v; rerender(root, sub); } }
    if (t.dataset.target) { const v = Math.round(parseNum(t.value)); if (v >= 0) { update((s) => { s.targets[t.dataset.target] = v; s.ui.onboarded = true; }); rerender(root, sub); } }
    if (t.dataset.profile === 'weightGoal') { const v = parseNum(t.value); update((s) => { s.profile.weightGoal = v > 0 ? v : null; }); }
  });
  $('#importFile')?.addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const text = await file.text();
      if (!(await confirmSheet('¿Importar copia?', 'Se reemplazarán los datos de este dispositivo por los del archivo.', { ok: 'Importar', kind: 'accent' }))) return;
      importData(text);
      applyTheme();
      toast('Copia importada');
      rerender(root, sub);
    } catch (err) { toast(err.message || 'No se pudo importar'); }
    e.target.value = '';
  });
}

export function applyTheme() {
  const v = state.settings.theme;
  if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
  const dark = v === 'dark' || (v === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = dark ? '#0B0B0D' : '#F4F4F1'; });
}

export const actions = {
  draft(el, e, root, sub) { const v = el.dataset.v; draft[el.dataset.k] = Number.isNaN(+v) ? v : +v; if (el.dataset.k === 'goal') draft.rate = v === 'cut' ? 0.5 : 0.25; rerender(root, sub); },
  apply(el, e, root, sub) {
    const r = computeTargets(draft);
    update((s) => { s.profile = { ...s.profile, ...draft }; s.targets = { kcal: r.kcal, p: r.p, c: r.c, f: r.f }; s.ui.onboarded = true; });
    toast(`Objetivo: ${num(r.kcal)} kcal`);
    rerender(root, sub);
  },
  theme(el, e, root, sub) { update((s) => { s.settings.theme = el.dataset.v; }); applyTheme(); rerender(root, sub); },
  export() { download(`forja-copia-${dayKey()}.json`, exportData()); toast('Copia descargada'); },
  import() { $('#importFile').click(); },
  async wipe() {
    if (!(await confirmSheet('¿Borrar todo?', 'Se eliminarán comidas, pesos, entrenos y notas de este dispositivo. Exporta antes una copia si quieres conservarlos.', { ok: 'Borrar todo' }))) return;
    resetAll(); applyTheme(); toast('Datos borrados'); go('hoy');
  },
  async 'food-new'(el, e, root, sub) { await foodEditor(); rerender(root, sub); },
  async 'food-edit'(el, e, root, sub) {
    const f = state.foods.find((x) => x.id === el.dataset.id);
    const v = await sheet({ title: f.name, text: 'Los cambios se aplican a lo que añadas a partir de ahora.', actions: [{ label: 'Eliminar', value: 'delete', kind: 'danger' }, { label: 'Editar', value: 'edit', kind: 'accent' }] });
    if (v.value === 'edit') await foodEditor(f);
    if (v.value === 'delete' && await confirmSheet('¿Eliminar alimento?', 'Lo que ya registraste no cambia.')) update((s) => { s.foods = s.foods.filter((x) => x.id !== f.id); delete s.recent[f.id]; });
    rerender(root, sub);
  },
  async 'meal-del'(el, e, root, sub) {
    const id = el.closest('[data-id]').dataset.id;
    if (!(await confirmSheet('¿Eliminar comida guardada?', ''))) return;
    update((s) => { s.savedMeals = s.savedMeals.filter((m) => m.id !== id); });
    rerender(root, sub);
  },
};
