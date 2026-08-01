import { access, readFile } from 'node:fs/promises';

let passed = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`  [PASS] ${message}`);
  passed++;
}

console.log('\nEarthborn Static Build Tests');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const worker = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const dialogs = JSON.parse(await readFile(new URL('../data/town/dialogs.json', import.meta.url), 'utf8'));
assert(html.includes('Earthborn of Ymir'), 'new product identity is visible');
assert(manifest.name === 'Earthborn of Ymir', 'installable app uses the new identity');
assert(worker.includes('earthborn-v1'), 'service worker cache is versioned for conversion');
assert(dialogs.dialogs && Object.keys(dialogs.dialogs).length > 0, 'Dverghiem dialogue data remains valid JSON');
for (const path of ['../docs/SOLOHIEM_AUDIT.md', '../data/readiness/dark_forest.json', '../shared/earthborn/ReadinessEngine.js']) {
  await access(new URL(path, import.meta.url));
}
assert(true, 'required audit, readiness data and rule engine exist');
console.log(`\n  Results: ${passed} passed, 0 failed`);
