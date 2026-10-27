// Kopiert die gemeinsamen Bausteine (Kopfbereich, Menü, Fußzeile) aus partials/
// in alle Seiten. In jeder Seite stehen Markierungen wie <!-- @header --> … <!-- /@header -->,
// alles dazwischen wird bei jedem Lauf ersetzt. Aufruf: npm run build
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const parts = ['head', 'header', 'footer'];
const partials = Object.fromEntries(
  parts.map((name) => [name, readFileSync(`partials/${name}.html`, 'utf8').trimEnd()])
);

for (const file of readdirSync('.').filter((f) => f.endsWith('.html'))) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  for (const name of parts) {
    const pattern = new RegExp(`(<!-- @${name} -->)[\\s\\S]*?(<!-- /@${name} -->)`);
    html = html.replace(pattern, (_, open, close) => `${open}\n${partials[name]}\n    ${close}`);
  }
  if (html !== before) {
    writeFileSync(file, html);
    console.log(`aktualisiert: ${file}`);
  }
}
