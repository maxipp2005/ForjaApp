// MMA / BJJ: semana con objetivos y reflexión, sesiones, perfil de luchador, técnicas y próxima competición.
import { $, esc, icon, uid, num, parseNum, dayKey, parseDay, addDays, weekStart, weekKey, fmtDate, fmtDuration, daysBetween, relDays, dayLabel, sum, debounce } from '../utils.js';
import { state, update, latestWeight } from '../store.js';
import { sheet, confirmSheet, toast, viewHeader, emptyState, back } from '../ui.js';
import { barChart } from '../charts.js';

export const TYPES = {
  gi: ['BJJ Gi', '#4C7DF0'], nogi: ['BJJ No-Gi', '#13A8A8'], mma: ['MMA', '#E5453C'], striking: ['Striking', '#F08C20'],
  lucha: ['Lucha', '#8A5CF0'], sparring: ['Sparring', '#D9468C'], fisico: ['Físico', '#7A7A80'],
};
const BELTS = { Blanco: '#F1F1EE', Azul: '#1E5BD6', Morado: '#6B2FB3', Marrón: '#6E4223', Negro: '#151515' };
const STYLES = ['Presión', 'Contragolpeador', 'Volumen', 'Wrestler', 'Grappler', 'Striker', 'Guardero', 'Pasador', 'Sumisiones', 'Ground & pound', 'Kickboxing', 'Muay thai', 'Boxeo', 'Clinch'];
const CATS = ['Derribos', 'Guardia', 'Pasaje', 'Control', 'Sumisión', 'Escapes', 'Barridas', 'Striking', 'Clinch', 'Defensa', 'Otros'];
const STATUS = { learn: ['Aprendiendo', 'chip--warn'], practice: ['Practicando', 'chip--accent'], done: ['Dominada', 'chip--ok'] };

let weekOffset = 0;
let techFilter = '';

const typeDot = (t) => `<span class="type-dot" style="background:${TYPES[t]?.[1] || 'var(--muted)'}"></span>`;
const weekOf = (off) => { const start = addDays(weekStart(), off * 7); return { start, end: addDays(start, 6), key: weekKey(start) }; };
const sessionsIn = (start, end) => state.mma.sessions.filter((s) => s.date >= dayKey(start) && s.date <= dayKey(end)).sort((a, b) => a.date.localeCompare(b.date));
const weekData = (key) => state.mma.weeks[key] || { goals: [], reflection: '' };

