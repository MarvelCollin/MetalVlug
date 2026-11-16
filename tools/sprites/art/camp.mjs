import { C, Pix, R, rng, tone } from "../pix.mjs";

const GRASS = ["#b8e07a", "#7fb04f", "#567f3a", "#36552d"];
const DIRT = ["#d9b583", "#a8805a", "#7a5840", "#4f3a2e"];
const CANVAS = ["#f3e6c4", "#cdb98e", "#9c8a66", "#6a5c48"];
const PINE = ["#7aa58a", "#5b8670", "#456a5a", "#2f4a45"];

function band(p, y0, y1, ramp) {
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0);
    for (let x = 0; x < p.w; x++) p.px(x, y, tone(ramp, 1 - t, x, y));
  }
}

export function campBackground(kind) {
  const W = kind === "sky" ? 384 : 512;
  const p = new Pix(W, 216);
  const r = rng(kind.length * 53 + 11);
  if (kind === "sky") {
    band(p, 0, 110, ["#d6f0ff", "#b3defa", "#8cc6ef", "#6aa9dc"]);
    band(p, 110, 216, ["#fff4dc", "#f1f4e4", "#dceee8", "#c3e3ea"]);
    p.blob(70, 52, 16, 16, ["#fffef4", "#fff7d6", "#ffeeb0", "#ffe08a"], 0.5);
    for (let k = 0; k < 6; k++) {
      const cx = Math.floor(r() * W);
      const cy = 20 + Math.floor(r() * 70);
      for (let i = 0; i < 4; i++) p.blob(cx + i * 9, cy - (i % 2) * 3, 7 + r() * 4, 4 + r() * 2, ["#ffffff", "#f2f8fc", "#d9e9f3", "#bcd6e6"], 0.3);
    }
    return p;
  }
  if (kind === "far") {
    for (let x = 0; x < W; x++) {
      const h = 40 + Math.round(Math.sin(x * 0.012) * 14 + Math.sin(x * 0.037 + 2) * 6);
      for (let y = 176 - h; y < 176; y++) p.px(x, y, tone(["#a9cfb6", "#93bea3", "#7ea98f", "#6a947c"], 0.8 - (y - 176 + h) / 90, x, y));
    }
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(r() * W);
      const h = 22 + Math.floor(r() * 22);
      const base = 176 - Math.round(Math.sin(x * 0.012) * 6);
      for (let j = 0; j < h; j++) {
        const w = Math.max(1, Math.round((j / h) * 7));
        p.rect(x - w, base - h + j, w * 2 + 1, 1, tone(PINE, 0.6 - j / (h * 2), x, j));
      }
      p.rect(x, base, 1, 4, PINE[3]);
    }
    p.box(400, 98, 6, 78, ["#9fb6c4", "#8399a8", "#6a7e8d", "#526371"]);
    for (let k = 0; k < 4; k++) p.limb(403, 98, 403 + Math.cos(k * 1.57 + 0.4) * 22, 98 + Math.sin(k * 1.57 + 0.4) * 22, 2, ["#e6eef2", "#c6d3da", "#a3b4bd", "#7f929c"]);
    return p;
  }
  let x = 6;
  while (x < W) {
    const kind2 = r();
    if (kind2 < 0.45) {
      const w = 56 + Math.floor(r() * 24);
      const top = 140;
      for (let j = 0; j < 36; j++) {
        const half = Math.round((j / 36) * (w / 2));
        for (let i = -half; i <= half; i++) p.px(x + w / 2 + i, top + j, tone(CANVAS, 0.75 - (i + half) / (w * 1.4), i, j));
      }
      p.box(x + w / 2 - 6, 160, 12, 16, ["#6a5c48", "#4f4436", "#3a3128", "#2a231d"]);
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
      p.box(x, 128, 70, 48, ["#b8a990", "#9c8c74", "#7c6e5a", "#5c5244"]);
      p.box(x - 4, 120, 78, 9, ["#7f9a6a", "#647e53", "#4b6040", "#36452f"]);
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
  sandbag: [(() => {
    const p = new Pix(16, 12);
    for (const [bx, by] of [[0, 6], [8, 6], [4, 0], [12, 0], [-4, 0]]) p.blob(bx + 4, by + 3, 4.5, 3, ["#e6d3a3", "#c4ab7a", "#9a8358", "#6b5a40"]);
    return { pix: p };
  })()],
};

function dummy(state, frame) {
  const p = new Pix(32, 48);
  if (state === "broken") {
    p.box(14, 30, 4, 18, R.wood);
    p.blob(10, 44, 5, 3, R.hardhat, -0.2);
    p.blob(21, 45, 4, 2, R.hardhat, -0.3);
    p.limb(5, 46, 12, 41, 1, R.hardhat);
    p.selout();
    return { pix: p };
  }
  const lean = state === "hit" ? (frame ? 2 : -2) : 0;
  p.box(14, 30, 4, 18, R.wood);
  p.box(9, 44, 14, 4, R.wood, -0.2);
  p.limb(16, 30, 16 + lean, 14, 10, R.hardhat);
  p.blob(16 + lean, 10, 6, 6, R.hardhat);
  p.limb(8 + lean, 18, 24 + lean, 18, 3, R.hardhat, -0.1);
  for (const by of [16, 24]) p.rect(11 + lean, by, 11, 1, R.leather[2]);
  p.blob(16 + lean, 21, 3, 3, R.red);
  p.px(16 + lean, 21, C.white);
  p.rect(14 + lean, 8, 1, 2, R.leather[3]).rect(18 + lean, 8, 1, 2, R.leather[3]);
  p.selout();
  return { pix: p };
}

export const dummyFrames = {
  dummy_idle: [dummy("idle", 0)],
  dummy_hit: [dummy("hit", 0), dummy("hit", 1)],
  dummy_broken: [dummy("broken", 0)],
};

export const flagFrames = [0, 1, 2].map((f) => {
  const p = new Pix(24, 48);
  p.box(2, 2, 3, 46, R.steel);
  for (let y = 0; y < 12; y++) {
    const w = 16 - Math.round(Math.abs(Math.sin((y + f * 3) * 0.5)) * 2);
    p.rect(5, 4 + y, w, 1, y < 6 ? R.teal[1] : R.teal[2]);
  }
  p.blob(12, 10, 3, 3, R.scarf);
  p.selout();
  return { pix: p };
});
