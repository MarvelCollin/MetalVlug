import { C, Pix, R, rng, tone } from "../pix.mjs";
import { haze } from "./world.mjs";

const GRASS = ["#b8e07a", "#7fb04f", "#567f3a", "#36552d"];
const DIRT = ["#d9b583", "#a8805a", "#7a5840", "#4f3a2e"];
const CANVAS = ["#f3e6c4", "#cdb98e", "#9c8a66", "#6a5c48"];
const PINE = ["#7aa58a", "#5b8670", "#456a5a", "#2f4a45"];

const CAMP = [
  {
    sky: ["#d6f0ff", "#b3defa", "#8cc6ef", "#6aa9dc"],
    low: ["#fff4dc", "#f1f4e4", "#dceee8", "#c3e3ea"],
    sun: { x: 70, y: 52, r: 16, ramp: ["#fffef4", "#fff7d6", "#ffeeb0", "#ffe08a"] },
    cloud: ["#ffffff", "#f2f8fc", "#d9e9f3", "#bcd6e6"],
    hill: ["#a9cfb6", "#93bea3", "#7ea98f", "#6a947c"],
    pine: PINE,
    haze: ["#e4f2f4", 0.3],
    canvas: CANVAS,
    hut: ["#b8a990", "#9c8c74", "#7c6e5a", "#5c5244"],
    hutRoof: ["#7f9a6a", "#647e53", "#4b6040", "#36452f"],
    field: ["#a9cf7c", "#86b05e", "#668f49", "#4a6e3a"],
    glow: 0,
  },
  {
    sky: ["#2e2a55", "#4a3f72", "#8a5a82", "#d4837c"],
    low: ["#f0a070", "#f4bc84", "#f2cf98", "#e8d2a4"],
    sun: { x: 300, y: 150, r: 22, ramp: ["#fff2c4", "#ffd27a", "#f8a05a", "#e8704a"] },
    cloud: ["#d8889a", "#b46e8e", "#8a5a82", "#6a4a72"],
    hill: ["#6d5a7e", "#5e4e70", "#504363", "#433857"],
    pine: ["#4a4466", "#3d3a5a", "#322f4c", "#26243c"],
    haze: ["#a06a80", 0.22],
    canvas: ["#d8b48e", "#b08c6c", "#866a54", "#5c4a3e"],
    hut: ["#8a7468", "#6e5c54", "#544640", "#3c3230"],
    hutRoof: ["#5a6450", "#48503f", "#383e32", "#2a2e26"],
    field: ["#8a9a5c", "#6c7c48", "#54623a", "#3e4a2e"],
    glow: 1,
  },
  {
    sky: ["#eef4ee", "#e2ece4", "#d2e2d8", "#c0d6cc"],
    low: ["#f4f6ee", "#e8eee4", "#dce6dc", "#cedcd2"],
    sun: { x: 210, y: 64, r: 14, ramp: ["#ffffff", "#fcfaf0", "#f4f0de", "#e8e2cc"] },
    cloud: ["#ffffff", "#f4f8f4", "#e4ece6", "#d2dfd6"],
    hill: ["#b4c8bc", "#a6bcb0", "#98b0a4", "#8aa498"],
    pine: ["#8ea89c", "#7c988c", "#6c897e", "#5c7a70"],
    haze: ["#eef4ee", 0.45],
    canvas: CANVAS,
    hut: ["#b8a990", "#9c8c74", "#7c6e5a", "#5c5244"],
    hutRoof: ["#8a6a5a", "#6e5448", "#56423a", "#40322c"],
    field: ["#a9cf7c", "#86b05e", "#668f49", "#4a6e3a"],
    glow: 0,
  },
];

function band(p, y0, y1, ramp) {
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0);
    for (let x = 0; x < p.w; x++) p.px(x, y, tone(ramp, 1 - t, x, y));
  }
}