// =====================================================================
// Semana
// =====================================================================
function home() {
  const w = weekOf(weekOffset);
  const ss = sessionsIn(w.start, w.end);
  const wd = weekData(w.key);
  const mins = sum(ss, (s) => s.min);
  const rpe = ss.length ? sum(ss, (s) => s.rpe) / ss.length : 0;
  const rounds = sum(ss, (s) => s.rounds);
  const goalsDone = wd.goals.filter((g) => g.done).length;
  const ev = state.mma.event;
  const evDays = ev.date ? daysBetween(new Date(), parseDay(ev.date)) : null;
  const lw = latestWeight();

  // Horas de las últimas 8 semanas
  const hist = Array.from({ length: 8 }, (_, i) => { const x = weekOf(weekOffset - 7 + i); return { value: sum(sessionsIn(x.start, x.end), (s) => s.min) / 60, label: `${x.start.getDate()}/${x.start.getMonth() + 1}`, highlight: i === 7 }; });

  return `<section class="view">
    ${viewHeader('MMA · BJJ', weekOffset === 0 ? 'Esta semana' : weekOffset === -1 ? 'Semana pasada' : `Semana ${w.key.split('-W')[1]}`, `<button class="btn btn--accent btn--sm" data-act="add">${icon('plus')} Sesión</button>`)}
    <div class="card week-nav">
      <button class="icon-btn" data-act="week" data-d="-1" aria-label="Semana anterior">${icon('chevL')}</button>
      <b>${w.start.getDate()} ${fmtDate(w.start).split(' ')[2]} – ${w.end.getDate()} ${fmtDate(w.end).split(' ')[2]}</b>
      <button class="icon-btn" data-act="week" data-d="1" aria-label="Semana siguiente" ${weekOffset >= 0 ? 'disabled style="opacity:.3"' : ''}>${icon('chevR')}</button>
    </div>

    ${ev.name && evDays !== null && evDays >= 0 ? `<a class="card mt" href="#/mma/perfil" style="display:flex;align-items:center;gap:1rem">
      <div style="font:700 2.25rem/1 var(--font-round);color:var(--accent-text)">${evDays}<small style="font-size:.875rem;color:var(--muted);margin-left:.25rem">${evDays === 1 ? 'día' : 'días'}</small></div>
      <div style="min-width:0"><div class="small muted">Próxima competición</div><b>${esc(ev.name)}</b>
      ${ev.weight && lw ? `<div class="small" style="color:${lw.kg - parseNum(ev.weight) > 0 ? 'var(--warn)' : 'var(--ok)'}">${lw.kg - parseNum(ev.weight) > 0 ? `${num(lw.kg - parseNum(ev.weight), 1)} kg por encima del peso` : 'En peso ✓'} (${num(parseNum(ev.weight), 1)} kg)</div>` : ''}</div></a>` : ''}

    <div class="grid grid-2 mt">
      <div class="stat"><div class="stat__k">Sesiones</div><div class="stat__v">${ss.length}</div></div>
      <div class="stat"><div class="stat__k">Tatami</div><div class="stat__v">${num(mins / 60, 1)}<small>h</small></div></div>
      <div class="stat"><div class="stat__k">Intensidad media</div><div class="stat__v">${rpe ? num(rpe, 1) : '–'}<small>/10</small></div></div>
      <div class="stat"><div class="stat__k">Rondas de sparring</div><div class="stat__v">${rounds}</div></div>
    </div>

    <div class="duo mt">
      <div class="card">
        <div class="spread"><b>Objetivos de la semana</b><span class="small muted">${goalsDone}/${wd.goals.length}</span></div>
        <div class="mt">${wd.goals.map((g) => `<div class="goal ${g.done ? 'is-done' : ''}" data-g="${g.id}">
          <button class="check ${g.done ? 'is-on' : ''}" data-act="goal-toggle" aria-label="Completar">${icon('check')}</button><span>${esc(g.text)}</span>
          <button class="icon-btn" data-act="goal-del" aria-label="Quitar">${icon('close')}</button></div>`).join('') || '<p class="small muted">Ej.: «Mantener la guardia alta en sparring», «3 entradas de doble pierna por ronda», «Cerrar el triángulo desde guardia».</p>'}</div>
        <form class="spread mt" data-form="goal"><input class="input" name="g" placeholder="Nuevo objetivo…" maxlength="120" autocomplete="off" enterkeyhint="done"><button class="icon-btn icon-btn--accent" aria-label="Añadir objetivo">${icon('plus')}</button></form>
        ${weekOffset === 0 && !wd.goals.length && weekData(weekOf(-1).key).goals.some((g) => !g.done) ? `<button class="btn btn--ghost btn--sm mt" data-act="goals-carry">Traer pendientes de la semana pasada</button>` : ''}
      </div>
      <div class="card">
        <b>Reflexión semanal</b>
        <p class="small muted" style="margin:.25rem 0 .625rem">Qué funcionó, qué falló y en qué centrarte la próxima semana.</p>
        <textarea class="textarea" data-reflect="${w.key}" rows="5" placeholder="Esta semana…">${esc(wd.reflection)}</textarea>
      </div>
    </div>

    <h2 class="section-title">Sesiones</h2>
    ${ss.length ? `<div class="list list--cols">${ss.slice().reverse().map(sessionRow).join('')}</div>` : emptyState('glove', 'Sin sesiones esta semana', 'Registra cada clase o sparring: qué trabajaste, qué funcionó y qué mejorar.')}

    <div class="card mt-lg"><div class="spread"><b>Horas de entreno</b><span class="small muted">8 semanas</span></div>${barChart(hist, { height: 130, fmt: (v) => num(v, 1) + ' h' })}</div>

    <div class="tiles mt-lg">
      <a class="tile" href="#/mma/perfil"><span class="row__icon" style="background:#E5453C">${icon('user')}</span><span><b>Perfil de luchador</b><small>Estilo, plan de juego, récord</small></span></a>
      <a class="tile" href="#/mma/tecnicas"><span class="row__icon" style="background:#4C7DF0">${icon('note')}</span><span><b>Técnicas</b><small>${state.mma.techniques.length} en tu biblioteca</small></span></a>
    </div>
  </section>`;
}

