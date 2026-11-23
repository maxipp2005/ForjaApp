// Gimnasio: entreno en curso, rutinas, historial, récords y temporizador de descanso.
import { $, $$, esc, icon, uid, num, round, parseNum, norm, dayKey, parseDay, fmtDate, fmtDuration, fmtClock, dayLabel, haptic, sum } from '../utils.js';
import { state, update, exerciseById, allExercises, activeSession, exerciseHistory, bests, e1rm, sessionVolume } from '../store.js';
import { sheet, confirmSheet, toast, pickSheet, viewHeader, emptyState, back } from '../ui.js';
import { GROUPS, KINDS } from '../exercises.js';
import { lineChart } from '../charts.js';
import { go } from '../router.js';
import { beep } from '../sound.js';

// =====================================================================
// Utilidades
// =====================================================================
const doneSets = (item) => item.sets.filter((s) => s.done);
const fmtSet = (ex, s) => ex?.kind === 't' ? fmtClock(+s.sec || 0) : ex?.kind === 'bw' ? `${num(s.reps)}${+s.kg ? ` (+${num(s.kg, 1)} kg)` : ''}` : `${num(s.kg, 1)} × ${num(s.reps)}`;
const prevItem = (exId, excludeId) => exerciseHistory(exId, { excludeId })[0]?.item || null;

function startSession({ name = 'Entreno', routineId = null, exIds = [], from = null } = {}) {
  if (activeSession()) { toast('Ya tienes un entreno en curso'); return go('gym', 'entreno'); }
  const items = (from ? from.items.map((i) => ({ exId: i.exId, n: doneSets(i).length || 3 })) : exIds.map((exId) => ({ exId, n: prevItem(exId) ? doneSets(prevItem(exId)).length : 3 })))
    .map(({ exId, n }) => ({ exId, sets: Array.from({ length: Math.max(1, n) }, () => ({ kg: '', reps: '', sec: '', done: false })) }));
  const s = { id: uid(), date: dayKey(), start: Date.now(), end: null, name, routineId, items, notes: '' };
  update((st) => { st.gym.sessions.push(s); st.gym.active = s.id; });
  go('gym', 'entreno');
}

// =====================================================================
// Vistas
// =====================================================================
function home() {
  const act = activeSession();
  const recent = state.gym.sessions.filter((s) => s.end).sort((a, b) => b.start - a.start);
  const weekAgo = Date.now() - 7 * 86400000;
  const week = recent.filter((s) => s.start >= weekAgo);
  return `<section class="view">
    ${viewHeader('Gimnasio', week.length ? `${week.length} ${week.length === 1 ? 'entreno' : 'entrenos'} en 7 días · ${num(sum(week, sessionVolume) / 1000, 1)} t movidas` : 'Registra tus series en segundos')}
    ${act ? `<a class="card" href="#/gym/entreno" style="display:flex;align-items:center;gap:.875rem;background:var(--accent);color:var(--accent-ink)">
        <span style="flex:1"><b style="font-size:1.0625rem">${esc(act.name)} en curso</b><br><small style="opacity:.75">${fmtDuration((Date.now() - act.start) / 60000)} · ${sum(act.items, (i) => doneSets(i).length)} series hechas</small></span>
        ${icon('chevR', 'row__chev')}</a>` : `<div class="grid grid-2">
        <button class="btn btn--accent btn--lg" data-act="start-empty">${icon('play')} Entreno libre</button>
        <button class="btn btn--lg" data-act="new-routine">${icon('plus')} Nueva rutina</button></div>`}

    <h2 class="section-title">Rutinas</h2>
    ${state.gym.routines.length ? `<div class="list list--cols">${state.gym.routines.map((r) => `
      <div class="item" data-id="${r.id}">
        <a class="item__main" href="#/gym/rutina/${r.id}"><div class="item__title">${esc(r.name)}</div>
        <div class="item__meta">${r.exIds.length} ejercicios · ${esc(r.exIds.slice(0, 3).map((id) => exerciseById(id)?.name).filter(Boolean).join(', '))}${r.exIds.length > 3 ? '…' : ''}</div></a>
        ${act ? '' : `<button class="icon-btn icon-btn--fill" data-act="start-routine" aria-label="Empezar ${esc(r.name)}">${icon('play')}</button>`}
      </div>`).join('')}</div>`
    : `<div class="card"><p class="small muted">Crea rutinas como <b>Empuje</b>, <b>Tirón</b>, <b>Pierna</b> o <b>Fuerza para MMA</b> para empezarlas con un toque y con tus pesos anteriores ya puestos.</p></div>`}

    <h2 class="section-title">Historial <a href="#/gym/ejercicios">Ejercicios y récords</a></h2>
    ${recent.length ? `<div class="list list--cols">${recent.slice(0, 30).map((s) => {
      const prs = sum(s.items, (i) => i.sets.filter((x) => x.pr).length);
      return `<a class="item" href="#/gym/sesion/${s.id}">
        <div class="item__main"><div class="item__title">${esc(s.name)}</div>
        <div class="item__meta"><span>${dayLabel(s.date)}</span><span>${fmtDuration((s.end - s.start) / 60000)}</span><span>${sum(s.items, (i) => doneSets(i).length)} series</span>${prs ? `<span class="chip chip--sm chip--warn">${icon('trophy', 'row__chev')} ${prs} PR</span>` : ''}</div></div>
        <div class="item__end"><b>${num(sessionVolume(s))}</b><small>kg</small></div></a>`;
    }).join('')}</div>` : emptyState('dumbbell', 'Aún no hay entrenos', 'Empieza un entreno libre o crea tu primera rutina.')}
  </section>`;
}

