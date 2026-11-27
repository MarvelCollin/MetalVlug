import { Pix, R, rng, tone } from "../pix.mjs";
import { haze } from "./world.mjs";

const STONE = ["#b8aaa0", "#8f8278", "#685d58", "#463e40"];
const RUST = ["#e0915e", "#b4623e", "#83432f", "#552c26"];
const SLEEPER = ["#8a6a50", "#6a4e3c", "#4c382e", "#2e2220"];

function band(p, y0, y1, ramp) {
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0);
    for (let x = 0; x < p.w; x++) p.px(x, y, tone(ramp, 1 - t, x, y));
  }
}

const YARD = [
  {
    sky: ["#f6d7a0", "#eab27e", "#d98a6e", "#b26a70"],
    low: ["#f8dcae", "#f2c08a", "#e3a07a", "#c98270"],
    sun: { x: 300, y: 118, r: 26, ramp: ["#fffbe0", "#fff0b0", "#ffd98a", "#f8b86a"] },
    smoke: ["#e8cdb8", "#cfae9c", "#a88a80", "#7c6468"],
    hill: ["#a8807a", "#916c6c", "#7a5a5e", "#634a52"],
    sil: ["#8c6c6e", "#785c62", "#644c56", "#523e4a"],
    lamp: "#ffd98a",
    haze: ["#f0c8a0", 0.3],
    shed: ["#9a7a6a", "#7f6458", "#654e48", "#4c3a38"],
    roof: ["#7c8a8c", "#627074", "#4c585e", "#36404a"],
    car: RUST,
    car2: ["#8fb0a0", "#6a8c80", "#4e6a62", "#364a46"],
    ground: ["#9a8a80", "#7a6c66", "#5e524e", "#443a3a"],
    lit: 0.8,
    stars: 0,
  },
  {
    sky: ["#10142c", "#1a2040", "#262c52", "#383a62"],
    low: ["#383a62", "#4a4468", "#5e5070", "#6e5a70"],
    sun: { x: 80, y: 40, r: 9, ramp: ["#fffdf0", "#f0ecd8", "#d6d2c0", "#b6b2a4"] },
    smoke: ["#4e4c68", "#403e5a", "#34324c", "#28283e"],
    hill: ["#262a48", "#20243e", "#1a1e36", "#14182c"],
    sil: ["#2e3254", "#282b4a", "#212440", "#1a1d36"],
    lamp: "#ffc46a",
    haze: ["#1a1e3a", 0.16],
    shed: ["#4a4460", "#3c3852", "#302c44", "#242236"],
    roof: ["#3e4a60", "#323c52", "#283044", "#1e2436"],
    car: ["#a0604a", "#7c483c", "#5c3630", "#3c2426"],
    car2: ["#4e6a6a", "#3e5658", "#304446", "#223234"],
    ground: ["#4c4658", "#3e3a4a", "#302e3c", "#24222e"],
    lit: 0.45,
    stars: 120,
  },
  {
    sky: ["#d8d6cc", "#c8c6ba", "#b6b2a6", "#a29c90"],
    low: ["#d0ccc0", "#c2bcae", "#b2ac9e", "#a29a8c"],
    sun: { x: 180, y: 70, r: 15, ramp: ["#ffffff", "#f8f4e6", "#eae2cc", "#d8ceb4"] },
    smoke: ["#c8c2b4", "#b0a898", "#958c80", "#7a7268"],
    hill: ["#a8a296", "#9a948a", "#8c867c", "#7e786e"],
    sil: ["#958e84", "#878078", "#79726c", "#6b6460"],
    lamp: "#f0e0b0",
    haze: ["#d6d0c2", 0.42],
    shed: ["#a08c78", "#857260", "#6a5a4c", "#52443a"],
    roof: ["#8c6a5a", "#72564a", "#5a443c", "#42322e"],
    car: ["#c87a56", "#a05e44", "#784636", "#50302a"],
    car2: ["#7e9a8c", "#647e72", "#4c6058", "#36443e"],
    ground: ["#9a948a", "#7e786e", "#625e56", "#4a4640"],
    lit: 0.92,
    stars: 0,
  },
];

function plume(p, x, y, pal, r, n) {
  for (let i = 0; i < n; i++) {
    const t = i / n;
    p.blob(x + Math.round(t * 46 + Math.sin(i) * 3), y - Math.round(t * 60), 4 + t * 9, 3 + t * 6, pal.smoke, 0.3);
  }
}

