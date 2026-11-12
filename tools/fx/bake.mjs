import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { encodePng } from "../sprites/png.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = (p) => pathToFileURL(join(root, "node_modules", "pixelfx", "src", p)).href;
const { createFrame, clearFrame, createFx, composite } = await import(lib("core/index.js"));

const FX = [
  { key: "fx_blast", id: "explosions/small-explosion", opts: { size: 0.85 }, fps: 18, cap: 2.0 },
  { key: "fx_blast_s", id: "explosions/small-explosion", opts: { size: 0.5, seed: 11 }, fps: 20, cap: 1.2 },
  { key: "fx_spark", id: "impacts/hit-spark", opts: { height: 0 }, fps: 30, cap: 0.45 },
  { key: "fx_wall", id: "impacts/bullet-impact", opts: { height: 0 }, fps: 24, cap: 0.6 },
  { key: "fx_thud", id: "impacts/blunt-hit", opts: { height: 0 }, fps: 24, cap: 0.55 },
];

const FADE = 0.35;
const W = 320;
const H = 260;
const OX = 160;
const OY = 200;

const out = join(root, "public", "assets");
mkdirSync(out, { recursive: true });

const sheets = [];
for (const spec of FX) {
  const mod = await import(lib(`fx/${spec.id}.js`));
  const fx = createFx(mod, { ...spec.opts, x: 0, y: 0 });
  const frame = createFrame(W, H, -OX, -OY);
  const duration = Math.min(spec.cap, mod.meta.duration ?? spec.cap);
  const count = Math.max(1, Math.round(duration * spec.fps));
  const frames = [];
  let uMinX = W, uMinY = H, uMaxX = -1, uMaxY = -1;
  for (let i = 0; i < count; i++) {
    if (i > 0) fx.update(1 / spec.fps);
    clearFrame(frame);
    fx.draw(frame);
    const rgba = composite(frame, new Uint8ClampedArray(W * H * 4), null);
    const t = i / spec.fps;
    const fade = Math.min(1, Math.max(0, (duration - t) / FADE));
    let minX = W, minY = H, maxX = -1, maxY = -1;
    for (let p = 3; p < rgba.length; p += 4) {
      rgba[p] = Math.round(rgba[p] * fade);
      if (rgba[p] < 24) rgba[p] = 0;
      if (!rgba[p]) continue;
      const k = (p - 3) / 4;
      const x = k % W;
      const y = (k - x) / W;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    if (maxX < 0) { minX = OX; minY = OY; maxX = OX; maxY = OY; }
    frames.push({ rgba, minX, minY, w: maxX - minX + 1, h: maxY - minY + 1 });
    uMinX = Math.min(uMinX, minX); uMinY = Math.min(uMinY, minY);
    uMaxX = Math.max(uMaxX, maxX); uMaxY = Math.max(uMaxY, maxY);
  }
  sheets.push({ spec, frames, count, uMinX, uMinY, uw: uMaxX - uMinX + 1, uh: uMaxY - uMinY + 1 });
}

const PAD = 1;
const SHEET_W = 2048;
const items = sheets.flatMap((s) => s.frames.map((f, i) => ({ s, f, i })));
items.sort((a, b) => b.f.h - a.f.h);
let x = PAD;
let y = PAD;
let row = 0;
for (const it of items) {
  if (x + it.f.w + PAD > SHEET_W) {
    x = PAD;
    y += row + PAD;
    row = 0;
  }
  it.x = x;
  it.y = y;
  x += it.f.w + PAD;
  row = Math.max(row, it.f.h);
}
const SHEET_H = 2 ** Math.ceil(Math.log2(y + row + PAD));
const atlas = new Uint8ClampedArray(SHEET_W * SHEET_H * 4);
const json = { frames: {}, meta: { image: "fx.png", size: { w: SHEET_W, h: SHEET_H }, scale: "1" } };
const meta = {};
for (const { s, f, i, x: px, y: py } of items) {
  for (let j = 0; j < f.h; j++) {
    const so = ((f.minY + j) * W + f.minX) * 4;
    atlas.set(f.rgba.subarray(so, so + f.w * 4), ((py + j) * SHEET_W + px) * 4);
  }
  json.frames[`${s.spec.key}_${i}`] = {
    frame: { x: px, y: py, w: f.w, h: f.h },
    rotated: false,
    trimmed: true,
    spriteSourceSize: { x: f.minX - s.uMinX, y: f.minY - s.uMinY, w: f.w, h: f.h },
    sourceSize: { w: s.uw, h: s.uh },
  };
}
for (const s of sheets)
  meta[s.spec.key] = { frames: s.count, fps: s.spec.fps, originX: (OX - s.uMinX) / s.uw, originY: (OY - s.uMinY) / s.uh, w: s.uw, h: s.uh };

writeFileSync(join(out, "fx.png"), encodePng(SHEET_W, SHEET_H, atlas));
writeFileSync(join(out, "fx.json"), JSON.stringify(json));
writeFileSync(join(out, "fx-meta.json"), JSON.stringify(meta, null, 1));
console.log(`fx sheet ${SHEET_W}x${SHEET_H}`, Object.entries(meta).map(([k, m]) => `${k}:${m.frames}f ${m.w}x${m.h}`).join("  "));