function workout() {
  const s = activeSession();
  if (!s) return `<section class="view">${back('#/gym', 'Gimnasio')}${emptyState('dumbbell', 'No hay ningún entreno en curso', 'Empieza uno desde Gimnasio.', '<a class="btn btn--accent" href="#/gym">Ir a Gimnasio</a>')}</section>`;
  return `<section class="view">
    <div class="workout-head" style="margin-bottom:1rem">
      <div class="workout-head__t"><input value="${esc(s.name)}" data-w="name" aria-label="Nombre del entreno" maxlength="40"><small id="wElapsed">${fmtDuration((Date.now() - s.start) / 60000)}</small></div>
      <button class="btn btn--accent btn--sm" data-act="finish">Terminar</button>
    </div>
    ${s.items.map((it, idx) => exCard(s, it, idx)).join('')}
    <button class="btn btn--block mt" data-act="add-ex">${icon('plus')} Añadir ejercicio</button>
    <label class="field mt"><span>Notas</span><textarea class="textarea" data-w="notes" rows="2" placeholder="Sensaciones, molestias, técnica…">${esc(s.notes || '')}</textarea></label>
    <button class="btn btn--ghost btn--block mt" data-act="discard" style="color:var(--danger)">Descartar entreno</button>
  </section>`;
}

function exCard(s, it, idx) {
  const ex = exerciseById(it.exId) || { name: 'Ejercicio eliminado', kind: 'w', group: '' };
  const prev = prevItem(it.exId, s.id);
  const pSets = prev ? doneSets(prev) : [];
  const k = ex.kind;
  const head = k === 't' ? '<span>Tiempo (s)</span><span></span>' : k === 'bw' ? '<span>Lastre kg</span><span>Reps</span>' : '<span>kg</span><span>Reps</span>';
  return `<div class="ex" data-i="${idx}">
    <div class="ex__head"><div class="ex__name">${esc(ex.name)}<small>${esc(ex.group)}${prev ? ` · Anterior: ${pSets.map((x) => fmtSet(ex, x)).join(', ')}` : ''}</small></div>
      <button class="icon-btn" data-act="ex-menu" aria-label="Opciones">${icon('dots')}</button></div>
    <div class="sets">
      <div class="set set--h"><span>#</span>${head}<span></span></div>
      ${it.sets.map((st, j) => {
        const p = pSets[j] || pSets.at(-1) || {};
        const inp = (f, ph, mode = 'decimal') => `<input data-f="${f}" inputmode="${mode}" value="${st[f] === '' || st[f] == null ? '' : num(st[f], 2)}" placeholder="${ph === '' || ph == null ? '' : num(ph, 2)}" aria-label="${f}">`;
        return `<div class="set ${st.done ? 'is-done' : ''}" data-j="${j}">
          <span class="set__n">${st.pr ? '<span class="set__pr">PR</span>' : j + 1}</span>
          ${k === 't' ? `${inp('sec', p.sec ?? 60, 'numeric')}<span></span>` : `${inp('kg', k === 'bw' ? (p.kg || '') : p.kg)}${inp('reps', p.reps, 'numeric')}`}
          <button class="set__ok" data-act="set-done" aria-label="Serie hecha">${icon('check')}</button></div>`;
      }).join('')}
    </div>
    <div class="ex__foot">
      <button class="btn btn--ghost btn--sm" data-act="set-del" ${it.sets.length < 2 ? 'disabled' : ''}>${icon('minus')} Serie</button>
      <button class="btn btn--sm" data-act="set-add">${icon('plus')} Serie</button>
    </div>
  </div>`;
}

