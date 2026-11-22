import { C, Pix, R, rng, tone } from "../pix.mjs";

export const tiles = {};

tiles.dock = [(() => {
  const p = new Pix(16, 16);
  p.box(0, 0, 16, 5, R.wood, 0.1);
  p.rect(0, 0, 16, 1, R.wood[0]);
  p.box(0, 5, 16, 11, R.wood, -0.35);
  p.rect(7, 5, 1, 11, R.wood[3]);
  p.rect(15, 5, 1, 11, R.wood[3]);
  p.rect(0, 10, 16, 1, R.wood[3]);
  p.px(3, 2, R.gunmetal[1]).px(11, 2, R.gunmetal[1]);
  p.rect(2, 7, 3, 1, R.wood[2]);
  p.rect(10, 12, 3, 1, R.wood[2]);
  return { pix: p };
})()];

tiles.fill = [(() => {
  const p = new Pix(16, 16);
  p.rect(0, 0, 16, 16, "#2c2330");
  p.box(2, 0, 5, 16, R.wood, -0.55);
  p.box(10, 0, 5, 16, R.wood, -0.55);
  p.rect(0, 6, 16, 2, R.wood[3]);
  return { pix: p };
})()];

tiles.plank = [(() => {
  const p = new Pix(16, 7);
  p.box(0, 0, 16, 4, R.wood, 0.15);
  p.rect(0, 0, 16, 1, R.wood[0]);
  p.box(0, 4, 16, 3, R.wood, -0.4);
  p.box(2, 4, 2, 3, R.gunmetal);
  p.box(12, 4, 2, 3, R.gunmetal);
  return { pix: p };
})()];

tiles.brick = [(() => {
  const p = new Pix(16, 16);
  const brick = ["#b06a55", "#8c4f45", "#6c3a3c", "#472632"];
  for (let row = 0; row < 4; row++) {
    const o = row % 2 ? 4 : 0;
    for (let x = -o; x < 16; x += 8) p.box(x, row * 4, 7, 3, brick);
  }
  for (let y = 3; y < 16; y += 4) p.rect(0, y, 16, 1, "#3a2630");
  return { pix: p };
})()];

tiles.roof = [(() => {
  const p = new Pix(16, 9);
  for (let x = 0; x < 16; x += 4) p.box(x, 0, 4, 8, R.teal, -0.2);
  p.rect(0, 0, 16, 1, R.teal[0]);
  p.rect(0, 8, 16, 1, R.teal[3]);
  return { pix: p };
})()];

tiles.rail = [(() => {
  const p = new Pix(16, 16);
  p.rect(0, 0, 16, 16, "#3a3140");
  p.box(0, 3, 16, 3, R.steel, 0.2);
  p.rect(0, 2, 16, 1, R.steel[0]);
  p.box(1, 6, 5, 10, R.wood, -0.45);
  p.box(9, 6, 5, 10, R.wood, -0.45);
  for (let x = 0; x < 16; x += 3) p.px(x, 15, "#5a4c58");
  return { pix: p };
})()];

export const hud = {
  bombicon: [(() => { const p = new Pix(9, 10); p.blob(4, 6, 3.5, 3.5, R.olive); p.rect(4, 1, 1, 2, R.steel[1]); p.px(5, 0, R.brass[0]); p.selout(); return { pix: p }; })()],
  go: [0, 1].map((f) => { const p = new Pix(34, 18); const ramp = f ? R.hardhat : R.red; p.box(0, 6, 20, 6, ramp); for (let i = 0; i < 9; i++) p.box(20 + i, i, 1, 18 - i * 2, ramp); p.selout(); return { pix: p }; }),
  hud_box: [(() => {
    const p = new Pix(84, 24);
    p.rect(0, 0, 84, 24, "#2a2236");
    p.rect(1, 1, 82, 22, "#3a3048");
    p.rect(2, 2, 80, 20, "#1f1a2b");
    p.rect(2, 2, 80, 1, "#4c4060");
    p.rect(41, 3, 1, 18, "#3a3048");
    return { pix: p };
  })()],
  hud_bar: [0, 1].map((f) => {
    const p = new Pix(46, 6);
    p.rect(0, 0, 46, 6, "#1f1a2b");
    if (f) { p.box(1, 1, 44, 4, R.teal); }
    return { pix: p };
  }),
  hud_cursor: [(() => { const p = new Pix(7, 9); for (let i = 0; i < 4; i++) p.box(i, i, 1, 9 - i * 2, R.hardhat); p.selout(); return { pix: p }; })()],
  armour: [0, 1].map((f) => { const p = new Pix(8, 6); p.box(0, 0, 8, 6, f ? R.olive : R.red); p.selout(); return { pix: p }; }),
};

