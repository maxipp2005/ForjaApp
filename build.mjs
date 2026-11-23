// Empaqueta los módulos de src/ en un único script clásico (js/ciclo.js).
// Así Forja funciona tanto publicada (GitHub Pages) como abriendo index.html con doble clic.
// Uso: node build.mjs   (sin dependencias)
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const OUT = 'js/forja.js';
const ENTRY = 'app.js';

const order = [];
const seen = new Set();
const mods = new Map();

function load(rel) {
  const id = path.posix.normalize(rel);
  if (seen.has(id)) return;
  seen.add(id);
  const code = fs.readFileSync(path.join(SRC, id), 'utf8');
  const deps = [];
  const body = code.replace(/^import\s+(\*\s+as\s+(\w+)|\{([^}]*)\})\s+from\s+['"](.+?)['"];?\s*$/gm, (_, __, ns, names, spec) => {
    const dep = path.posix.join(path.posix.dirname(id), spec);
    deps.push(dep);
    return ns ? `const ${ns} = __m[${JSON.stringify(dep)}];` : `const {${names}} = __m[${JSON.stringify(dep)}];`;
  });
  const exported = [];
  const out = body.replace(/^export\s+(async\s+function|function|const|let|class)\s+([\w$]+)/gm, (_, kind, name) => {
    exported.push(name);
    return `${kind} ${name}`;
  });
  if (/^export\s/m.test(out)) throw new Error(`Forma de export no soportada en ${id}`);
  deps.forEach(load);
  order.push(id);
  mods.set(id, { out, exported });
}

load(ENTRY);
let bundle = `/* Forja — archivo generado por build.mjs a partir de src/. No lo edites a mano. */\n(() => {\n'use strict';\nconst __m = {};\n`;
for (const id of order) {
  const { out, exported } = mods.get(id);
  bundle += `\n// ===== ${id} =====\n__m[${JSON.stringify(id)}] = (() => {\n${out}\nreturn { ${exported.join(', ')} };\n})();\n`;
}
bundle += '})();\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, bundle);
console.log(`✓ ${OUT} (${order.length} módulos, ${(bundle.length / 1024).toFixed(1)} KB)`);