function sessionDetail(id) {
  const s = state.gym.sessions.find((x) => x.id === id);
  if (!s) return `<section class="view">${back('#/gym', 'Gimnasio')}${emptyState('dumbbell', 'Entreno no encontrado', '')}</section>`;
  const prs = sum(s.items, (i) => i.sets.filter((x) => x.pr).length);
  return `<section class="view view--narrow">
    ${back('#/gym', 'Gimnasio')}
    ${viewHeader(s.name, `${fmtDate(parseDay(s.date))} · ${fmtDuration((s.end - s.start) / 60000)}`)}
    <div class="grid grid-3">
      <div class="stat"><div class="stat__k">Volumen</div><div class="stat__v">${num(sessionVolume(s))}<small>kg</small></div></div>
      <div class="stat"><div class="stat__k">Series</div><div class="stat__v">${sum(s.items, (i) => doneSets(i).length)}</div></div>
      <div class="stat"><div class="stat__k">Récords</div><div class="stat__v">${prs}</div></div>
    </div>
    <div class="mt">${s.items.map((it) => { const ex = exerciseById(it.exId); return `<a class="card" style="display:block" href="#/gym/ejercicio/${encodeURIComponent(it.exId)}">
      <div class="spread"><b>${esc(ex?.name || '—')}</b>${icon('chevR', 'row__chev')}</div>
      <div class="chips mt">${doneSets(it).map((x) => `<span class="chip ${x.pr ? 'chip--warn' : ''}">${x.pr ? '🏆 ' : ''}${fmtSet(ex, x)}</span>`).join('')}</div></a>`; }).join('')}</div>
    ${s.notes ? `<h2 class="section-title">Notas</h2><div class="card text-block">${esc(s.notes)}</div>` : ''}
    <div class="grid grid-2 mt-lg">
      <button class="btn" data-act="repeat" data-id="${s.id}">${icon('refresh')} Repetir</button>
      <button class="btn" data-act="to-routine" data-id="${s.id}">${icon('bookmark')} Guardar como rutina</button>
    </div>
    <button class="btn btn--ghost btn--block mt" data-act="del-session" data-id="${s.id}" style="color:var(--danger)">${icon('trash')} Eliminar entreno</button>
  </section>`;
}

function exercisesList() {
  const used = new Map();
  for (const s of state.gym.sessions) if (s.end) for (const i of s.items) if (doneSets(i).length) used.set(i.exId, Math.max(used.get(i.exId) || 0, s.start));
  const list = [...used.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => exerciseById(id)).filter(Boolean);
  return `<section class="view view--narrow">
    ${back('#/gym', 'Gimnasio')}
    ${viewHeader('Ejercicios y récords', 'Tus mejores marcas por ejercicio', `<button class="btn btn--sm" data-act="new-ex">${icon('plus')} Crear</button>`)}
    ${list.length ? `<div class="list">${list.map((ex) => {
      const b = bests(ex.id);
      const best = ex.kind === 't' ? fmtClock(b.sec) : ex.kind === 'bw' ? `${num(b.reps)} reps` : `${num(b.kg, 1)} kg`;
      return `<a class="item" href="#/gym/ejercicio/${encodeURIComponent(ex.id)}"><div class="item__main"><div class="item__title">${esc(ex.name)}</div>
        <div class="item__meta"><span>${esc(ex.group)}</span>${ex.kind === 'w' && b.e1rm ? `<span>1RM est. ${num(b.e1rm)} kg</span>` : ''}</div></div>
        <div class="item__end"><b>${best}</b><small>mejor</small></div></a>`;
    }).join('')}</div>` : emptyState('trophy', 'Sin récords todavía', 'Cuando completes series aparecerán aquí tus mejores marcas.')}
    ${state.gym.exercises.length ? `<h2 class="section-title">Ejercicios creados por ti</h2><div class="rows">${state.gym.exercises.map((ex) => `<div class="row"><span class="row__main"><span class="row__title">${esc(ex.name)}</span><span class="row__sub">${esc(ex.group)} · ${KINDS[ex.kind]}</span></span><button class="icon-btn" data-act="del-ex" data-id="${ex.id}" aria-label="Eliminar">${icon('trash')}</button></div>`).join('')}</div>` : ''}
  </section>`;
}

