/* Forja — archivo generado por build.mjs a partir de src/. No lo edites a mano. */
(() => {
'use strict';
const __m = {};

// ===== utils.js =====
__m["utils.js"] = (() => {
// Utilidades compartidas: DOM, formato numérico, fechas e iconos.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const round = (n, d = 0) => { const k = 10 ** d; return Math.round((+n || 0) * k) / k; };
const sum = (arr, fn = (x) => x) => arr.reduce((a, x) => a + (+fn(x) || 0), 0);

/** Número en formato español: 1.234,5 */
const num = (n, d = 0) => (+n || 0).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: 0 });
/** Lee números escritos con coma o punto */
const parseNum = (s) => { const n = parseFloat(String(s ?? '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
/** Normaliza texto para buscar sin tildes ni mayúsculas */
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ---------- Fechas (hora local) ----------
const pad2 = (n) => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDay = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const shiftDay = (key, n) => dayKey(addDays(parseDay(key), n));
const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);

/** Lunes de la semana de `d` */
const weekStart = (d = new Date()) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
/** Clave ISO de semana: 2026-W48 */
function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${pad2(w)}`;
}

const WD = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const WDS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const WDL = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const MO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const weekday = (d) => WD[d.getDay()];
const weekdayShort = (d) => WDS[d.getDay()];
const weekdayLetter = (d) => WDL[d.getDay()];
const monthShort = (d) => MO[d.getMonth()].slice(0, 3);
const monthName = (d) => MO[d.getMonth()];
const fmtDate = (d) => `${weekdayShort(d)} ${d.getDate()} ${monthShort(d)}`;
const fmtDateLong = (d) => `${weekday(d)}, ${d.getDate()} de ${monthName(d)}`;
const fmtTime = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const fmtDuration = (min) => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`; };
const fmtClock = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${pad2(sec % 60)}`; };

function dayLabel(key) {
  const n = daysBetween(new Date(), parseDay(key));
  if (n === 0) return 'Hoy';
  if (n === -1) return 'Ayer';
  if (n === 1) return 'Mañana';
  return fmtDate(parseDay(key));
}

function relDays(n) {
  if (n === 0) return 'Hoy';
  if (n === 1) return 'Mañana';
  if (n === -1) return 'Ayer';
  if (n < 0) return `Hace ${-n} días`;
  if (n < 14) return `En ${n} días`;
  return n < 60 ? `En ${Math.round(n / 7)} semanas` : `En ${Math.round(n / 30)} meses`;
}

const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : many}`;

function debounce(fn, ms = 300) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const haptic = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };

// ---------- Iconos (trazo, 24px) ----------
const P = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  chevU: '<path d="M6 15l6-6 6 6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  barcode: '<path d="M4 6v12M7 6v12M10.5 6v12M13 6v12M16.5 6v12M20 6v12"/>',
  bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z"/>',
  food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.2 0-4 2.5-4 6v4h4"/>',
  dumbbell: '<path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12"/>',
  glove: '<path d="M7 20h9v-3l2.5-3V8.5A3.5 3.5 0 0 0 15 5h-4.5A3.5 3.5 0 0 0 7 8.5V20zM7 12h7.5a2 2 0 0 0 0-4H11"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  drop: '<path d="M12 3.5s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/>',
  scale: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.5 9a5 5 0 0 1 7 0l-2.5 3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4.5v1.5A3.5 3.5 0 0 0 8 11M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11M12 13v4M8.5 20h7M10 17h4v3h-4z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
  flame: '<path d="M12 3s5 4.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 1.5-4s.5 2.5 2.5 2.5C11 9 12 3 12 3z"/>',
  note: '<path d="M6 3h9l5 5v13H6zM15 3v5h5M9 13h7M9 17h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z"/>',
  bookmark: '<path d="M6 3.5h12v17l-6-4-6 4v-17z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 13.5l5-5 5 5M5 4h14"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  dots: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
  belt: '<path d="M3 10h18v4H3zM10 10l-2 9M14 10l2 9M10 10h4v4h-4z"/>',
  swords: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5L13 3h3v3l-3.5 3.5M5 14l-2 2 4 4 2-2"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4.5h-4.5"/>',
};
const icon = (name, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${P[name] || ''}</svg>`;

return { $, $$, esc, uid, clamp, round, sum, num, parseNum, norm, dayKey, parseDay, startOfDay, addDays, shiftDay, daysBetween, weekStart, weekKey, weekday, weekdayShort, weekdayLetter, monthShort, monthName, fmtDate, fmtDateLong, fmtTime, fmtDuration, fmtClock, dayLabel, relDays, plural, debounce, download, isIOS, isStandalone, haptic, icon };
})();

// ===== foods.js =====
__m["foods.js"] = (() => {
// Base de alimentos incluida (funciona sin conexión).
// Valores medios aproximados por 100 g (o 100 ml), basados en tablas de composición (BEDCA/USDA)
// y etiquetado europeo (hidratos sin fibra). Para un producto concreto, mejor usar su etiqueta,
// el buscador de Open Food Facts o crear un alimento propio.
// Formato: [id, nombre, kcal, proteína, hidratos, grasa, porción, gramos de la porción]

const RAW = [
  // Carnes, pescados y huevos
  ['pollo', 'Pechuga de pollo (cruda)', 110, 23, 0, 1.5, 'filete', 150],
  ['pollo-pl', 'Pechuga de pollo a la plancha', 165, 31, 0, 3.6, 'filete', 120],
  ['muslo', 'Muslo de pollo sin piel (crudo)', 121, 20, 0, 4.5, 'muslo', 110],
  ['pavo-f', 'Fiambre de pechuga de pavo', 100, 18, 2, 2, 'loncha', 15],
  ['pavo', 'Pechuga de pavo (cruda)', 105, 24, 0, 1, 'filete', 150],
  ['ternera', 'Ternera magra (cruda)', 125, 21, 0, 4.5, 'filete', 150],
  ['picada', 'Carne picada de vacuno 15 % (cruda)', 215, 18.6, 0, 15, 'ración', 125],
  ['lomo', 'Lomo de cerdo (crudo)', 143, 21, 0, 6.3, 'filete', 120],
  ['serrano', 'Jamón serrano', 241, 31, 0, 13, 'loncha', 15],
  ['york', 'Jamón cocido', 110, 18, 1.5, 3.5, 'loncha', 20],
  ['chorizo', 'Chorizo', 455, 24, 2, 38, 'ración', 30],
  ['salmon', 'Salmón (crudo)', 208, 20, 0, 13, 'filete', 150],
  ['atun-n', 'Atún al natural (escurrido)', 116, 26, 0, 1, 'lata', 56],
  ['atun-a', 'Atún en aceite (escurrido)', 198, 29, 0, 8, 'lata', 56],
  ['merluza', 'Merluza (cruda)', 76, 16, 0, 1.3, 'filete', 150],
  ['bacalao', 'Bacalao fresco (crudo)', 80, 18, 0, 0.7, 'filete', 150],
  ['gambas', 'Gambas / langostinos (crudos)', 85, 20, 0, 0.5, 'ración', 100],
  ['sardinas', 'Sardinas en aceite (escurridas)', 208, 25, 0, 11, 'lata', 60],
  ['huevo', 'Huevo', 143, 12.6, 0.7, 9.5, 'huevo L', 60],
  ['clara', 'Clara de huevo', 52, 11, 0.7, 0.2, 'clara', 33],
  ['tortilla-f', 'Tortilla francesa', 155, 11, 0.8, 12, '2 huevos', 120],
  ['tofu', 'Tofu firme', 144, 15, 2.5, 8.7, 'ración', 100],
  ['whey', 'Proteína whey (polvo)', 380, 78, 7, 6, 'cacito', 30],
  ['hamburguesa', 'Hamburguesa de vacuno (cruda)', 230, 17, 1, 17, 'unidad', 125],

  // Lácteos
  ['leche-e', 'Leche entera', 64, 3.2, 4.7, 3.6, 'vaso', 250],
  ['leche-s', 'Leche semidesnatada', 46, 3.3, 4.8, 1.6, 'vaso', 250],
  ['leche-d', 'Leche desnatada', 35, 3.4, 5, 0.1, 'vaso', 250],
  ['avena-b', 'Bebida de avena', 46, 1, 7.5, 1.5, 'vaso', 250],
  ['soja-b', 'Bebida de soja', 38, 3.3, 2.5, 1.8, 'vaso', 250],
  ['yogur', 'Yogur natural', 61, 3.5, 4.7, 3.3, 'yogur', 125],
  ['griego', 'Yogur griego natural', 130, 3.8, 4, 11, 'yogur', 125],
  ['skyr', 'Skyr / yogur proteico natural', 63, 11, 4, 0.2, 'tarrina', 150],
  ['batido', 'Queso fresco batido 0 %', 46, 8, 3.5, 0.1, 'tarrina', 250],
  ['burgos', 'Queso fresco tipo Burgos', 174, 12, 3, 13, 'ración', 60],
  ['curado', 'Queso curado', 400, 26, 0.5, 33, 'ración', 30],
  ['mozzarella', 'Mozzarella fresca', 250, 18, 2, 19, 'bola', 125],
  ['lonchas', 'Queso en lonchas', 340, 23, 1, 27, 'loncha', 20],
  ['mantequilla', 'Mantequilla', 740, 0.6, 0.6, 82, 'porción', 10],

  // Cereales, tubérculos y pan
  ['arroz', 'Arroz blanco (crudo)', 355, 7, 79, 0.6, 'ración', 80],
  ['arroz-c', 'Arroz blanco (cocido)', 130, 2.7, 28, 0.3, 'plato', 200],
  ['arroz-i', 'Arroz integral (crudo)', 350, 7.5, 74, 2.7, 'ración', 80],
  ['pasta', 'Pasta (cruda)', 355, 12.5, 71, 1.5, 'ración', 80],
  ['pasta-c', 'Pasta (cocida)', 158, 5.8, 31, 0.9, 'plato', 200],
  ['pan', 'Pan blanco (barra)', 260, 9, 51, 1.6, 'trozo', 50],
  ['pan-i', 'Pan integral', 247, 12.5, 41, 3.5, 'rebanada', 40],
  ['pan-m', 'Pan de molde', 265, 8.5, 48, 4, 'rebanada', 25],
  ['avena', 'Copos de avena', 372, 13.5, 59, 7, 'ración', 40],
  ['patata', 'Patata (cruda)', 80, 2, 17, 0.1, 'mediana', 200],
  ['boniato', 'Boniato (crudo)', 86, 1.6, 17, 0.1, 'mediano', 200],
  ['cereales', 'Cereales tipo corn flakes', 378, 7, 84, 0.9, 'bol', 30],
  ['tortitas', 'Tortitas de arroz', 387, 8, 81, 2.8, 'tortita', 8],
  ['quinoa', 'Quinoa (cruda)', 368, 14, 64, 6, 'ración', 70],
  ['cuscus', 'Cuscús (crudo)', 376, 12.8, 72, 0.6, 'ración', 70],
  ['wrap', 'Tortilla de trigo (wrap)', 300, 8, 50, 7, 'unidad', 60],
  ['galletas', 'Galletas tipo María', 440, 7, 72, 13, 'galleta', 6],
  ['croissant', 'Croissant', 406, 8, 46, 21, 'unidad', 60],

  // Legumbres
  ['lentejas', 'Lentejas (cocidas)', 116, 9, 16, 0.4, 'plato', 200],
  ['garbanzos', 'Garbanzos (cocidos)', 140, 8, 18, 2.6, 'plato', 200],
  ['alubias', 'Alubias (cocidas)', 100, 7, 13, 0.5, 'plato', 200],
  ['hummus', 'Hummus', 170, 7.5, 11, 10, 'cucharada', 30],

  // Frutas
  ['platano', 'Plátano', 89, 1.1, 20, 0.3, 'mediano', 120],
  ['manzana', 'Manzana', 52, 0.3, 12, 0.2, 'mediana', 180],
  ['naranja', 'Naranja', 47, 0.9, 9.5, 0.1, 'mediana', 200],
  ['fresas', 'Fresas', 32, 0.7, 6, 0.3, 'bol', 150],
  ['arandanos', 'Arándanos', 57, 0.7, 12, 0.3, 'puñado', 80],
  ['uvas', 'Uvas', 69, 0.7, 16, 0.2, 'racimo', 150],
  ['pera', 'Pera', 57, 0.4, 12, 0.1, 'mediana', 180],
  ['kiwi', 'Kiwi', 61, 1.1, 12, 0.5, 'unidad', 75],
  ['sandia', 'Sandía', 30, 0.6, 7.5, 0.2, 'tajada', 300],
  ['melon', 'Melón', 34, 0.8, 8, 0.2, 'tajada', 250],
  ['pina', 'Piña', 50, 0.5, 12, 0.1, 'rodaja', 100],
  ['mango', 'Mango', 60, 0.8, 14, 0.4, 'unidad', 200],
  ['aguacate', 'Aguacate', 160, 2, 1.9, 14.7, 'medio', 75],
  ['datiles', 'Dátiles', 282, 2.5, 67, 0.4, 'dátil', 8],

  // Verduras
  ['brocoli', 'Brócoli', 34, 2.8, 4, 0.4, 'ración', 150],
  ['espinacas', 'Espinacas', 23, 2.9, 1.4, 0.4, 'ración', 100],
  ['lechuga', 'Lechuga', 15, 1.4, 2, 0.2, 'ración', 80],
  ['ensalada', 'Ensalada de hojas (bolsa)', 17, 1.3, 2, 0.2, 'ración', 80],
  ['tomate', 'Tomate', 18, 0.9, 3, 0.2, 'mediano', 120],
  ['pepino', 'Pepino', 15, 0.7, 3, 0.1, 'medio', 150],
  ['zanahoria', 'Zanahoria', 41, 0.9, 7, 0.2, 'mediana', 80],
  ['cebolla', 'Cebolla', 40, 1.1, 8, 0.1, 'media', 75],
  ['pimiento', 'Pimiento rojo', 31, 1, 5, 0.3, 'medio', 80],
  ['calabacin', 'Calabacín', 17, 1.2, 2.2, 0.3, 'medio', 150],
  ['champinon', 'Champiñones', 22, 3.1, 0.5, 0.3, 'ración', 100],
  ['judias', 'Judías verdes', 31, 1.8, 4.3, 0.2, 'ración', 150],

  // Grasas y frutos secos
  ['aceite', 'Aceite de oliva', 884, 0, 0, 100, 'cucharada', 10],
  ['almendras', 'Almendras', 579, 21, 8, 50, 'puñado', 30],
  ['nueces', 'Nueces', 654, 15, 7, 65, 'puñado', 30],
  ['cacahuetes', 'Cacahuetes', 567, 26, 8, 49, 'puñado', 30],
  ['crema-c', 'Crema de cacahuete', 588, 25, 14, 50, 'cucharada', 15],
  ['choco', 'Chocolate negro 85 %', 598, 9, 19, 50, 'onza', 10],
  ['mayonesa', 'Mayonesa', 680, 1, 1, 75, 'cucharada', 15],
  ['ketchup', 'Kétchup', 112, 1.2, 26, 0.1, 'cucharada', 15],
  ['miel', 'Miel', 304, 0.3, 82, 0, 'cucharada', 15],
  ['azucar', 'Azúcar', 400, 0, 100, 0, 'sobre', 8],
  ['mermelada', 'Mermelada', 250, 0.4, 60, 0.1, 'cucharada', 15],

  // Bebidas
  ['cafe-l', 'Café con leche', 35, 2.3, 3.4, 1.2, 'taza', 200],
  ['cafe', 'Café solo', 2, 0.1, 0, 0, 'taza', 50],
  ['zumo', 'Zumo de naranja', 45, 0.7, 10, 0.2, 'vaso', 200],
  ['cola', 'Refresco de cola', 42, 0, 10.6, 0, 'lata', 330],
  ['zero', 'Refresco zero', 1, 0, 0, 0, 'lata', 330],
  ['isotonica', 'Bebida isotónica', 24, 0, 6, 0, 'botella', 500],
  ['cerveza', 'Cerveza', 43, 0.5, 3.6, 0, 'tercio', 330],
  ['cerveza-0', 'Cerveza sin alcohol', 22, 0.4, 4.5, 0, 'tercio', 330],
  ['vino', 'Vino tinto', 85, 0.1, 2.6, 0, 'copa', 150],

  // Platos y otros
  ['tortilla-p', 'Tortilla de patatas', 180, 6.5, 13, 11.5, 'pincho', 120],
  ['paella', 'Paella mixta', 150, 8, 18, 5, 'plato', 350],
  ['lentejas-e', 'Lentejas estofadas con chorizo', 140, 7.5, 13, 6, 'plato', 350],
  ['croquetas', 'Croquetas', 220, 7, 20, 13, 'croqueta', 30],
  ['gazpacho', 'Gazpacho', 40, 0.8, 4, 2.5, 'vaso', 250],
  ['pizza', 'Pizza', 266, 11, 33, 10, 'porción', 100],
  ['burger', 'Hamburguesa completa (con pan)', 250, 13, 25, 11, 'unidad', 200],
  ['sushi', 'Sushi (maki / nigiri)', 150, 5, 28, 1.5, 'pieza', 30],
  ['patatas-b', 'Patatas fritas de bolsa', 536, 6.6, 50, 34, 'bolsa', 40],
  ['patatas-f', 'Patatas fritas (ración)', 312, 3.4, 41, 15, 'ración', 150],
  ['helado', 'Helado', 207, 3.5, 24, 11, 'bola', 70],
  ['barrita-p', 'Barrita de proteínas', 360, 30, 35, 12, 'barrita', 60],
  ['barrita-c', 'Barrita de cereales', 400, 6, 70, 10, 'barrita', 25],
];

const FOODS = RAW.map(([id, name, kcal, p, c, f, unit, unitG]) => ({ id: 'db:' + id, name, kcal, p, c, f, unit, unitG, source: 'db' }));

return { FOODS };
})();

// ===== exercises.js =====
__m["exercises.js"] = (() => {
// Biblioteca de ejercicios. kind: 'w' = peso × reps, 'bw' = peso corporal (reps + lastre opcional), 't' = tiempo.
const RAW = [
  ['Pecho', 'w', ['Press banca', 'Press banca inclinado', 'Press con mancuernas', 'Press inclinado con mancuernas', 'Aperturas con mancuernas', 'Cruce de poleas', 'Press en máquina']],
  ['Pecho', 'bw', ['Fondos', 'Flexiones']],
  ['Espalda', 'bw', ['Dominadas', 'Dominadas supinas']],
  ['Espalda', 'w', ['Jalón al pecho', 'Remo con barra', 'Remo con mancuerna', 'Remo en polea baja', 'Peso muerto', 'Pullover en polea', 'Face pull']],
  ['Pierna', 'w', ['Sentadilla', 'Sentadilla frontal', 'Prensa', 'Zancadas', 'Sentadilla búlgara', 'Peso muerto rumano', 'Hip thrust', 'Extensión de cuádriceps', 'Curl femoral', 'Gemelos de pie']],
  ['Hombro', 'w', ['Press militar', 'Press de hombros con mancuernas', 'Elevaciones laterales', 'Pájaros', 'Encogimientos']],
  ['Brazos', 'w', ['Curl con barra', 'Curl con mancuernas', 'Curl martillo', 'Press francés', 'Extensión de tríceps en polea']],
  ['Core', 'bw', ['Rueda abdominal', 'Elevaciones de piernas', 'Russian twist', 'Crunch']],
  ['Core', 't', ['Plancha', 'Plancha lateral', 'Hollow hold']],
  ['Core', 'w', ['Pallof press']],
  ['Potencia y MMA', 'w', ['Kettlebell swing', 'Cargada (clean)', 'Thruster', 'Lanzamiento de balón medicinal', 'Paseo del granjero', 'Turkish get-up', 'Landmine press']],
  ['Potencia y MMA', 'bw', ['Saltos al cajón', 'Burpees', 'Sprawls']],
  ['Potencia y MMA', 't', ['Comba', 'Battle ropes', 'Empuje de trineo', 'Sombra (shadow boxing)', 'Bicicleta de asalto', 'Remo ergómetro']],
];

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const EXERCISES = RAW.flatMap(([group, kind, names]) => names.map((name) => ({ id: 'x:' + slug(name), name, group, kind })));
const GROUPS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazos', 'Core', 'Potencia y MMA', 'Otros'];
const KINDS = { w: 'Peso × repeticiones', bw: 'Peso corporal', t: 'Tiempo' };

return { EXERCISES, GROUPS, KINDS };
})();

// ===== store.js =====
__m["store.js"] = (() => {
// Estado de Forja: persistencia local, migraciones, consultas y copias de seguridad.
const { dayKey, uid, sum } = __m["utils.js"];
const { FOODS } = __m["foods.js"];
const { EXERCISES } = __m["exercises.js"];
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

const state = load();
const listeners = new Set();
let saveTimer = null;

function save(immediate = false) {
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('[Forja] No se pudo guardar', e); } };
  clearTimeout(saveTimer);
  if (immediate) write(); else saveTimer = setTimeout(write, 120);
}
function update(fn, { silent = false } = {}) {
  fn(state);
  save();
  if (!silent) listeners.forEach((l) => l(state));
}
const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });

// ---------- Nutrición ----------
const day = (key) => state.log[key] || { entries: [], water: 0 };
function ensureDay(st, key) { return (st.log[key] ||= { entries: [], water: 0 }); }

function totals(entries) {
  return { kcal: sum(entries, (e) => e.kcal), p: sum(entries, (e) => e.p), c: sum(entries, (e) => e.c), f: sum(entries, (e) => e.f) };
}

const foodById = (id) => state.foods.find((f) => f.id === id) || FOODS.find((f) => f.id === id) || null;
const allFoods = () => [...state.foods, ...FOODS];

/** Crea una entrada a partir de un alimento y gramos (guarda una copia de los valores). */
function makeEntry(food, g, meal) {
  const k = g / 100;
  return { id: uid(), meal, foodId: food.id, name: food.name, brand: food.brand || '', g, kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k };
}

function addEntries(key, entries) {
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
const trainedOn = (key) => state.gym.sessions.some((s) => s.date === key && s.end) || state.mma.sessions.some((s) => s.date === key);

/** Objetivo calórico del día (con el extra de días de entreno si está configurado). */
function targetFor(key) {
  const t = state.targets;
  const bonus = state.settings.trainingBonus && trainedOn(key) ? state.settings.trainingBonus : 0;
  return { ...t, kcal: t.kcal + bonus, bonus };
}

// ---------- Peso ----------
const sortedWeights = () => [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
const latestWeight = () => sortedWeights().at(-1) || null;

// ---------- Gimnasio ----------
const exerciseById = (id) => state.gym.exercises.find((e) => e.id === id) || EXERCISES.find((e) => e.id === id) || null;
const allExercises = () => [...state.gym.exercises, ...EXERCISES];
const activeSession = () => state.gym.sessions.find((s) => s.id === state.gym.active) || null;

/** Series completadas de un ejercicio en sesiones terminadas, de la más reciente a la más antigua. */
function exerciseHistory(exId, { excludeId } = {}) {
  return state.gym.sessions
    .filter((s) => s.end && s.id !== excludeId)
    .sort((a, b) => b.start - a.start)
    .map((s) => ({ session: s, item: s.items.find((i) => i.exId === exId) }))
    .filter((x) => x.item && x.item.sets.some((st) => st.done));
}

const e1rm = (kg, reps) => (reps > 0 && kg > 0 ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0);

/** Mejor marca de un ejercicio: peso máximo, 1RM estimado, reps o tiempo máximos. */
function bests(exId, { excludeId } = {}) {
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

const sessionVolume = (s) => sum(s.items, (i) => sum(i.sets.filter((x) => x.done), (x) => (+x.kg || 0) * (+x.reps || 0)));

// ---------- Copias de seguridad ----------
function exportData() {
  return JSON.stringify({ app: 'Forja', exportedAt: new Date().toISOString(), ...state }, null, 2);
}
function importData(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !('settings' in data) || !('log' in data)) throw new Error('El archivo no parece una copia de Forja.');
  const next = migrate(data);
  delete next.app; delete next.exportedAt;
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, next);
  save(true);
  listeners.forEach((l) => l(state));
}
function resetAll() {
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, defaults());
  save(true);
  listeners.forEach((l) => l(state));
}
const todayKey = () => dayKey();

return { state, save, update, subscribe, day, ensureDay, totals, foodById, allFoods, makeEntry, addEntries, trainedOn, targetFor, sortedWeights, latestWeight, exerciseById, allExercises, activeSession, exerciseHistory, e1rm, bests, sessionVolume, exportData, importData, resetAll, todayKey };
})();

// ===== router.js =====
__m["router.js"] = (() => {
// Enrutado por hash (#/vista/sub/id): funciona en GitHub Pages y abriendo el archivo directamente.
const parse = () => {
  const [view = 'hoy', sub = '', id = ''] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  return { view: view || 'hoy', sub, id };
};
const go = (...parts) => { location.hash = '#/' + parts.filter(Boolean).map(encodeURIComponent).join('/'); };

return { parse, go };
})();

// ===== ui.js =====
__m["ui.js"] = (() => {
// Componentes de interfaz reutilizables: avisos, hojas modales y selectores.
const { $, esc, icon } = __m["utils.js"];
// ---------- Avisos (toasts) ----------
function toast(msg, { action, onAction, timeout = 3800 } = {}) {
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
function sheet({ title, text = '', body = '', actions, onOpen } = {}) {
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

async function confirmSheet(title, text, { ok = 'Eliminar', kind = 'danger' } = {}) {
  const { value } = await sheet({ title, text, actions: [{ label: 'Cancelar', value: 'cancel' }, { label: ok, value: 'ok', kind }] });
  return value === 'ok';
}

/** Lista de opciones a elegir. options: [{ value, label, color?, hint? }] */
async function pickSheet(title, options, current, { footer = '' } = {}) {
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
const toggle = (key, on, label) =>
  `<label class="switch"><input type="checkbox" data-setting="${key}" ${on ? 'checked' : ''} aria-label="${esc(label || key)}"><span></span></label>`;

const viewHeader = (title, sub = '', end = '') =>
  `<header class="vh"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${end}</header>`;

const emptyState = (ic, title, text, action = '') =>
  `<div class="empty">${icon(ic)}<b>${esc(title)}</b><p>${text}</p>${action}</div>`;

const back = (href, label) => `<a class="back" href="${href}">${icon('chevL')} ${esc(label)}</a>`;

/** Barra de progreso fina */
const bar = (value, max, color = 'var(--accent)') =>
  `<span class="bar"><i style="width:${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%;background:${color}"></i></span>`;

return { toast, sheet, confirmSheet, pickSheet, toggle, viewHeader, emptyState, back, bar };
})();

// ===== sound.js =====
__m["sound.js"] = (() => {
// Avisos sonoros sintetizados (sin archivos): fin del descanso.
const { state } = __m["store.js"];
let ctx = null;
function ac() {
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
/** iOS solo permite audio tras un gesto del usuario. */
function unlockAudio() {
  const c = ac(); if (!c) return;
  const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0);
}
function beep() {
  if (!state.settings.sound) return;
  const c = ac(); if (!c) return;
  const t = c.currentTime + 0.02;
  [0, 0.18, 0.36].forEach((d, i) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = i === 2 ? 1046.5 : 880;
    g.gain.setValueAtTime(0.0001, t + d);
    g.gain.exponentialRampToValueAtTime(0.25, t + d + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + (i === 2 ? 0.6 : 0.15));
    o.connect(g).connect(c.destination); o.start(t + d); o.stop(t + d + 0.7);
  });
}

return { unlockAudio, beep };
})();

// ===== charts.js =====
__m["charts.js"] = (() => {
// Gráficas SVG ligeras (sin librerías).
const { esc, num } = __m["utils.js"];
/**
 * Línea con área. points: [{ x: número (p. ej. timestamp), y, label }]
 * opts: { goal, smooth: [{x,y}] (línea de tendencia), height, unit }
 */
function lineChart(points, { goal = null, trend = null, height = 180, unit = '', decimals = 1 } = {}) {
  if (points.length < 2) return '';
  const W = 600, H = height, PL = 8, PR = 44, PT = 14, PB = 22;
  const xs = points.map((p) => p.x);
  const ys = [...points.map((p) => p.y), ...(trend || []).map((p) => p.y), ...(goal != null ? [goal] : [])];
  let min = Math.min(...ys), max = Math.max(...ys);
  const pad = Math.max((max - min) * 0.15, 0.5);
  min -= pad; max += pad;
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const X = (x) => PL + ((x - x0) / (x1 - x0 || 1)) * (W - PL - PR);
  const Y = (y) => PT + (1 - (y - min) / (max - min || 1)) * (H - PT - PB);
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  const line = path(points);
  const area = `${line} L${X(x1).toFixed(1)} ${H - PB} L${X(x0).toFixed(1)} ${H - PB} Z`;
  const ticks = [max - pad, (max + min) / 2, min + pad].map((v) => `<text x="${W - PR + 8}" y="${Y(v) + 4}" class="ch-tick">${num(v, decimals)}</text><line x1="${PL}" x2="${W - PR}" y1="${Y(v)}" y2="${Y(v)}" class="ch-grid"/>`).join('');
  const last = points.at(-1);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Gráfica">
    <defs><linearGradient id="chA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${ticks}
    ${goal != null ? `<line x1="${PL}" x2="${W - PR}" y1="${Y(goal)}" y2="${Y(goal)}" class="ch-goal"/><text x="${PL + 4}" y="${Y(goal) - 6}" class="ch-tick">Objetivo ${num(goal, decimals)}${unit}</text>` : ''}
    <path d="${area}" fill="url(#chA)"/>
    ${trend ? `<path d="${path(trend)}" class="ch-trend"/>` : ''}
    <path d="${line}" class="ch-line"/>
    <circle cx="${X(last.x)}" cy="${Y(last.y)}" r="5" class="ch-dot"/>
  </svg>`;
}

/**
 * Barras verticales con línea de objetivo opcional.
 * items: [{ value, label, highlight, color, title }]
 */
function barChart(items, { target = null, height = 150, fmt = (v) => num(v) } = {}) {
  const max = Math.max(1, target || 0, ...items.map((i) => i.value)) * 1.12;
  return `<div class="bars" style="height:${height}px">
    ${target ? `<div class="bars__target" style="bottom:calc(${(target / max) * 100}% * (1 - 26 / ${height}) + 26px)"><span>${fmt(target)}</span></div>` : ''}
    ${items.map((i) => `<div class="bars__col" title="${esc(i.title || '')}">
      <div class="bars__track"><div class="bars__bar ${i.highlight ? 'is-hl' : ''} ${target && i.value > target * 1.05 ? 'is-over' : ''}" style="height:${(i.value / max) * 100}%;${i.color ? `background:${i.color}` : ''}"></div></div>
      <div class="bars__lbl">${esc(i.label)}</div></div>`).join('')}
  </div>`;
}

/** Anillo de progreso (SVG). value/max; color CSS. */
function ring(value, max, { size = 168, stroke = 12, color = 'var(--accent)', over = 'var(--danger)' } = {}) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const p = max > 0 ? value / max : 0;
  const shown = Math.min(1, p);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line-strong)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p > 1.02 ? over : color}" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - shown)}" transform="rotate(-90 ${size / 2} ${size / 2})" class="ring__arc"/>
  </svg>`;
}

return { lineChart, barChart, ring };
})();

// ===== off.js =====
__m["off.js"] = (() => {
// Open Food Facts: base de datos abierta de productos envasados (códigos de barras, marcas de supermercado).
// API pública sin clave. Se piden solo los campos necesarios.
const { round } = __m["utils.js"];
const FIELDS = 'code,product_name,product_name_es,generic_name_es,brands,nutriments,serving_quantity';

function toFood(p) {
  const n = p.nutriments || {};
  let kcal = n['energy-kcal_100g'];
  if (kcal == null && n.energy_100g != null) kcal = n.energy_100g / 4.184;
  const name = (p.product_name_es || p.product_name || p.generic_name_es || '').trim();
  if (kcal == null || !name) return null;
  const sq = parseFloat(p.serving_quantity);
  return {
    id: 'off:' + p.code,
    code: p.code,
    name,
    brand: (p.brands || '').split(',')[0].trim(),
    kcal: round(kcal, 1),
    p: round(n.proteins_100g || 0, 1),
    c: round(n.carbohydrates_100g || 0, 1),
    f: round(n.fat_100g || 0, 1),
    unit: sq > 0 ? 'porción' : '',
    unitG: sq > 0 ? round(sq, 1) : 0,
    source: 'off',
  };
}

async function getJSON(url, timeout = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function offByBarcode(code) {
  const j = await getJSON(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
  return j.status === 1 && j.product ? toFood({ ...j.product, code }) : null;
}

async function offSearch(q) {
  const params = new URLSearchParams({ search_terms: q, search_simple: '1', action: 'process', json: '1', page_size: '30', fields: FIELDS });
  const j = await getJSON(`https://es.openfoodfacts.org/cgi/search.pl?${params}`, 15000);
  return (j.products || []).map(toFood).filter(Boolean);
}