function boxcar(p, x, y, w, ramp, wheels = true) {
  p.box(x, y, w, 30, ramp, -0.1);
  for (let k = 3; k < w - 2; k += 5) p.rect(x + k, y + 3, 1, 25, ramp[3]);
  p.rect(x, y, w, 2, ramp[0]);
  p.box(x + Math.floor(w / 2) - 9, y + 6, 18, 22, ramp, -0.35);
  p.rect(x + Math.floor(w / 2), y + 6, 1, 22, ramp[3]);
  if (!wheels) return;
  p.rect(x + 4, y + 30, w - 8, 2, "#2a2228");
  for (const wx of [x + 8, x + 16, x + w - 18, x + w - 10]) p.blob(wx, y + 34, 3.2, 3.2, ["#6c6670", "#4e4a56", "#38343e", "#24222a"], 0.2);
}

export function yardBackground(kind, variant = 0) {
  const pal = YARD[variant];
  const W = kind === "sky" ? 384 : 512;
  const p = new Pix(W, 216);
  const r = rng(kind.length * 71 + 23 + variant * 431);
  if (kind === "sky") {
    band(p, 0, 120, pal.sky);
    band(p, 120, 216, pal.low);
    for (let k = 0; k < pal.stars; k++) p.px(Math.floor(r() * W), Math.floor(r() * 120), r() > 0.85 ? "#ffffff" : "#9aa2cc");
    p.blob(pal.sun.x, pal.sun.y, pal.sun.r, pal.sun.r, pal.sun.ramp, 0.4);
    if (variant === 1) p.blob(pal.sun.x + 3, pal.sun.y - 2, pal.sun.r * 0.75, pal.sun.r * 0.75, pal.sky, 0.6);
    for (let k = 0; k < 5; k++) {
      const cx = Math.floor(r() * W);
      const cy = 20 + Math.floor(r() * 70);
      for (let i = 0; i < 5; i++) p.blob(cx + i * 10, cy - (i % 2) * 2, 9 + r() * 5, 3 + r() * 2, pal.smoke, 0.25);
    }
    return p;
  }
  if (kind === "far") {
    for (let x = 0; x < W; x++) {
      const h = 18 + Math.round(Math.sin(x * 0.015 + variant) * 7 + Math.sin(x * 0.047) * 3);
      for (let y = 176 - h; y < 176; y++) p.px(x, y, tone(pal.hill, 0.7 - (y - 176 + h) / 50, x, y));
    }
    const sil = pal.sil;
    for (const cx of [40, 210, 380]) {
      const x0 = (cx + variant * 61) % W;
      p.box(x0, 120, 70, 56, sil);
      for (let k = 0; k < 4; k++) p.box(x0 + 6 + k * 16, 112, 12, 9, sil, -0.2);
      for (const sx of [x0 + 12, x0 + 50]) {
        p.box(sx, 66, 7, 54, sil);
        p.rect(sx - 1, 66, 9, 2, sil[3]);
        plume(p, sx + 3, 62, pal, r, 9);
      }
      for (let wy = 128; wy < 168; wy += 10) for (let wx = x0 + 6; wx < x0 + 64; wx += 9) if (r() > pal.lit) p.rect(wx, wy, 4, 3, pal.lamp);
    }
    const tower = (140 + variant * 90) % W;
    p.box(tower, 96, 26, 22, sil);
    p.rect(tower - 2, 94, 30, 3, sil[3]);
    for (const lx of [tower + 3, tower + 21]) p.rect(lx, 118, 2, 58, sil[2]);
    p.line(tower + 4, 130, tower + 22, 160, sil[3], 1);
    p.line(tower + 22, 130, tower + 4, 160, sil[3], 1);
    for (let k = 0; k < 9; k++) p.box(20 + k * 52, 164, 48, 10, sil, -0.2);
    return haze(p, pal.haze[0], pal.haze[1]);
  }
  let x = 0;
  while (x < W) {
    const w = 80 + Math.floor(r() * 40);
    const top = 112 + Math.floor(r() * 18);
    p.box(x, top, w, 176 - top, pal.shed);
    for (let k = 0; k < w; k += 16) {
      for (let j = 0; j < 10; j++) p.rect(x + k + j, top - 10 + j, Math.max(1, 16 - j * 1.6), 1, tone(pal.roof, 0.8 - j / 12, x + k, j));
    }
    for (let wy = top + 10; wy < 166; wy += 14) for (let wx = x + 8; wx < x + w - 10; wx += 13) {
      const lit = r() > pal.lit;
      p.box(wx, wy, 8, 7, lit ? ["#fff4c4", "#ffe08a", "#f4b860", "#c98a4c"] : [pal.shed[3], pal.shed[3], "#2a2230", "#201a26"]);
    }
    p.box(x + Math.floor(w / 2) - 10, 148, 20, 28, ["#5c5058", "#4a4048", "#3a3038", "#2a222a"]);
    for (let k = 151; k < 176; k += 3) p.rect(x + Math.floor(w / 2) - 10, k, 20, 1, "#2a222a");
    x += w + 6;
  }
  for (let cx = 10; cx < W; cx += 120 + Math.floor(r() * 50)) {
    boxcar(p, cx, 140, 64, r() > 0.5 ? pal.car : pal.car2);
    if (r() > 0.55) boxcar(p, cx + 10, 110, 44, r() > 0.5 ? pal.car2 : pal.car, false);
  }
  for (let sx = 70; sx < W; sx += 170) {
    p.rect(sx, 92, 2, 84, R.gunmetal[2]);
    p.box(sx - 5, 88, 12, 8, R.gunmetal);
    p.px(sx - 2, 91, variant === 1 ? "#ff5040" : "#e04a3e");
    p.px(sx + 3, 91, "#6af08a");
  }
  for (let y = 174; y < 216; y++) for (let x2 = 0; x2 < W; x2++) p.px(x2, y, tone(pal.ground, y < 176 ? 0.92 : 0.6 - (y - 176) / 90, x2, y));
  for (let x2 = 0; x2 < W; x2 += 7) p.rect(x2, 186, 4, 3, SLEEPER[2]);
  p.rect(0, 185, W, 1, R.steel[1]);
  p.rect(0, 190, W, 1, R.steel[2]);
  return p;
}

