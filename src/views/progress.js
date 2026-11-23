// Progreso: peso, adherencia a las calorías, macros y resumen de entrenos.
import { esc, icon, num, round, dayKey, parseDay, addDays, startOfDay, shiftDay, weekdayLetter, dayLabel, fmtDate, sum } from '../utils.js';
import { state, day, totals, targetFor, sortedWeights, latestWeight, sessionVolume } from '../store.js';
import { viewHeader, emptyState } from '../ui.js';
import { lineChart, barChart } from '../charts.js';
import { weightSheet } from './today.js';

let range = 7;

function weightCard() {
  const ws = sortedWeights();
  const last = latestWeight();
  const goal = state.profile.weightGoal;
  if (!ws.length) return `<div class="card">${emptyState('scale', 'Sin registros de peso', 'Pésate 3–7 veces por semana, por la mañana y en ayunas: la media semanal es lo que importa.', `<button class="btn btn--accent" data-act="weight">${icon('plus')} Registrar peso</button>`)}</div>`;
  const since = (days) => { const ref = ws.filter((w) => w.date <= shiftDay(last.date, -days)).at(-1); return ref ? last.kg - ref.kg : null; };
  const d7 = since(7), d30 = since(30);
  const from = shiftDay(dayKey(), -90);
  const pts = ws.filter((w) => w.date >= from).map((w) => ({ x: parseDay(w.date).getTime(), y: w.kg }));
  // Media móvil de 7 días (suaviza la retención de líquidos)
  const trend = pts.map((p) => { const win = pts.filter((q) => q.x <= p.x && q.x > p.x - 7 * 86400000); return { x: p.x, y: sum(win, (q) => q.y) / win.length }; });
  const delta = (v) => v == null ? '–' : `<span class="${v < 0 ? 'down' : 'up'}" style="color:inherit">${v > 0 ? '+' : ''}${num(v, 1)}</span>`;
  const ev = state.mma.event;
  return `<div class="card">
    <div class="spread"><div><div class="small muted">Peso actual</div><div class="stat__v" style="font-size:2rem">${num(last.kg, 1)}<small>kg</small></div></div>
      <button class="btn btn--sm" data-act="weight">${icon('plus')} Peso</button></div>
    <div class="grid grid-3 mt">
      <div><div class="small muted">7 días</div><b class="num">${delta(d7)}</b></div>
      <div><div class="small muted">30 días</div><b class="num">${delta(d30)}</b></div>
      <div><div class="small muted">${goal ? 'Al objetivo' : ev.weight ? 'Al peso de combate' : 'Media 7 días'}</div><b class="num">${goal ? `${num(Math.abs(last.kg - goal), 1)} kg` : ev.weight ? `${num(last.kg - parseFloat(String(ev.weight).replace(',', '.')), 1)} kg` : `${num(trend.at(-1)?.y || last.kg, 1)} kg`}</b></div>
    </div>
    ${pts.length > 1 ? `<div class="mt">${lineChart(pts, { goal: goal || null, trend: pts.length > 3 ? trend : null, unit: ' kg' })}</div><p class="small muted">Línea discontinua: media de 7 días. ${goal ? '' : 'Define un peso objetivo en Ajustes → Objetivos.'}</p>` : ''}
  </div>`;
}