function exerciseDetail(id) {
  const ex = exerciseById(id);
  if (!ex) return `<section class="view">${back('#/gym/ejercicios', 'Ejercicios')}${emptyState('dumbbell', 'Ejercicio no encontrado', '')}</section>`;
  const hist = exerciseHistory(id);
  const b = bests(id);
  const pts = hist.slice().reverse().map(({ session, item }) => {
    const ds = doneSets(item);
    const y = ex.kind === 'w' ? Math.max(...ds.map((s) => e1rm(+s.kg || 0, +s.reps || 0))) : ex.kind === 't' ? Math.max(...ds.map((s) => +s.sec || 0)) : Math.max(...ds.map((s) => +s.reps || 0));
    return { x: session.start, y: round(y, 1) };
  });
  const metric = ex.kind === 'w' ? '1RM estimado (kg)' : ex.kind === 't' ? 'Mejor tiempo (s)' : 'Máximo de repeticiones';
  return `<section class="view view--narrow">
    ${back('#/gym/ejercicios', 'Ejercicios')}
    ${viewHeader(ex.name, `${esc(ex.group)} · ${KINDS[ex.kind]}`)}
    <div class="grid grid-3">
      ${ex.kind === 'w' ? `<div class="stat"><div class="stat__k">Peso máx.</div><div class="stat__v">${num(b.kg, 1)}<small>kg</small></div></div>
      <div class="stat"><div class="stat__k">1RM est.</div><div class="stat__v">${num(b.e1rm)}<small>kg</small></div></div>` : ''}
      ${ex.kind === 't' ? `<div class="stat"><div class="stat__k">Mejor tiempo</div><div class="stat__v">${fmtClock(b.sec)}</div></div>` : ''}
      ${ex.kind !== 't' ? `<div class="stat"><div class="stat__k">Reps máx.</div><div class="stat__v">${num(b.reps)}</div></div>` : ''}
      <div class="stat"><div class="stat__k">Sesiones</div><div class="stat__v">${hist.length}</div></div>
    </div>
    ${pts.length > 1 ? `<div class="card mt"><div class="spread"><b>Progresión</b><span class="small muted">${metric}</span></div>${lineChart(pts, { decimals: 1 })}</div>` : ''}
    <h2 class="section-title">Historial</h2>
    ${hist.length ? `<div class="list">${hist.map(({ session, item }) => `<a class="item" href="#/gym/sesion/${session.id}"><div class="item__main">
      <div class="item__title">${dayLabel(session.date)} <span class="muted" style="font-weight:500">· ${esc(session.name)}</span></div>
      <div class="chips" style="margin-top:.375rem">${doneSets(item).map((x) => `<span class="chip chip--sm ${x.pr ? 'chip--warn' : ''}">${fmtSet(ex, x)}</span>`).join('')}</div></div></a>`).join('')}</div>`
    : '<p class="small muted">Aún no has hecho este ejercicio.</p>'}
    ${ex.kind === 'w' ? '<p class="small muted mt">El 1RM estimado usa la fórmula de Epley: peso × (1 + reps / 30).</p>' : ''}
  </section>`;
}