function sessionRow(s) {
  const [label] = TYPES[s.type] || ['Sesión'];
  const detail = s.worked || s.good || s.improve || s.notes || '';
  return `<button class="item" data-act="edit" data-id="${s.id}" style="align-items:flex-start">
    ${typeDot(s.type)}
    <span class="item__main"><span class="item__title">${esc(label)} <span class="muted" style="font-weight:500">· ${dayLabel(s.date)}</span></span>
      <span class="item__meta"><span>${fmtDuration(s.min)}</span><span>RPE ${s.rpe}</span>${s.rounds ? `<span>${s.rounds} rondas</span>` : ''}</span>
      ${detail ? `<span class="small muted" style="display:block;margin-top:.25rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(detail)}</span>` : ''}</span>
  </button>`;
}

// =====================================================================
// Perfil
// =====================================================================
function profile() {
  const p = state.mma.profile, ev = state.mma.event;
  const area = (k, label, ph) => `<label class="field"><span>${label}</span><textarea class="textarea" data-pf="${k}" rows="3" placeholder="${ph}">${esc(p[k] || '')}</textarea></label>`;
  return `<section class="view view--narrow">
    ${back('#/mma', 'MMA · BJJ')}
    ${viewHeader('Perfil de luchador')}
    <div class="card">
      <div class="spread"><b>Cinturón BJJ</b><span class="belt"><i style="background:${BELTS[p.belt]}"></i><em>${Array.from({ length: p.stripes }, () => '<s></s>').join('') || '<s style="opacity:0"></s>'}</em></span></div>
      <div class="form-row mt">
        <label class="field"><span>Color</span><select class="select" data-pf="belt">${Object.keys(BELTS).map((b) => `<option ${b === p.belt ? 'selected' : ''}>${b}</option>`).join('')}</select></label>
        <label class="field"><span>Grados</span><select class="select" data-pf="stripes">${[0, 1, 2, 3, 4].map((n) => `<option value="${n}" ${n === p.stripes ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      </div>
    </div>
    <div class="card">
      <b>Récord</b>
      <div class="record mt">${[['w', 'Victorias'], ['l', 'Derrotas'], ['d', 'Empates']].map(([k, l]) => `<label><input class="input" style="text-align:center;font:700 1.375rem var(--font-round)" inputmode="numeric" data-rec="${k}" value="${p.record[k]}" aria-label="${l}"><small>${l}</small></label>`).join('')}</div>
      <label class="field mt"><span>Categoría de peso</span><input class="input" data-pf="weightClass" value="${esc(p.weightClass)}" placeholder="Ej. Ligero (−70,3 kg)"></label>
    </div>

    <h2 class="section-title">Estilo</h2>
    <div class="chips">${[...new Set([...STYLES, ...p.style])].map((s) => `<button class="chip ${p.style.includes(s) ? 'is-on' : ''}" data-act="style" data-s="${esc(s)}">${esc(s)}</button>`).join('')}<button class="chip" data-act="style-new">+ Otro</button></div>

    <h2 class="section-title">Plan de juego</h2>
    <div class="card form-stack">
      ${area('gameplan', 'Cómo quiero pelear', 'Ej. Presionar contra la jaula, cambiar de nivel tras el 1-2, buscar espalda…')}
      ${area('favorites', 'Mi juego A (técnicas favoritas)', 'Ej. Doble pierna, pase de rodilla, mataleón, triángulo…')}
      ${area('strengths', 'Fortalezas', '')}
      ${area('weaknesses', 'Debilidades a trabajar', '')}
    </div>

    <h2 class="section-title">Próxima competición</h2>
    <div class="card form-stack">
      <label class="field"><span>Evento</span><input class="input" data-ev="name" value="${esc(ev.name)}" placeholder="Ej. Open de Madrid No-Gi"></label>
      <div class="form-row">
        <label class="field"><span>Fecha</span><input class="input" type="date" data-ev="date" value="${esc(ev.date)}"></label>
        <label class="field"><span>Peso objetivo (kg)</span><input class="input" inputmode="decimal" data-ev="weight" value="${esc(ev.weight)}"></label>
      </div>
      <p class="small muted">Aparecerá una cuenta atrás en la semana y en Progreso comparada con tu último peso.</p>
    </div>
  </section>`;
}

// =====================================================================
// Técnicas
// =====================================================================
function techniques() {
  const list = state.mma.techniques.filter((t) => !techFilter || t.cat === techFilter).sort((a, b) => a.name.localeCompare(b.name));
  const used = [...new Set(state.mma.techniques.map((t) => t.cat))];
  return `<section class="view view--narrow">
    ${back('#/mma', 'MMA · BJJ')}
    ${viewHeader('Técnicas', `${state.mma.techniques.filter((t) => t.status === 'done').length} dominadas de ${state.mma.techniques.length}`, `<button class="btn btn--accent btn--sm" data-act="tech-add">${icon('plus')} Añadir</button>`)}
    ${used.length > 1 ? `<div class="chips" style="margin-bottom:.875rem"><button class="chip ${!techFilter ? 'is-on' : ''}" data-act="tech-filter" data-c="">Todas</button>${CATS.filter((c) => used.includes(c)).map((c) => `<button class="chip ${techFilter === c ? 'is-on' : ''}" data-act="tech-filter" data-c="${c}">${c}</button>`).join('')}</div>` : ''}
    ${list.length ? `<div class="list">${list.map((t) => `<button class="item" data-act="tech-edit" data-id="${t.id}">
      <span class="item__main"><span class="item__title">${esc(t.name)}</span><span class="item__meta"><span>${esc(t.cat)}</span>${t.notes ? `<span>${esc(t.notes.slice(0, 60))}${t.notes.length > 60 ? '…' : ''}</span>` : ''}</span></span>
      <span class="chip chip--sm ${STATUS[t.status][1]}">${STATUS[t.status][0]}</span></button>`).join('')}</div>`
    : emptyState('note', 'Tu biblioteca está vacía', 'Apunta cada técnica que aprendes con sus detalles clave para repasarla antes de clase.')}
  </section>`;
}

const PAGES = { '': home, perfil: profile, tecnicas: techniques };
export function render(sub = '') { return (PAGES[sub] || home)(); }

const refresh = (root, sub) => { const y = scrollY; root.innerHTML = render(sub); mount(root, sub); scrollTo(0, y); };

export function mount(root, sub) {
  if (sub === '' || !sub) {
    root.querySelector('[data-form="goal"]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = e.target.g.value.trim(); if (!v) return;
      const key = weekOf(weekOffset).key;
      update((s) => { (s.mma.weeks[key] ||= { goals: [], reflection: '' }).goals.push({ id: uid(), text: v, done: false }); });
      refresh(root, sub);
      root.querySelector('[data-form="goal"] input')?.focus();
    });
    const ta = root.querySelector('[data-reflect]');
    ta?.addEventListener('input', debounce(() => update((s) => { (s.mma.weeks[ta.dataset.reflect] ||= { goals: [], reflection: '' }).reflection = ta.value; }, { silent: true }), 300));
  }
  if (sub === 'perfil') {
    const view = root.firstElementChild;
    view.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.pf) update((s) => { s.mma.profile[t.dataset.pf] = t.dataset.pf === 'stripes' ? +t.value : t.value; }, { silent: true });
      if (t.dataset.rec) update((s) => { s.mma.profile.record[t.dataset.rec] = Math.max(0, parseInt(t.value, 10) || 0); }, { silent: true });
      if (t.dataset.ev) update((s) => { s.mma.event[t.dataset.ev] = t.value; }, { silent: true });
    });
    view.addEventListener('change', (e) => { if (['belt', 'stripes'].includes(e.target.dataset.pf)) refresh(root, sub); });
  }
}

