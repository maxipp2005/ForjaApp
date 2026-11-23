// Estado de Forja: persistencia local, migraciones, consultas y copias de seguridad.
import { dayKey, uid, sum } from './utils.js';
import { FOODS } from './foods.js';
import { EXERCISES } from './exercises.js';

const KEY = 'forja:v1';
const SCHEMA = 1;

const defaults = () => ({
  version: SCHEMA,
  settings: {
    theme: 'auto',
    meals: ['Desayuno', 'Comida', 'Merienda', 'Cena', 'Snacks'],
    waterGoal: 2500,
    glass: 250,
    restSec: 90,
    trainingBonus: 0,     // kcal extra en días con entreno registrado
    sound: true,
  },
  profile: { sex: 'm', age: 25, height: 175, weight: 75, activity: 1.55, goal: 'maintain', rate: 0.5, proteinPerKg: 2, fatPct: 25, weightGoal: null },
  targets: { kcal: 2400, p: 150, c: 280, f: 67 },
  log: {},                // 'YYYY-MM-DD' → { entries: [], water: 0 }
  foods: [],              // alimentos propios u Open Food Facts guardados
  recent: {},             // foodId → { n, g, at }
  savedMeals: [],         // [{ id, name, items: [entry sin id] }]
  weights: [],            // [{ date, kg, bf }]
  gym: { exercises: [], routines: [], sessions: [], active: null },
  mma: {
    sessions: [],
    weeks: {},            // '2026-W48' → { goals: [{ id, text, done }], reflection: '' }
    profile: { style: [], strengths: '', weaknesses: '', gameplan: '', favorites: '', belt: 'Blanco', stripes: 0, record: { w: 0, l: 0, d: 0 }, weightClass: '' },
    event: { name: '', date: '', weight: '' },
    techniques: [],
  },
  ui: { onboarded: false },
});

function deepMerge(base, data) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return data ?? base;
  const out = { ...base };
  for (const k of Object.keys(data || {})) {
    out[k] = (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]))
      ? deepMerge(base[k], data[k]) : data[k];
  }
  return out;
}
const migrate = (data) => ({ ...deepMerge(defaults(), data), version: SCHEMA });

function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? migrate(JSON.parse(raw)) : defaults(); }
  catch (e) { console.warn('[Forja] Estado ilegible, se usa uno nuevo.', e); return defaults(); }
}

export const state = load();
const listeners = new Set();
let saveTimer = null;

export function save(immediate = false) {
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('[Forja] No se pudo guardar', e); } };
  clearTimeout(saveTimer);
  if (immediate) write(); else saveTimer = setTimeout(write, 120);
}
export function update(fn, { silent = false } = {}) {
  fn(state);
  save();
  if (!silent) listeners.forEach((l) => l(state));
}
export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });

// ---------- Nutrición ----------
export const day = (key) => state.log[key] || { entries: [], water: 0 };
export function ensureDay(st, key) { return (st.log[key] ||= { entries: [], water: 0 }); }

export function totals(entries) {
  return { kcal: sum(entries, (e) => e.kcal), p: sum(entries, (e) => e.p), c: sum(entries, (e) => e.c), f: sum(entries, (e) => e.f) };
}

export const foodById = (id) => state.foods.find((f) => f.id === id) || FOODS.find((f) => f.id === id) || null;
export const allFoods = () => [...state.foods, ...FOODS];

/** Crea una entrada a partir de un alimento y gramos (guarda una copia de los valores). */
export function makeEntry(food, g, meal) {
  const k = g / 100;
  return { id: uid(), meal, foodId: food.id, name: food.name, brand: food.brand || '', g, kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k };
}

export function addEntries(key, entries) {
  update((st) => {
    const d = ensureDay(st, key);
    for (const e of entries) {
      d.entries.push(e);
      if (e.foodId) {
        const r = (st.recent[e.foodId] ||= { n: 0, g: e.g, at: 0 });
        r.n += 1; r.g = e.g; r.at = Date.now();
      }
    }
  });
}

/** ¿Hubo entreno (gimnasio o MMA) ese día? */
export const trainedOn = (key) => state.gym.sessions.some((s) => s.date === key && s.end) || state.mma.sessions.some((s) => s.date === key);

/** Objetivo calórico del día (con el extra de días de entreno si está configurado). */
export function targetFor(key) {
  const t = state.targets;
  const bonus = state.settings.trainingBonus && trainedOn(key) ? state.settings.trainingBonus : 0;
  return { ...t, kcal: t.kcal + bonus, bonus };
}

// ---------- Peso ----------
export const sortedWeights = () => [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
export const latestWeight = () => sortedWeights().at(-1) || null;

// ---------- Gimnasio ----------
export const exerciseById = (id) => state.gym.exercises.find((e) => e.id === id) || EXERCISES.find((e) => e.id === id) || null;
export const allExercises = () => [...state.gym.exercises, ...EXERCISES];
export const activeSession = () => state.gym.sessions.find((s) => s.id === state.gym.active) || null;

/** Series completadas de un ejercicio en sesiones terminadas, de la más reciente a la más antigua. */
export function exerciseHistory(exId, { excludeId } = {}) {
  return state.gym.sessions
    .filter((s) => s.end && s.id !== excludeId)
    .sort((a, b) => b.start - a.start)
    .map((s) => ({ session: s, item: s.items.find((i) => i.exId === exId) }))
    .filter((x) => x.item && x.item.sets.some((st) => st.done));
}

export const e1rm = (kg, reps) => (reps > 0 && kg > 0 ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0);

/** Mejor marca de un ejercicio: peso máximo, 1RM estimado, reps o tiempo máximos. */
export function bests(exId, { excludeId } = {}) {
  const b = { kg: 0, e1rm: 0, reps: 0, sec: 0 };
  for (const { item } of exerciseHistory(exId, { excludeId })) {
    for (const s of item.sets) {
      if (!s.done) continue;
      b.kg = Math.max(b.kg, +s.kg || 0);
      b.e1rm = Math.max(b.e1rm, e1rm(+s.kg || 0, +s.reps || 0));
      b.reps = Math.max(b.reps, +s.reps || 0);
      b.sec = Math.max(b.sec, +s.sec || 0);
    }
  }
  return b;
}

export const sessionVolume = (s) => sum(s.items, (i) => sum(i.sets.filter((x) => x.done), (x) => (+x.kg || 0) * (+x.reps || 0)));

// ---------- Copias de seguridad ----------
export function exportData() {
  return JSON.stringify({ app: 'Forja', exportedAt: new Date().toISOString(), ...state }, null, 2);
}
export function importData(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !('settings' in data) || !('log' in data)) throw new Error('El archivo no parece una copia de Forja.');
  const next = migrate(data);
  delete next.app; delete next.exportedAt;
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, next);
  save(true);
  listeners.forEach((l) => l(state));
}
export function resetAll() {
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, defaults());
  save(true);
  listeners.forEach((l) => l(state));
}
export const todayKey = () => dayKey();