function skyBand(p, y0, y1, colors, r) {
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / (y1 - y0);
    for (let x = 0; x < p.w; x++) p.px(x, y, tone(colors, 1 - t, x, y));
  }
}

export const BG_VARIANTS = 3;

const HARBOUR = [
  {
    sky: ["#fde2b4", "#f7c491", "#ea9f84", "#c97f8f"],
    low: ["#fde9c4", "#fbd6a4", "#f2b78f", "#e39a86"],
    sun: { x: 286, y: 132, r: 30, ramp: ["#fffbe9", "#fff0c4", "#ffe09c", "#ffd07a"] },
    cloud: ["#fff6e6", "#fbe3c8", "#efc3a8", "#d99c94"],
    sea: ["#6f8fae", "#56769a", "#435f84", "#33496c"],
    glint: ["#ffe2b0", "#8fb0cc"],
    hill: ["#b58fa0", "#a07d93", "#8c6c86", "#785c79"],
    sil: ["#9a7a92", "#876a84", "#745b76", "#614c68"],
    farWin: "#c79aa0",
    haze: ["#f2c4a0", 0.28],
    wall: ["#a0707a", "#87606c", "#6e4f5e", "#563f4f"],
    roof: ["#8fc0bf", "#6a9ea3", "#4f7c86", "#3a5b68"],
    lit: 0.72,
    quay: ["#9a8c92", "#7c6e78", "#625662", "#4a404c"],
    clouds: 7,
    stars: 0,
  },
  {
    sky: ["#141a36", "#1d2647", "#2a3459", "#3c4569"],
    low: ["#3c4569", "#4a4f73", "#5b5a7a", "#6c6380"],
    sun: { x: 92, y: 44, r: 11, ramp: ["#fffdf0", "#f3f0dc", "#d9d6c4", "#b9b6a8"] },
    cloud: ["#5a6286", "#4a5276", "#3d4468", "#323858"],
    sea: ["#2a3658", "#1f2a48", "#18223e", "#131b34"],
    glint: ["#f7e2a8", "#4a5a84"],
    hill: ["#2c3354", "#262c4a", "#202640", "#1a2036"],
    sil: ["#363e62", "#2e3556", "#262c4a", "#1f243e"],
    farWin: "#ffd98a",
    haze: ["#1c2240", 0.18],
    wall: ["#4f4a6c", "#423e5e", "#35324e", "#2a2740"],
    roof: ["#4f6a80", "#3e566c", "#304558", "#233444"],
    lit: 0.42,
    quay: ["#5c5874", "#4a4762", "#3a3850", "#2c2a3e"],
    clouds: 4,
    stars: 140,
  },
  {
    sky: ["#e9eef0", "#dbe5e8", "#cbd9de", "#b8cbd2"],
    low: ["#dbe5e8", "#d0dde0", "#c4d4d8", "#b6c8cd"],
    sun: { x: 128, y: 70, r: 16, ramp: ["#ffffff", "#fbf8ee", "#f1ecdc", "#e4ddc8"] },
    cloud: ["#ffffff", "#f1f5f6", "#dde6e9", "#c8d5da"],
    sea: ["#9ab4bc", "#86a3ad", "#72919c", "#5f7f8a"],
    glint: ["#f4fbfc", "#7c9aa4"],
    hill: ["#a6b8b6", "#97aaa9", "#889c9b", "#7a8e8e"],
    sil: ["#94a6a8", "#85979a", "#76888c", "#687a7e"],
    farWin: "#c9d6d6",
    haze: ["#e2eaec", 0.42],
    wall: ["#b49a84", "#977f6c", "#7b6656", "#614f44"],
    roof: ["#c46a4f", "#a1523e", "#7f3f32", "#5f2f28"],
    lit: 0.94,
    quay: ["#a59a92", "#877c76", "#6c625e", "#534b48"],
    clouds: 10,
    stars: 0,
  },
];