export const yardTiles = {
  track: [(() => {
    const p = new Pix(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.px(x, y, tone(STONE, 0.75 - y / 22, x * 3 + y, y * 5 + x));
    p.box(1, 4, 6, 3, SLEEPER, 0.1);
    p.box(9, 4, 6, 3, SLEEPER, 0.1);
    p.box(0, 1, 16, 3, R.steel, 0.25);
    p.rect(0, 0, 16, 1, R.steel[0]);
    p.rect(0, 4, 16, 1, "#2e2830");
    const r = rng(9);
    for (let k = 0; k < 14; k++) p.px(Math.floor(r() * 16), 7 + Math.floor(r() * 9), r() > 0.5 ? STONE[0] : STONE[3]);
    return { pix: p };
  })()],
  gravel: [(() => {
    const p = new Pix(16, 16);
    const r = rng(17);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) p.px(x, y, tone(STONE, 0.45 - (r() * 0.3), x, y));
    for (let k = 0; k < 18; k++) p.px(Math.floor(r() * 16), Math.floor(r() * 16), r() > 0.5 ? STONE[1] : STONE[3]);
    return { pix: p };
  })()],
  boxcar: [(() => {
    const p = new Pix(16, 24);
    p.box(0, 0, 16, 24, RUST, -0.1);
    for (const x of [3, 8, 13]) p.rect(x, 2, 1, 20, RUST[3]);
    for (const x of [4, 9, 14]) p.rect(x, 2, 1, 20, RUST[0]);
    p.rect(0, 0, 16, 2, R.gunmetal[2]);
    p.rect(0, 0, 16, 1, R.gunmetal[1]);
    p.rect(0, 22, 16, 2, R.gunmetal[2]);
    p.rect(0, 23, 16, 1, R.gunmetal[3]);
    p.px(1, 7, RUST[3]).px(6, 15, RUST[3]).px(11, 5, RUST[0]);
    p.px(2, 1, R.brass[1]).px(10, 1, R.brass[1]).px(2, 22, R.brass[1]).px(10, 22, R.brass[1]);
    return { pix: p };
  })()],
  bogie: [(() => {
    const p = new Pix(32, 8);
    p.rect(0, 0, 32, 2, "#2a2228");
    for (const wx of [8, 24]) {
      p.blob(wx, 4, 3.6, 3.6, ["#8a8494", "#5e5a68", "#403c4a", "#26222c"], 0.25);
      p.px(wx, 4, "#1e1624");
    }
    p.rect(4, 2, 24, 1, "#4a4450");
    return { pix: p };
  })()],
  carroof: [(() => {
    const p = new Pix(16, 9);
    p.box(0, 0, 16, 5, R.gunmetal, 0.2);
    p.rect(0, 0, 16, 1, R.gunmetal[0]);
    for (const x of [2, 7, 12]) p.rect(x, 1, 3, 1, R.gunmetal[2]);
    p.box(0, 5, 16, 4, RUST, -0.4);
    return { pix: p };
  })()],
};