function routineEditor(id) {
  const r = state.gym.routines.find((x) => x.id === id);
  if (!r) return `<section class="view">${back('#/gym', 'Gimnasio')}${emptyState('list', 'Rutina no encontrada', '')}</section>`;
  return `<section class="view view--narrow" data-routine="${r.id}">
    ${back('#/gym', 'Gimnasio')}
    <div class="workout-head" style="margin-bottom:1rem"><div class="workout-head__t"><input value="${esc(r.name)}" data-r="name" aria-label="Nombre de la rutina" maxlength="40"><small>${r.exIds.length} ejercicios</small></div>
      ${activeSession() ? '' : `<button class="btn btn--accent btn--sm" data-act="start-routine" data-id="${r.id}">${icon('play')} Empezar</button>`}</div>
    ${r.exIds.length ? `<div class="rows">${r.exIds.map((exId, i) => { const ex = exerciseById(exId); const b = ex ? bests(exId) : null; return `<div class="row" data-k="${i}">
      <span class="row__main"><span class="row__title">${esc(ex?.name || '—')}</span><span class="row__sub">${esc(ex?.group || '')}${b && b.kg ? ` · mejor ${num(b.kg, 1)} kg` : ''}</span></span>
      <button class="icon-btn" data-act="r-up" aria-label="Subir" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${icon('chevU')}</button>
      <button class="icon-btn" data-act="r-del" aria-label="Quitar">${icon('close')}</button></div>`; }).join('')}</div>` : '<p class="small muted">Añade los ejercicios en el orden en que los haces.</p>'}
    <button class="btn btn--block mt" data-act="r-add">${icon('plus')} Añadir ejercicio</button>
    <button class="btn btn--ghost btn--block mt-lg" data-act="r-delete" style="color:var(--danger)">${icon('trash')} Eliminar rutina</button>
  </section>`;
}

const PAGES = { '': home, entreno: workout, sesion: sessionDetail, ejercicios: exercisesList, ejercicio: exerciseDetail, rutina: routineEditor };
export function render(sub = '', id = '') { return (PAGES[sub] || home)(id); }

// =====================================================================
// Montaje: edición en vivo de series y temporizadores
// =====================================================================
let tick = null;
export function mount(root, sub) {
  clearInterval(tick);
  if (sub === 'entreno') {
    tick = setInterval(() => { const s = activeSession(); const el = $('#wElapsed'); if (s && el) el.textContent = fmtDuration((Date.now() - s.start) / 60000); }, 20000);
    root.firstElementChild.addEventListener('input', onWorkoutInput);
  }
  if (sub === 'rutina') root.firstElementChild.addEventListener('input', (e) => {
    if (e.target.dataset.r !== 'name') return;
    const id = root.querySelector('[data-routine]').dataset.routine;
    update((s) => { s.gym.routines.find((r) => r.id === id).name = e.target.value; }, { silent: true });
  });
  paintRest();
}
export function unmount() { clearInterval(tick); }

function onWorkoutInput(e) {
  const t = e.target;
  const s = activeSession(); if (!s) return;
  if (t.dataset.w) { update((st) => { activeSession()[t.dataset.w] = t.value; }, { silent: true }); return; }
  const f = t.dataset.f; if (!f) return;
  const i = +t.closest('[data-i]').dataset.i, j = +t.closest('[data-j]').dataset.j;
  const v = t.value.trim() === '' ? '' : parseNum(t.value);
  update(() => { activeSession().items[i].sets[j][f] = Number.isNaN(v) ? '' : v; }, { silent: true });
}

const refresh = (root, sub, id) => { const y = scrollY; root.innerHTML = render(sub, id); scrollTo(0, y); };

