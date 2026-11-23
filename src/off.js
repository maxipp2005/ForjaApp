// Open Food Facts: base de datos abierta de productos envasados (códigos de barras, marcas de supermercado).
// API pública sin clave. Se piden solo los campos necesarios.
import { round } from './utils.js';

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

export async function offByBarcode(code) {
  const j = await getJSON(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
  return j.status === 1 && j.product ? toFood({ ...j.product, code }) : null;
}

export async function offSearch(q) {
  const params = new URLSearchParams({ search_terms: q, search_simple: '1', action: 'process', json: '1', page_size: '30', fields: FIELDS });
  const j = await getJSON(`https://es.openfoodfacts.org/cgi/search.pl?${params}`, 15000);
  return (j.products || []).map(toFood).filter(Boolean);
}