function cloud(p, cx, cy, w, r, hi) {
  for (let k = 0; k < Math.max(3, Math.floor(w / 9)); k++) {
    const x = cx + (k / Math.max(1, Math.floor(w / 9) - 1)) * w;
    const rr = 5 + r() * 6;
    p.blob(Math.round(x), Math.round(cy - r() * 4), rr, rr * 0.6, hi, 0.2);
  }
}

export function background(kind, variant = 0) {
  const pal = HARBOUR[variant];
  const W = kind === "sky" ? 384 : 512;
  const H = 216;
  const p = new Pix(W, H);
  const r = rng(kind.length * 131 + 7 + variant * 977);
  if (kind === "sky") {
    skyBand(p, 0, 120, pal.sky, r);
    skyBand(p, 120, 168, pal.low, r);
    for (let k = 0; k < pal.stars; k++) {
      const sy = Math.floor(r() * 130);
      p.px(Math.floor(r() * W), sy, r() > 0.85 ? "#ffffff" : sy < 70 ? "#aab4dc" : "#8a90b8");
    }
    p.blob(pal.sun.x, pal.sun.y, pal.sun.r, pal.sun.r, pal.sun.ramp, 0.4);
    if (variant === 1) p.blob(pal.sun.x + 4, pal.sun.y - 3, pal.sun.r * 0.75, pal.sun.r * 0.75, pal.sky, 0.6);
    for (let k = 0; k < pal.clouds; k++) cloud(p, Math.floor(r() * W), 24 + Math.floor(r() * 80), 30 + Math.floor(r() * 50), r, pal.cloud);
    skyBand(p, 168, 216, pal.sea, r);
    for (let k = 0; k < 90; k++) {
      const y = 168 + Math.floor(r() * 48);
      p.rect(Math.floor(r() * W), y, 4 + Math.floor(r() * 18), 1, y < 180 ? pal.glint[0] : pal.glint[1]);
    }
    if (variant === 1) for (let k = 0; k < 14; k++) p.rect(pal.sun.x - 6 + Math.floor(r() * 12), 170 + k * 3, 3 + Math.floor(r() * 8), 1, "#e8e4cc");
    return p;
  }
  if (kind === "far") {
    const out = farHarbour(p, W, r, pal, variant);
    return haze(out, pal.haze[0], pal.haze[1]);
  }
  const mid = midHarbour(p, W, r, pal);
  return variant === 2 ? haze(mid, pal.haze[0], 0.18) : mid;
}

function haze(p, color, amount) {
  const n = parseInt(color.slice(1), 16);
  const hr = (n >> 16) & 255, hg = (n >> 8) & 255, hb = n & 255;
  for (let i = 0; i < p.data.length; i += 4) {
    if (!p.data[i + 3]) continue;
    p.data[i] = Math.round(p.data[i] * (1 - amount) + hr * amount);
    p.data[i + 1] = Math.round(p.data[i + 1] * (1 - amount) + hg * amount);
    p.data[i + 2] = Math.round(p.data[i + 2] * (1 - amount) + hb * amount);
  }
  return p;
}

export { haze };