// =====================================================================
// Hoja de sesión
// =====================================================================
async function sessionSheet(existing = null) {
  const last = state.mma.sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const s = existing || { date: dayKey(), type: last?.type || 'gi', min: last?.min || 90, rpe: 7, rounds: 0, worked: '', good: '', improve: '', notes: '' };
  const { value, data } = await sheet({
    title: existing ? 'Editar sesión' : 'Nueva sesión',
    body: `<div class="form-stack">
      <div class="chips" role="radiogroup" aria-label="Tipo">${Object.entries(TYPES).map(([k, [l, c]]) => `<label><input type="radio" name="type" value="${k}" ${k === s.type ? 'checked' : ''} class="sr-only"><span class="chip type-chip" style="--c:${c}">${l}</span></label>`).join('')}</div>
      <div class="form-row">
        <label class="field"><span>Fecha</span><input class="input" type="date" name="date" value="${s.date}" required></label>
        <label class="field"><span>Duración (min)</span><input class="input" name="min" inputmode="numeric" value="${s.min}" required></label>
      </div>
      <div class="field"><span>Intensidad (RPE)</span><div class="rpe">${Array.from({ length: 10 }, (_, i) => `<label><input type="radio" name="rpe" value="${i + 1}" ${i + 1 === s.rpe ? 'checked' : ''}><span>${i + 1}</span></label>`).join('')}</div></div>
      <label class="field"><span>Rondas de sparring</span><input class="input" name="rounds" inputmode="numeric" value="${s.rounds || ''}" placeholder="0"></label>
      <label class="field"><span>Qué trabajé</span><textarea class="textarea" name="worked" rows="2" placeholder="Técnicas, drills, posiciones…">${esc(s.worked)}</textarea></label>
      <label class="field"><span>Qué funcionó</span><textarea class="textarea" name="good" rows="2">${esc(s.good)}</textarea></label>
      <label class="field"><span>A mejorar</span><textarea class="textarea" name="improve" rows="2">${esc(s.improve)}</textarea></label>
      <label class="field"><span>Notas (lesiones, sensaciones…)</span><textarea class="textarea" name="notes" rows="2">${esc(s.notes)}</textarea></label>
    </div>`,
    actions: existing
      ? [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'accent' }]
      : [{ label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'accent' }],
  });
  if (value === 'delete') {
    if (await confirmSheet('¿Eliminar sesión?', '')) update((st) => { st.mma.sessions = st.mma.sessions.filter((x) => x.id !== existing.id); });
    return;
  }
  if (value !== 'ok') return;
  const vals = {
    date: data.date || dayKey(), type: data.type || 'gi', min: Math.max(1, parseInt(data.min, 10) || 60), rpe: +data.rpe || 7,
    rounds: Math.max(0, parseInt(data.rounds, 10) || 0), worked: data.worked.trim(), good: data.good.trim(), improve: data.improve.trim(), notes: data.notes.trim(),
  };
  if (existing) update((st) => Object.assign(st.mma.sessions.find((x) => x.id === existing.id), vals));
  else { update((st) => st.mma.sessions.push({ id: uid(), ...vals })); toast('Sesión guardada 🥋'); }
}

