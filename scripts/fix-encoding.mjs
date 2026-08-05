/**
 * Repairs UTF-8 text that was read as Windows-1252 and re-written as UTF-8
 * (the classic PowerShell 5.1 Get-Content/Set-Content mangling: "—" → "â€”").
 *
 * Reverses it by mapping each character back to its CP1252 byte and decoding
 * the resulting buffer as UTF-8. Refuses to touch a file unless the repair
 * round-trips exactly, so a clean file can never be damaged by running this.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';

// CP1252 assigns printable characters to 0x80–0x9F, where latin1 has controls.
const HIGH = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

const toCp1252 = (str) => {
  const out = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp <= 0xff) out.push(cp);
    else if (HIGH[cp] != null) out.push(HIGH[cp]);
    else return null; // not representable — this text was never CP1252
  }
  return Buffer.from(out);
};

const fromCp1252 = (bytes) => {
  let out = '';
  const REV = Object.fromEntries(Object.entries(HIGH).map(([u, b]) => [b, Number(u)]));
  for (const b of bytes) {
    out += b >= 0x80 && b <= 0x9f && REV[b] ? String.fromCodePoint(REV[b]) : String.fromCharCode(b);
  }
  return out;
};

const files = globSync('src/**/*.{js,jsx,json,css}', { cwd: process.cwd() });
let fixed = 0;
let skipped = 0;

for (const file of files) {
  let text = readFileSync(file, 'utf8');
  const hadBom = text.charCodeAt(0) === 0xfeff;
  if (hadBom) text = text.slice(1);

  // Only files showing the tell-tale sequences are candidates.
  if (!/[ÃÂâ][-ÿ -⃿]/.test(text)) {
    if (hadBom) {
      writeFileSync(file, text, 'utf8');
      console.log(`BOM stripped  ${file}`);
      fixed += 1;
    }
    continue;
  }

  const bytes = toCp1252(text);
  if (!bytes) {
    console.log(`SKIP (not cp1252-mappable)  ${file}`);
    skipped += 1;
    continue;
  }

  const repaired = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

  // Round-trip guard: re-mangling the repair must reproduce what we read.
  const remangled = fromCp1252(Buffer.from(repaired, 'utf8'));
  if (remangled !== text) {
    console.log(`SKIP (round-trip mismatch)  ${file}`);
    skipped += 1;
    continue;
  }
  if (repaired.includes('�')) {
    console.log(`SKIP (invalid utf-8 result)  ${file}`);
    skipped += 1;
    continue;
  }

  writeFileSync(file, repaired, 'utf8');
  console.log(`repaired      ${file}`);
  fixed += 1;
}

console.log(`\n${fixed} file(s) written, ${skipped} skipped.`);
