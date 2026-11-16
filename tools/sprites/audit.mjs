import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function decode(file) {
  const buf = readFileSync(file);
  let off = 8;
  let w = 0;
  let h = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
    }
    if (type === "IDAT") idat.push(data);
    off += len + 12;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const px = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    if (raw[y * (w * 4 + 1)] !== 0) throw new Error(`${file}: unsupported PNG filter`);
    raw.copy(px, y * w * 4, y * (w * 4 + 1) + 1, (y + 1) * (w * 4 + 1));
  }
  return { w, h, px };
}

const BUDGET = [
  [/^(pip|juno|grunt|lobber|rusher|tinker)_/, 44],
  [/^(mule|warden)_/, 48],
  [/^(boom|boom_s|smoke|blast|flash|spark|dust)_/, 16],
  [/./, 24],
];

const img = decode(join(root, "public", "assets", "atlas.png"));
const atlas = JSON.parse(readFileSync(join(root, "public", "assets", "atlas.json"), "utf8")).frames;
const problems = [];
let checked = 0;
for (const [name, f] of Object.entries(atlas)) {
  const { x, y, w, h } = f.frame;
  const colors = new Set();
  let partial = 0;
  let orphans = 0;
  const at = (i, j) => (i < 0 || j < 0 || i >= w || j >= h ? 0 : img.px[((y + j) * img.w + x + i) * 4 + 3]);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const o = ((y + j) * img.w + x + i) * 4;
      const a = img.px[o + 3];
      if (!a) continue;
      if (a !== 255) partial++;
      colors.add((img.px[o] << 16) | (img.px[o + 1] << 8) | img.px[o + 2]);
      let n = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if ((di || dj) && at(i + di, j + dj)) n++;
      if (n === 0) orphans++;
    }
  const budget = BUDGET.find(([re]) => re.test(name))[1];
  const isFx = /^(smoke|dust)_/.test(name);
  if (partial && !isFx) problems.push(`${name}: ${partial} partially transparent pixels`);
  if (colors.size > budget) problems.push(`${name}: ${colors.size} colors (budget ${budget})`);
  if (orphans > 2 && !/^(spark|blast|debris|casing|bullet)/.test(name)) problems.push(`${name}: ${orphans} orphan pixels`);
  checked++;
}
console.log(`audited ${checked} frames, ${problems.length} problems`);
for (const p of problems) console.log("  " + p);
process.exitCode = problems.length ? 1 : 0;
