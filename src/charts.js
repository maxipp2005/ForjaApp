// Gráficas SVG ligeras (sin librerías).
import { esc, num } from './utils.js';

/**
 * Línea con área. points: [{ x: número (p. ej. timestamp), y, label }]
 * opts: { goal, smooth: [{x,y}] (línea de tendencia), height, unit }
 */
export function lineChart(points, { goal = null, trend = null, height = 180, unit = '', decimals = 1 } = {}) {
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
export function barChart(items, { target = null, height = 150, fmt = (v) => num(v) } = {}) {
  const max = Math.max(1, target || 0, ...items.map((i) => i.value)) * 1.12;
  return `<div class="bars" style="height:${height}px">
    ${target ? `<div class="bars__target" style="bottom:calc(${(target / max) * 100}% * (1 - 26 / ${height}) + 26px)"><span>${fmt(target)}</span></div>` : ''}
    ${items.map((i) => `<div class="bars__col" title="${esc(i.title || '')}">
      <div class="bars__track"><div class="bars__bar ${i.highlight ? 'is-hl' : ''} ${target && i.value > target * 1.05 ? 'is-over' : ''}" style="height:${(i.value / max) * 100}%;${i.color ? `background:${i.color}` : ''}"></div></div>
      <div class="bars__lbl">${esc(i.label)}</div></div>`).join('')}
  </div>`;
}

/** Anillo de progreso (SVG). value/max; color CSS. */
export function ring(value, max, { size = 168, stroke = 12, color = 'var(--accent)', over = 'var(--danger)' } = {}) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const p = max > 0 ? value / max : 0;
  const shown = Math.min(1, p);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line-strong)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p > 1.02 ? over : color}" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - shown)}" transform="rotate(-90 ${size / 2} ${size / 2})" class="ring__arc"/>
  </svg>`;
}