function nutritionCard() {
  const days = Array.from({ length: range }, (_, i) => shiftDay(dayKey(), i - range + 1));
  const rows = days.map((k) => { const t = totals(day(k).entries); return { k, t, target: targetFor(k).kcal, logged: day(k).entries.length > 0 }; });
  const logged = rows.filter((r) => r.logged && r.k !== dayKey());
  const loggedAll = rows.filter((r) => r.logged);
  const avg = (f) => (loggedAll.length ? sum(loggedAll, f) / loggedAll.length : 0);
  const within = logged.filter((r) => Math.abs(r.t.kcal - r.target) <= r.target * 0.1).length;
  const avgK = avg((r) => r.t.kcal), avgP = avg((r) => r.t.p), avgC = avg((r) => r.t.c), avgF = avg((r) => r.t.f);
  const mk = avgP * 4 + avgC * 4 + avgF * 9 || 1;
  // Racha de días registrando (hasta ayer, o hoy si ya hay algo)
  let streak = 0; let k = day(dayKey()).entries.length ? dayKey() : shiftDay(dayKey(), -1);
  while (day(k).entries.length) { streak++; k = shiftDay(k, -1); }
  const items = rows.map((r) => ({ value: r.t.kcal, label: range <= 7 ? weekdayLetter(parseDay(r.k)) : (parseDay(r.k).getDate() % 5 === 0 ? String(parseDay(r.k).getDate()) : ''), highlight: r.k === dayKey(), title: `${dayLabel(r.k)}: ${num(r.t.kcal)} kcal` }));
  return `
    <div class="grid grid-2">
      <div class="stat"><div class="stat__k">Media diaria</div><div class="stat__v">${num(avgK)}<small>kcal</small></div><div class="stat__d muted">Objetivo ${num(state.targets.kcal)}</div></div>
      <div class="stat"><div class="stat__k">Días en objetivo (±10 %)</div><div class="stat__v">${within}<small>/ ${logged.length}</small></div><div class="stat__d muted">Racha registrando: ${streak} ${streak === 1 ? 'día' : 'días'}</div></div>
    </div>
    <div class="card mt">
      <div class="spread"><b>Calorías</b><span class="small muted">Línea: objetivo</span></div>
      ${barChart(items, { target: state.targets.kcal, height: 160 })}
    </div>
    <div class="card mt">
      <div class="spread"><b>Macros medios</b><span class="small muted">${loggedAll.length} días registrados</span></div>
      <div style="display:flex;height:.625rem;border-radius:9px;overflow:hidden;margin:.875rem 0 .75rem;background:var(--surface-2)">
        <i style="width:${(avgP * 4 / mk) * 100}%;background:var(--prot)"></i><i style="width:${(avgC * 4 / mk) * 100}%;background:var(--carb)"></i><i style="width:${(avgF * 9 / mk) * 100}%;background:var(--fat)"></i></div>
      <div class="grid grid-3">
        ${[['Proteína', avgP, state.targets.p, 'var(--prot)'], ['Hidratos', avgC, state.targets.c, 'var(--carb)'], ['Grasa', avgF, state.targets.f, 'var(--fat)']].map(([l, v, t, c]) => `<div><div class="small" style="color:${c};font-weight:700">${l}</div><b class="num">${num(v)} g</b><div class="small muted">obj. ${num(t)} g</div></div>`).join('')}
      </div>
      ${avgP && state.profile.weight ? `<p class="small muted mt">Proteína media: ${num(avgP / state.profile.weight, 1)} g por kg de peso corporal.</p>` : ''}
    </div>`;
}

function trainingCard() {
  const since = Date.now() - 30 * 86400000;
  const sinceKey = shiftDay(dayKey(), -29);
  const gym = state.gym.sessions.filter((s) => s.end && s.start >= since);
  const mma = state.mma.sessions.filter((s) => s.date >= sinceKey);
  const prs = sum(gym, (s) => sum(s.items, (i) => i.sets.filter((x) => x.pr).length));
  const hours = (sum(gym, (s) => (s.end - s.start) / 60000) + sum(mma, (s) => s.min)) / 60;
  return `<div class="grid grid-2">
    <div class="stat"><div class="stat__k">Gimnasio</div><div class="stat__v">${gym.length}<small>entrenos</small></div><div class="stat__d muted">${num(sum(gym, sessionVolume) / 1000, 1)} t de volumen</div></div>
    <div class="stat"><div class="stat__k">MMA · BJJ</div><div class="stat__v">${mma.length}<small>sesiones</small></div><div class="stat__d muted">${sum(mma, (s) => s.rounds)} rondas de sparring</div></div>
    <div class="stat"><div class="stat__k">Horas entrenando</div><div class="stat__v">${num(hours, 1)}<small>h</small></div></div>
    <div class="stat"><div class="stat__k">Récords nuevos</div><div class="stat__v">${prs}<small>🏆</small></div></div>
  </div>`;
}

export function render() {
  return `<section class="view">
    ${viewHeader('Progreso')}
    <div class="duo">
      <div>${weightCard()}</div>
      <div>
        <div class="spread" style="margin-bottom:.625rem"><b>Nutrición</b><div class="seg">${[7, 14, 30].map((r) => `<button data-act="range" data-r="${r}" class="${range === r ? 'is-on' : ''}">${r} días</button>`).join('')}</div></div>
        ${nutritionCard()}
      </div>
    </div>
    <h2 class="section-title">Entrenamiento · 30 días</h2>
    ${trainingCard()}
  </section>`;
}

const refresh = (root) => { const y = scrollY; root.innerHTML = render(); scrollTo(0, y); };
export const actions = {
  range(el, e, root) { range = +el.dataset.r; refresh(root); },
  async weight(el, e, root) { await weightSheet(dayKey()); refresh(root); },
};