// =====================================================================
// Descanso entre series
// =====================================================================
let rest = null; // { end, total, timer }
function startRest(sec = state.settings.restSec) {
  if (!sec) return;
  stopRest();
  rest = { end: Date.now() + sec * 1000, total: sec, timer: setInterval(paintRest, 250) };
  paintRest();
}
function stopRest() { if (rest) clearInterval(rest.timer); rest = null; $('#restbar')?.remove(); }
function paintRest() {
  if (!rest) return;
  const left = (rest.end - Date.now()) / 1000;
  if (left <= 0) { stopRest(); beep(); haptic([200, 80, 200]); toast('Descanso terminado: ¡a por la siguiente serie!'); return; }
  let el = $('#restbar');
  if (!el) {
    el = document.createElement('div'); el.id = 'restbar'; el.className = 'restbar'; el.setAttribute('role', 'timer');
    el.innerHTML = `<span>Descanso</span><b></b><span class="restbar__bar"><i></i></span><button data-r="-15">−15</button><button data-r="15">+15</button><button data-r="0">${icon('close', 'row__chev')}</button>`;
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (!b) return; const d = +b.dataset.r; if (!d) return stopRest(); rest.end += d * 1000; rest.total = Math.max(rest.total + d, 1); paintRest(); });
    document.body.appendChild(el);
  }
  el.querySelector('b').textContent = fmtClock(Math.ceil(left));
  el.querySelector('i').style.width = `${(left / rest.total) * 100}%`;
}

// =====================================================================
// Selector de ejercicios
// =====================================================================
async function pickExercise(title = 'Añadir ejercicio') {
  let picked;
  const listHtml = (q) => {
    const w = norm(q).split(/\s+/).filter(Boolean);
    const all = allExercises().filter((e) => w.every((x) => norm(e.name + ' ' + e.group).includes(x)));
    return GROUPS.map((g) => { const items = all.filter((e) => e.group === g); return items.length ? `<div class="section-title" style="margin:.75rem .5rem .25rem">${g}</div>` + items.map((e) => `<button type="button" class="opt" data-ex="${esc(e.id)}"><span>${esc(e.name)}</span><small>${e.kind === 't' ? 'tiempo' : e.kind === 'bw' ? 'corporal' : ''}</small></button>`).join('') : ''; }).join('')
      + `<button type="button" class="opt" data-ex="__new"><span style="color:var(--accent-text);font-weight:600">+ Crear ejercicio${q ? ` «${esc(q)}»` : ''}</span></button>`;
  };
  const res = await sheet({
    title,
    body: `<label class="search">${icon('search')}<input class="input" id="exQ" type="search" placeholder="Buscar ejercicio" autocomplete="off"></label><div class="opt-list" id="exList">${listHtml('')}</div>`,
    actions: [{ label: 'Cerrar', value: 'cancel' }],
    onOpen: (form, close) => {
      const q = $('#exQ');
      q.addEventListener('input', () => { $('#exList').innerHTML = listHtml(q.value); });
      form.addEventListener('click', (e) => { const b = e.target.closest('[data-ex]'); if (b) { picked = b.dataset.ex === '__new' ? '__new:' + q.value : b.dataset.ex; close('pick'); } });
    },
  });
  if (res.value !== 'pick') return null;
  if (picked.startsWith('__new:')) return (await newExerciseSheet(picked.slice(6)))?.id || null;
  return picked;
}

async function newExerciseSheet(name = '') {
  const { value, data } = await sheet({
    title: 'Nuevo ejercicio',
    body: `<div class="form-stack"><label class="field"><span>Nombre</span><input class="input" name="name" required maxlength="50" value="${esc(name)}" autofocus></label>
      <label class="field"><span>Grupo</span><select class="select" name="group">${GROUPS.map((g) => `<option>${g}</option>`).join('')}</select></label>
      <label class="field"><span>Tipo</span><select class="select" name="kind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label></div>`,
  });
  if (value !== 'ok' || !data.name.trim()) return null;
  const ex = { id: 'u:' + uid(), name: data.name.trim(), group: data.group, kind: data.kind };
  update((s) => s.gym.exercises.push(ex));
  return ex;
}

// =====================================================================
// Acciones
// =====================================================================
const idx = (el) => [+el.closest('[data-i]')?.dataset.i, +el.closest('[data-j]')?.dataset.j];