function farHarbour(p, W, r, pal, variant) {
  {
    const hill = pal.hill;
    for (let x = 0; x < W; x++) {
      const h = 22 + Math.round(Math.sin(x * 0.018) * 8 + Math.sin(x * 0.051 + 1) * 4);
      for (let y = 172 - h; y < 172; y++) p.px(x, y, tone(hill, 0.75 - (y - (172 - h)) / 60, x, y));
    }
    const sil = pal.sil;
    const shift = variant * 57;
    for (const cx0 of [70, 270, 450]) {
      const cx = (cx0 + shift) % W;
      p.box(cx, 64, 6, 108, sil);
      p.box(cx - 34, 62, 80, 5, sil);
      for (let i = 0; i < 9; i++) p.line(cx - 32 + i * 8, 67, cx - 28 + i * 8, 62, sil[2]);
      p.line(cx + 3, 64, cx + 40, 64, sil[3]);
      p.rect(cx + 38, 67, 1, 36, sil[3]);
      p.box(cx + 34, 103, 9, 6, sil);
      p.box(cx - 6, 150, 18, 22, sil);
    }
    p.box(150, 118, 84, 54, sil);
    p.box(162, 98, 14, 20, sil);
    p.box(190, 104, 12, 14, sil);
    for (let x = 156; x < 230; x += 8) p.rect(x, 126, 4, 3, pal.farWin);
    if (variant === 1) for (let k = 0; k < 40; k++) p.rect(150 + Math.floor(r() * 80), 134 + Math.floor(r() * 30), 2, 2, r() > 0.5 ? pal.farWin : sil[3]);
    if (variant === 2) {
      p.box(380, 146, 110, 18, sil);
      p.box(400, 128, 34, 18, sil);
      p.box(446, 120, 8, 26, sil);
      p.box(370, 160, 130, 6, sil, -0.3);
    }
    p.box(340, 56, 12, 116, sil);
    p.box(336, 48, 20, 10, sil);
    p.box(340, 42, 12, 6, ["#fffbe0", "#ffeaa0", "#ffd166", "#f4a23b"]);
    return p;
  }
}

function midHarbour(p, W, r, pal) {
  const wall = pal.wall;
  const roof = pal.roof;
  let x = 0;
  while (x < W) {
    const w = 64 + Math.floor(r() * 56);
    const h = 52 + Math.floor(r() * 44);
    const top = 178 - h;
    p.box(x, top, w, h, wall);
    for (let by = top + 4; by < 178; by += 4) for (let bx = x + ((by / 4) % 2 ? 0 : 3); bx < x + w; bx += 7) p.px(bx, by, wall[3]);
    p.box(x - 3, top - 6, w + 6, 7, roof);
    for (let wy = top + 10; wy < 162; wy += 16)
      for (let wx = x + 9; wx < x + w - 12; wx += 15) {
        const lit = r() > pal.lit;
        p.box(wx, wy, 8, 9, lit ? ["#fff4c4", "#ffe08a", "#f4b860", "#c98a4c"] : ["#5d4a5c", "#4a3b4c", "#3a2f3e", "#2a2230"]);
        p.rect(wx + 3, wy, 1, 9, wall[3]);
      }
    if (r() > 0.4) { p.box(x + w - 18, top - 24, 8, 18, wall, -0.2); p.blob(x + w - 14, top - 28, 4, 3, ["#c9bcc6", "#a99aa8", "#8a7c8a", "#6c5f6e"]); }
    if (r() > 0.6) { p.box(x + 8, top + 18, 3, h - 18, ["#a8b0be", "#848c9c", "#646b7c", "#474c5c"]); }
    x += w + 8 + Math.floor(r() * 16);
  }
  for (let cx = 6; cx < W; cx += 80 + Math.floor(r() * 60)) {
    const colors = [R.rust, R.teal, R.olive, R.slate];
    const col = colors[Math.floor(r() * colors.length)];
    p.box(cx, 150, 40, 28, col, -0.25);
    for (let k = 3; k < 40; k += 5) p.rect(cx + k, 152, 1, 24, col[3]);
    if (r() > 0.5) { p.box(cx + 6, 126, 34, 24, colors[Math.floor(r() * colors.length)], -0.2); }
  }
  const quay = pal.quay;
  for (let y = 174; y < 216; y++) for (let x2 = 0; x2 < W; x2++) p.px(x2, y, tone(quay, y < 176 ? 0.95 : 0.6 - (y - 176) / 90, x2, y));
  for (let y = 178; y < 216; y += 7) {
    p.rect(0, y, W, 1, quay[3]);
    for (let x2 = ((y / 7) % 2) * 9; x2 < W; x2 += 18) p.rect(x2, y, 1, 7, quay[3]);
  }
  for (let x2 = 12; x2 < W; x2 += 64) {
    p.box(x2, 168, 5, 8, R.gunmetal);
    p.rect(x2 - 1, 167, 7, 1, R.gunmetal[0]);
  }
  for (let x2 = 0; x2 < W; x2 += 3) p.px(x2, 174, quay[0]);
  return p;
}