export function campBackground(kind, variant = 0) {
  const pal = CAMP[variant];
  const W = kind === "sky" ? 384 : 512;
  const p = new Pix(W, 216);
  const r = rng(kind.length * 53 + 11 + variant * 613);
  if (kind === "sky") {
    band(p, 0, 110, pal.sky);
    band(p, 110, 216, pal.low);
    p.blob(pal.sun.x, pal.sun.y, pal.sun.r, pal.sun.r, pal.sun.ramp, 0.5);
    for (let k = 0; k < 6; k++) {
      const cx = Math.floor(r() * W);
      const cy = 20 + Math.floor(r() * 70);
      for (let i = 0; i < 4; i++) p.blob(cx + i * 9, cy - (i % 2) * 3, 7 + r() * 4, 4 + r() * 2, pal.cloud, 0.3);
    }
    return p;
  }
  if (kind === "far") {
    for (let x = 0; x < W; x++) {
      const h = 40 + Math.round(Math.sin(x * 0.012) * 14 + Math.sin(x * 0.037 + 2) * 6);
      for (let y = 176 - h; y < 176; y++) p.px(x, y, tone(pal.hill, 0.8 - (y - 176 + h) / 90, x, y));
    }
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(r() * W);
      const h = 22 + Math.floor(r() * 22);
      const base = 176 - Math.round(Math.sin(x * 0.012) * 6);
      for (let j = 0; j < h; j++) {
        const w = Math.max(1, Math.round((j / h) * 7));
        p.rect(x - w, base - h + j, w * 2 + 1, 1, tone(pal.pine, 0.6 - j / (h * 2), x, j));
      }
      p.rect(x, base, 1, 4, pal.pine[3]);
    }
    const mill = 400 - variant * 130;
    p.box(mill, 98, 6, 78, ["#9fb6c4", "#8399a8", "#6a7e8d", "#526371"]);
    for (let k = 0; k < 4; k++) p.limb(mill + 3, 98, mill + 3 + Math.cos(k * 1.57 + 0.4 + variant) * 22, 98 + Math.sin(k * 1.57 + 0.4 + variant) * 22, 2, ["#e6eef2", "#c6d3da", "#a3b4bd", "#7f929c"]);
    return haze(p, pal.haze[0], pal.haze[1]);
  }
  let x = 6;
  while (x < W) {
    const kind2 = r();
    if (kind2 < 0.45) {
      const w = 56 + Math.floor(r() * 24);
      const top = 140;
      for (let j = 0; j < 36; j++) {
        const half = Math.round((j / 36) * (w / 2));
        for (let i = -half; i <= half; i++) p.px(x + w / 2 + i, top + j, tone(pal.canvas, 0.75 - (i + half) / (w * 1.4), i, j));
      }
      p.box(x + w / 2 - 6, 160, 12, 16, pal.glow ? ["#fff2c4", "#ffd27a", "#f8a05a", "#c86a3a"] : ["#6a5c48", "#4f4436", "#3a3128", "#2a231d"]);
      p.rect(x + w / 2, 132, 1, 9, R.wood[2]);
      x += w + 10;
    } else if (kind2 < 0.7) {
      p.box(x + 4, 96, 4, 80, R.wood);
      p.box(x + 28, 96, 4, 80, R.wood, -0.2);
      p.line(x + 6, 120, x + 30, 150, R.wood[2], 2);
      p.line(x + 30, 120, x + 6, 150, R.wood[2], 2);
      p.box(x, 86, 36, 12, R.wood);
      p.box(x - 2, 78, 40, 8, ["#c98f5a", "#9e6a44", "#734a33", "#4c3127"]);
      p.rect(x + 6, 88, 24, 4, "#3a2a26");
      x += 46;
    } else {
      p.box(x, 128, 70, 48, pal.hut);
      p.box(x - 4, 120, 78, 9, pal.hutRoof);
      for (let k = 0; k < 3; k++) p.box(x + 8 + k * 20, 140, 12, 10, ["#fff4c4", "#ffe08a", "#f4b860", "#c98a4c"]);
      p.box(x + 28, 154, 14, 22, ["#6a5c48", "#4f4436", "#3a3128", "#2a231d"]);
      x += 82;
    }
  }
  for (let fx = 30; fx < W; fx += 170) {
    p.rect(fx, 80, 2, 96, R.steel[2]);
    p.box(fx + 2, 82, 22, 12, R.teal);
    p.box(fx + 8, 85, 8, 6, R.scarf);
  }
  const field = pal.field;
  for (let y = 174; y < 216; y++) for (let x2 = 0; x2 < W; x2++) p.px(x2, y, tone(field, y < 176 ? 0.9 : 0.62 - (y - 176) / 100, x2, y));
  const r2 = rng(77);
  for (let k = 0; k < 90; k++) {
    const gx = Math.floor(r2() * W);
    const gy = 175 + Math.floor(r2() * 30);
    p.rect(gx, gy, 1, 2, field[0]);
    p.px(gx + 1, gy + 1, field[3]);
  }
  for (let x2 = 0; x2 < W; x2 += 22) {
    p.box(x2, 168, 2, 8, R.wood);
    p.rect(x2, 170, 22, 1, R.wood[2]);
  }
  return p;
}

export const campTiles = {
  grass: [(() => {
    const p = new Pix(16, 16);
    p.box(0, 3, 16, 13, DIRT, -0.2);
    p.box(0, 0, 16, 5, GRASS, 0.1);
    for (const gx of [1, 4, 6, 9, 12, 14]) p.px(gx, 0, GRASS[0]).px(gx, 5, GRASS[2]);
    p.rect(3, 9, 2, 1, DIRT[3]).rect(10, 12, 3, 1, DIRT[3]);
    p.px(7, 7, DIRT[0]);
    return { pix: p };
  })()],
  dirt: [(() => {
    const p = new Pix(16, 16);
    p.box(0, 0, 16, 16, DIRT, -0.4);
    p.rect(2, 4, 2, 1, DIRT[3]).rect(9, 9, 3, 1, DIRT[3]).rect(5, 13, 2, 1, DIRT[0]);
    return { pix: p };
  })()],
};