export const actions = {
  'start-empty'() { startSession(); },
  'start-routine'(el) {
    const r = state.gym.routines.find((x) => x.id === (el.dataset.id || el.closest('[data-id]').dataset.id));
    startSession({ name: r.name, routineId: r.id, exIds: r.exIds });
  },
  async 'new-routine'() {
    const { value, data } = await sheet({ title: 'Nueva rutina', body: `<input class="input" name="name" required maxlength="40" placeholder="Ej. Empuje, Pierna, Fuerza MMA" autofocus>` });
    if (value !== 'ok' || !data.name.trim()) return;
    const r = { id: uid(), name: data.name.trim(), exIds: [] };
    update((s) => s.gym.routines.push(r));
    go('gym', 'rutina', r.id);
  },

  // Entreno en curso
  async 'add-ex'(el, e, root, sub, id) {
    const exId = await pickExercise();
    if (!exId) return;
    const prev = prevItem(exId);
    const n = prev ? doneSets(prev).length : 3;
    update(() => activeSession().items.push({ exId, sets: Array.from({ length: n }, () => ({ kg: '', reps: '', sec: '', done: false })) }));
    refresh(root, sub, id);
    root.querySelector('.ex:last-of-type')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
  'set-done'(el, e, root, sub, id) {
    const [i, j] = idx(el);
    const s = activeSession();
    const it = s.items[i], st = it.sets[j];
    const ex = exerciseById(it.exId) || { kind: 'w' };
    const row = el.closest('.set');
    if (!st.done) {
      // Usa los valores sugeridos (los del último entreno) si la serie está vacía.
      row.querySelectorAll('input').forEach((inp) => { if (inp.value === '' && inp.placeholder !== '') { inp.value = inp.placeholder; } });
      const vals = {};
      row.querySelectorAll('input').forEach((inp) => { const v = parseNum(inp.value); vals[inp.dataset.f] = Number.isNaN(v) ? '' : v; });
      const valid = ex.kind === 't' ? vals.sec > 0 : vals.reps > 0 && (ex.kind === 'bw' || vals.kg >= 0);
      if (!valid) { toast(ex.kind === 't' ? 'Indica el tiempo' : 'Indica las repeticiones'); return; }
      const b = bests(it.exId, { excludeId: s.id });
      const sessionBest = Math.max(0, ...it.sets.filter((x, k) => x.done && k !== j).map((x) => ex.kind === 'w' ? e1rm(+x.kg, +x.reps) : ex.kind === 't' ? +x.sec : +x.reps));
      const score = ex.kind === 'w' ? e1rm(+vals.kg, +vals.reps) : ex.kind === 't' ? vals.sec : vals.reps;
      const prevBest = ex.kind === 'w' ? b.e1rm : ex.kind === 't' ? b.sec : b.reps;
      const pr = prevBest > 0 && score > prevBest && score > sessionBest;
      update(() => Object.assign(st, vals, { done: true, pr }), { silent: true });
      haptic(15);
      if (pr) toast(`🏆 ¡Nuevo récord en ${ex.name}!`);
      startRest();
    } else {
      update(() => Object.assign(st, { done: false, pr: false }), { silent: true });
    }
    refresh(root, sub, id);
  },
  'set-add'(el, e, root, sub, id) {
    const [i] = idx(el);
    update(() => { const sets = activeSession().items[i].sets; const last = sets.at(-1); sets.push({ kg: last?.kg ?? '', reps: last?.reps ?? '', sec: last?.sec ?? '', done: false }); });
    refresh(root, sub, id);
  },
  'set-del'(el, e, root, sub, id) {
    const [i] = idx(el);
    update(() => { const sets = activeSession().items[i].sets; if (sets.length > 1) sets.pop(); });
    refresh(root, sub, id);
  },
  async 'ex-menu'(el, e, root, sub, id) {
    const [i] = idx(el);
    const v = await pickSheet(exerciseById(activeSession().items[i].exId)?.name || 'Ejercicio', [
      { value: 'swap', label: 'Cambiar por otro ejercicio' },
      ...(i > 0 ? [{ value: 'up', label: 'Mover arriba' }] : []),
      { value: 'del', label: 'Quitar del entreno' },
    ]);
    if (v === 'swap') { const ex = await pickExercise('Cambiar por'); if (ex) update(() => { activeSession().items[i].exId = ex; }); }
    if (v === 'up') update(() => { const a = activeSession().items; [a[i - 1], a[i]] = [a[i], a[i - 1]]; });
    if (v === 'del') update(() => activeSession().items.splice(i, 1));
    refresh(root, sub, id);
  },
  async finish() {
    const s = activeSession();
    const n = sum(s.items, (i) => doneSets(i).length);
    if (!n) {
      if (await confirmSheet('No hay series completadas', '¿Descartar este entreno?', { ok: 'Descartar' })) actions.discardNow();
      return;
    }
    if (!(await confirmSheet('¿Terminar entreno?', `${n} series completadas. Las series sin marcar no se guardan.`, { ok: 'Terminar', kind: 'accent' }))) return;
    update((st) => {
      const x = activeSession();
      x.items = x.items.map((i) => ({ ...i, sets: doneSets(i) })).filter((i) => i.sets.length);
      x.end = Date.now();
      x.name = x.name.trim() || 'Entreno';
      st.gym.active = null;
    });
    stopRest();
    const prs = sum(s.items, (i) => i.sets.filter((x) => x.pr).length);
    toast(`Entreno guardado · ${num(sessionVolume(s))} kg${prs ? ` · ${prs} ${prs === 1 ? 'récord' : 'récords'} 🏆` : ''}`);
    go('gym', 'sesion', s.id);
  },
  async discard() { if (await confirmSheet('¿Descartar entreno?', 'Se perderán las series de esta sesión.', { ok: 'Descartar' })) actions.discardNow(); },
  discardNow() { update((st) => { st.gym.sessions = st.gym.sessions.filter((x) => x.id !== st.gym.active); st.gym.active = null; }); stopRest(); go('gym'); },

  // Historial
  repeat(el) { const s = state.gym.sessions.find((x) => x.id === el.dataset.id); startSession({ name: s.name, routineId: s.routineId, from: s }); },
  async 'to-routine'(el) {
    const s = state.gym.sessions.find((x) => x.id === el.dataset.id);
    const { value, data } = await sheet({ title: 'Guardar como rutina', body: `<input class="input" name="name" required maxlength="40" value="${esc(s.name)}" autofocus>` });
    if (value !== 'ok') return;
    const r = { id: uid(), name: data.name.trim() || s.name, exIds: s.items.map((i) => i.exId) };
    update((st) => st.gym.routines.push(r));
    toast('Rutina creada');
    go('gym', 'rutina', r.id);
  },
  async 'del-session'(el) {
    if (!(await confirmSheet('¿Eliminar entreno?', 'También se quitará de tus récords.'))) return;
    update((st) => { st.gym.sessions = st.gym.sessions.filter((x) => x.id !== el.dataset.id); });
    go('gym');
  },
  async 'new-ex'(el, e, root, sub, id) { await newExerciseSheet(); refresh(root, sub, id); },
  async 'del-ex'(el, e, root, sub, id) {
    if (!(await confirmSheet('¿Eliminar ejercicio?', 'Su historial seguirá en los entrenos pasados.'))) return;
    update((st) => { st.gym.exercises = st.gym.exercises.filter((x) => x.id !== el.dataset.id); st.gym.routines.forEach((r) => { r.exIds = r.exIds.filter((x) => x !== el.dataset.id); }); });
    refresh(root, sub, id);
  },

  // Rutinas
  async 'r-add'(el, e, root, sub, id) {
    const exId = await pickExercise();
    if (exId) update((s) => s.gym.routines.find((r) => r.id === id).exIds.push(exId));
    refresh(root, sub, id);
  },
  'r-del'(el, e, root, sub, id) { const k = +el.closest('[data-k]').dataset.k; update((s) => s.gym.routines.find((r) => r.id === id).exIds.splice(k, 1)); refresh(root, sub, id); },
  'r-up'(el, e, root, sub, id) { const k = +el.closest('[data-k]').dataset.k; if (!k) return; update((s) => { const a = s.gym.routines.find((r) => r.id === id).exIds; [a[k - 1], a[k]] = [a[k], a[k - 1]]; }); refresh(root, sub, id); },
  async 'r-delete'(el, e, root, sub, id) {
    if (!(await confirmSheet('¿Eliminar rutina?', 'Tus entrenos pasados no se borran.'))) return;
    update((s) => { s.gym.routines = s.gym.routines.filter((r) => r.id !== id); });
    go('gym');
  },
};