async function techSheet(existing = null) {
  const t = existing || { name: '', cat: techFilter || 'Sumisión', status: 'learn', notes: '' };
  const { value, data } = await sheet({
    title: existing ? 'Editar técnica' : 'Nueva técnica',
    body: `<div class="form-stack">
      <label class="field"><span>Nombre</span><input class="input" name="name" required maxlength="80" value="${esc(t.name)}" placeholder="Ej. Kimura desde guardia cerrada" ${existing ? '' : 'autofocus'}></label>
      <div class="form-row">
        <label class="field"><span>Categoría</span><select class="select" name="cat">${CATS.map((c) => `<option ${c === t.cat ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="field"><span>Estado</span><select class="select" name="status">${Object.entries(STATUS).map(([k, [l]]) => `<option value="${k}" ${k === t.status ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <label class="field"><span>Detalles clave</span><textarea class="textarea" name="notes" rows="5" placeholder="Agarres, ángulos, errores comunes, variantes…">${esc(t.notes)}</textarea></label>
    </div>`,
    actions: existing
      ? [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'accent' }]
      : undefined,
  });
  if (value === 'delete') { if (await confirmSheet('¿Eliminar técnica?', esc(t.name))) update((s) => { s.mma.techniques = s.mma.techniques.filter((x) => x.id !== existing.id); }); return; }
  if (value !== 'ok' || !data.name.trim()) return;
  const vals = { name: data.name.trim(), cat: data.cat, status: data.status, notes: data.notes.trim() };
  if (existing) update((s) => Object.assign(s.mma.techniques.find((x) => x.id === existing.id), vals));
  else update((s) => s.mma.techniques.push({ id: uid(), ...vals }));
}

// =====================================================================
// Acciones
// =====================================================================
const gid = (el) => el.closest('[data-g]').dataset.g;
const wkey = () => weekOf(weekOffset).key;

export const actions = {
  week(el, e, root, sub) { weekOffset = Math.min(0, weekOffset + +el.dataset.d); refresh(root, sub); },
  async add(el, e, root, sub) { await sessionSheet(); refresh(root, sub); },
  async edit(el, e, root, sub) { await sessionSheet(state.mma.sessions.find((x) => x.id === el.dataset.id)); refresh(root, sub); },
  'goal-toggle'(el, e, root, sub) { const id = gid(el); update((s) => { const g = s.mma.weeks[wkey()].goals.find((x) => x.id === id); g.done = !g.done; }); refresh(root, sub); },
  'goal-del'(el, e, root, sub) { const id = gid(el); update((s) => { const w = s.mma.weeks[wkey()]; w.goals = w.goals.filter((x) => x.id !== id); }); refresh(root, sub); },
  'goals-carry'(el, e, root, sub) {
    const prev = weekData(weekOf(-1).key).goals.filter((g) => !g.done);
    update((s) => { (s.mma.weeks[wkey()] ||= { goals: [], reflection: '' }).goals.push(...prev.map((g) => ({ id: uid(), text: g.text, done: false }))); });
    refresh(root, sub);
  },
  style(el, e, root, sub) {
    const v = el.dataset.s;
    update((s) => { const a = s.mma.profile.style; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); });
    el.classList.toggle('is-on');
  },
  async 'style-new'(el, e, root, sub) {
    const { value, data } = await sheet({ title: 'Añadir estilo', body: `<input class="input" name="s" required maxlength="30" autofocus>` });
    if (value === 'ok' && data.s.trim()) { update((s) => { if (!s.mma.profile.style.includes(data.s.trim())) s.mma.profile.style.push(data.s.trim()); }); refresh(root, sub); }
  },
  'tech-filter'(el, e, root, sub) { techFilter = el.dataset.c; refresh(root, sub); },
  async 'tech-add'(el, e, root, sub) { await techSheet(); refresh(root, sub); },
  async 'tech-edit'(el, e, root, sub) { await techSheet(state.mma.techniques.find((x) => x.id === el.dataset.id)); refresh(root, sub); },
};
