import { readFile, stat, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const html = await readFile('dist/index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
const assets = new Set([...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(m => m[1]));
for (const [, srcset] of html.matchAll(/srcset="([^"]+)"/g)) {
  for (const candidate of srcset.split(',')) assets.add(candidate.trim().split(/\s+/)[0]);
}
for (const file of assets) assert((await stat(`dist${file.split('?')[0]}`)).isFile(), `Missing ${file}`);
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), `Missing anchor ${id}`);
for (const key of ['horizon', 'valley', 'fields', 'home']) assert((await stat(`dist/assets/${key}.webp`)).size > 0);
async function bytes(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    total += entry.isDirectory() ? await bytes(path) : (await stat(path)).size;
  }
  return total;
}
const total = await bytes('dist');
// Browsers select one responsive alternative per photo, not the entire archive.
assert(total < 12_000_000, 'Responsive photography archive exceeds 12 MB');
for (const key of ['horizon', 'valley', 'fields', 'home']) {
  assert((await stat(`dist/assets/${key}-small.webp`)).size < 250_000, `Mobile ${key} exceeds 250 KB`);
  assert((await stat(`dist/assets/${key}-medium.webp`)).size < 900_000, `Desktop ${key} exceeds 900 KB`);
  assert((await stat(`dist/assets/${key}.webp`)).size < 3_000_000, `4K ${key} exceeds 3 MB`);
}
assert(!html.includes('<iframe'), 'Keep journey self-contained');
console.log(`Assets and navigation verified; total published files ${(total / 1_000_000).toFixed(2)} MB.`);
