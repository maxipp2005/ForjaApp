// Cálculos de nutrición: metabolismo basal, gasto diario y reparto de macros.
import { round } from './utils.js';

export const ACTIVITY = [
  [1.2, 'Sedentario', 'Trabajo sentado, sin entrenar'],
  [1.375, 'Ligero', '1–3 entrenos por semana'],
  [1.55, 'Moderado', '3–5 entrenos por semana'],
  [1.725, 'Alto', '6–7 entrenos o doble sesión algunos días'],
  [1.9, 'Muy alto', 'Doble sesión casi a diario o trabajo físico'],
];

export const GOALS = {
  cut: { label: 'Perder grasa', hint: 'Déficit moderado conservando músculo' },
  maintain: { label: 'Mantener', hint: 'Rendir y recuperar' },
  bulk: { label: 'Ganar músculo', hint: 'Superávit ligero' },
};

/** Mifflin-St Jeor */
export function bmr({ sex, age, height, weight }) {
  return 10 * weight + 6.25 * height - 5 * age + (sex === 'f' ? -161 : 5);
}

/**
 * Objetivo diario. rate = kg por semana a perder/ganar.
 * 1 kg de tejido ≈ 7700 kcal → déficit diario = rate × 1100.
 */
export function computeTargets(p) {
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

export const kcalFromMacros = (p, c, f) => p * 4 + c * 4 + f * 9;
