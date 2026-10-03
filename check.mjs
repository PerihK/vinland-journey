import { readFile, stat, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const html = await readFile('dist/index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
const assets = new Set([...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(m => m[1]));
for (const file of assets) assert((await stat(`dist${file}`)).isFile(), `Missing ${file}`);
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), `Missing anchor ${id}`);
for (const key of ['shore', 'fields', 'home']) assert((await stat(`dist/assets/${key}.webp`)).size > 0);
async function bytes(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    total += entry.isDirectory() ? await bytes(path) : (await stat(path)).size;
  }
  return total;
}
const total = await bytes('dist');
assert(total < 4_000_000, 'Static site exceeds 4 MB budget');
assert(!html.includes('<iframe'), 'Keep journey self-contained');
console.log(`Assets and navigation verified; total published files ${(total / 1_000_000).toFixed(2)} MB.`);