return { offByBarcode, offSearch };
})();

// ===== views/today.js =====
__m["views/today.js"] = (() => {
// Nutrición: resumen del día, comidas, agua y peso. Incluye el buscador rápido de alimentos.
const { $, $$, esc, icon, uid, num, round, parseNum, norm, dayKey, shiftDay, parseDay, fmtDateLong, dayLabel, haptic, debounce, sum } = __m["utils.js"];
const { state, update, day, ensureDay, totals, targetFor, makeEntry, addEntries, allFoods, foodById, latestWeight } = __m["store.js"];
const { sheet, confirmSheet, toast, pickSheet, emptyState, bar } = __m["ui.js"];
const { ring } = __m["charts.js"];
const { offByBarcode, offSearch } = __m["off.js"];
let cur = dayKey();
let lastSeenToday = dayKey();

const mealNames = () => state.settings.meals;
const visibleMeals = (entries) => mealNames().map((n, i) => ({ i, name: n || '' })).filter((m) => m.name || entries.some((e) => e.meal === m.i));
const macroLine = (e) => `P ${num(e.p)} · H ${num(e.c)} · G ${num(e.f)}`;

// =====================================================================
// Vista
// =====================================================================
function render() {
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

function openPicker(meal, root) {
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
const pickerOpen = () => !!pk;
const closePickerIfOpen = () => { if (pk) { closePicker(); return true; } return false; };

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

async function foodEditor(base = {}) {
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
const actions = {
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

async function weightSheet(key) {
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

function unmount() { if (pk) { $('#picker')?.remove(); document.body.style.overflow = ''; pk = null; } }

return { render, openPicker, pickerOpen, closePickerIfOpen, foodEditor, actions, weightSheet, unmount };
})();

// ===== views/gym.js =====
__m["views/gym.js"] = (() => {
// Gimnasio: entreno en curso, rutinas, historial, récords y temporizador de descanso.
const { $, $$, esc, icon, uid, num, round, parseNum, norm, dayKey, parseDay, fmtDate, fmtDuration, fmtClock, dayLabel, haptic, sum } = __m["utils.js"];
const { state, update, exerciseById, allExercises, activeSession, exerciseHistory, bests, e1rm, sessionVolume } = __m["store.js"];
const { sheet, confirmSheet, toast, pickSheet, viewHeader, emptyState, back } = __m["ui.js"];
const { GROUPS, KINDS } = __m["exercises.js"];
const { lineChart } = __m["charts.js"];
const { go } = __m["router.js"];
const { beep } = __m["sound.js"];
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
function render(sub = '', id = '') { return (PAGES[sub] || home)(id); }

// =====================================================================
// Montaje: edición en vivo de series y temporizadores
// =====================================================================
let tick = null;
function mount(root, sub) {
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
function unmount() { clearInterval(tick); }

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

const actions = {
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

return { render, mount, unmount, actions };
})();

// ===== views/mma.js =====
__m["views/mma.js"] = (() => {
// MMA / BJJ: semana con objetivos y reflexión, sesiones, perfil de luchador, técnicas y próxima competición.
const { $, esc, icon, uid, num, parseNum, dayKey, parseDay, addDays, weekStart, weekKey, fmtDate, fmtDuration, daysBetween, relDays, dayLabel, sum, debounce } = __m["utils.js"];
const { state, update, latestWeight } = __m["store.js"];
const { sheet, confirmSheet, toast, viewHeader, emptyState, back } = __m["ui.js"];
const { barChart } = __m["charts.js"];
const TYPES = {
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
function render(sub = '') { return (PAGES[sub] || home)(); }

const refresh = (root, sub) => { const y = scrollY; root.innerHTML = render(sub); mount(root, sub); scrollTo(0, y); };

function mount(root, sub) {
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

const actions = {
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

return { TYPES, render, mount, actions };
})();

// ===== views/progress.js =====
__m["views/progress.js"] = (() => {
// Progreso: peso, adherencia a las calorías, macros y resumen de entrenos.
const { esc, icon, num, round, dayKey, parseDay, addDays, startOfDay, shiftDay, weekdayLetter, dayLabel, fmtDate, sum } = __m["utils.js"];
const { state, day, totals, targetFor, sortedWeights, latestWeight, sessionVolume } = __m["store.js"];
const { viewHeader, emptyState } = __m["ui.js"];
const { lineChart, barChart } = __m["charts.js"];
const { weightSheet } = __m["views/today.js"];
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

function render() {
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
const actions = {
  range(el, e, root) { range = +el.dataset.r; refresh(root); },
  async weight(el, e, root) { await weightSheet(dayKey()); refresh(root); },
};

return { render, actions };
})();

// ===== nutrition.js =====
__m["nutrition.js"] = (() => {
// Cálculos de nutrición: metabolismo basal, gasto diario y reparto de macros.
const { round } = __m["utils.js"];
const ACTIVITY = [
  [1.2, 'Sedentario', 'Trabajo sentado, sin entrenar'],
  [1.375, 'Ligero', '1–3 entrenos por semana'],
  [1.55, 'Moderado', '3–5 entrenos por semana'],
  [1.725, 'Alto', '6–7 entrenos o doble sesión algunos días'],
  [1.9, 'Muy alto', 'Doble sesión casi a diario o trabajo físico'],
];

const GOALS = {
  cut: { label: 'Perder grasa', hint: 'Déficit moderado conservando músculo' },
  maintain: { label: 'Mantener', hint: 'Rendir y recuperar' },
  bulk: { label: 'Ganar músculo', hint: 'Superávit ligero' },
};

/** Mifflin-St Jeor */
function bmr({ sex, age, height, weight }) {
  return 10 * weight + 6.25 * height - 5 * age + (sex === 'f' ? -161 : 5);
}

/**
 * Objetivo diario. rate = kg por semana a perder/ganar.
 * 1 kg de tejido ≈ 7700 kcal → déficit diario = rate × 1100.
 */
function computeTargets(p) {
  const tdee = bmr(p) * p.activity;
  let kcal = tdee;
  if (p.goal === 'cut') kcal = tdee - Math.min(p.rate * 1100, tdee * 0.25);
  if (p.goal === 'bulk') kcal = tdee + Math.min(p.rate * 1100, 500);
  kcal = Math.max(kcal, p.sex === 'f' ? 1200 : 1500);
  const prot = p.proteinPerKg * p.weight;
  const fat = (kcal * p.fatPct) / 100 / 9;
  const carbs = Math.max(0, (kcal - prot * 4 - fat * 9) / 4);
  return { tdee: round(tdee), bmr: round(bmr(p)), kcal: round(kcal / 10) * 10, p: round(prot), c: round(carbs), f: round(fat) };
}

const kcalFromMacros = (p, c, f) => p * 4 + c * 4 + f * 9;

return { ACTIVITY, GOALS, bmr, computeTargets, kcalFromMacros };
})();

// ===== views/settings.js =====
__m["views/settings.js"] = (() => {
// Ajustes: objetivos (calculadora), comidas, agua, gimnasio, alimentos propios, apariencia, datos e instalación.
const { $, esc, icon, num, round, parseNum, download, dayKey, isIOS, isStandalone } = __m["utils.js"];
const { state, update, exportData, importData, resetAll, latestWeight } = __m["store.js"];
const { sheet, confirmSheet, toast, toggle, viewHeader, back, emptyState } = __m["ui.js"];
const { ACTIVITY, GOALS, computeTargets, kcalFromMacros } = __m["nutrition.js"];
const { foodEditor } = __m["views/today.js"];
const { go } = __m["router.js"];
const APP_VERSION = '1.0.0';

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
function render(sub = '') { if (sub !== 'objetivos') draft = null; return (PAGES[sub] || home)(); }

const rerender = (root, sub) => { const y = scrollY; root.innerHTML = render(sub); mount(root, sub); scrollTo(0, y); };

function mount(root, sub) {
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

function applyTheme() {
  const v = state.settings.theme;
  if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
  const dark = v === 'dark' || (v === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = dark ? '#0B0B0D' : '#F4F4F1'; });
}

const actions = {
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

return { APP_VERSION, render, mount, applyTheme, actions };
})();

// ===== app.js =====
__m["app.js"] = (() => {
// Punto de entrada: rutas, delegación de eventos, atajos y Service Worker.
const { $, $$ } = __m["utils.js"];
const { state, activeSession } = __m["store.js"];
const { parse, go } = __m["router.js"];
const { toast } = __m["ui.js"];
const { unlockAudio } = __m["sound.js"];
const today = __m["views/today.js"];
const gym = __m["views/gym.js"];
const mma = __m["views/mma.js"];
const progress = __m["views/progress.js"];
const settings = __m["views/settings.js"];
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

return {  };
})();
})();
