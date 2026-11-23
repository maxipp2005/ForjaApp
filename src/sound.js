// Avisos sonoros sintetizados (sin archivos): fin del descanso.
import { state } from './store.js';

let ctx = null;
function ac() {
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
/** iOS solo permite audio tras un gesto del usuario. */
export function unlockAudio() {
  const c = ac(); if (!c) return;
  const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0);
}
export function beep() {
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
