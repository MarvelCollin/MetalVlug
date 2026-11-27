import { Part, compose } from "./ink.mjs";

const SAND = ["#f2dca0", "#cfae6c", "#9c7c4a", "#634c32"];
const GM = ["#9aa3b4", "#5f6779", "#3d4456", "#24283a"];
const ST = ["#e6ebf2", "#b0b8c6", "#7a8394", "#4c5364"];
const ORANGE = ["#ffd9a0", "#f4a23b", "#c8622e", "#7f3426"];
const HOT = ["#fff8d0", "#ffd166", "#f4873b", "#c8452e"];
const DARK = "#1e1624";

const W = 176;
const H = 72;

function scar(part, cx, cy, rx, ry, fire) {
  part.ellipse(cx, cy, rx, ry, DARK);
  for (let i = 0; i < 6; i++) part.set(cx + Math.round(Math.cos(i * 1.1) * (rx + 1)), cy + Math.round(Math.sin(i * 1.7) * (ry + 1)), DARK);
  if (fire) {
    part.ellipse(cx, cy + 1, Math.max(1, rx * 0.5), Math.max(1, ry * 0.45), HOT[2]);
    part.set(cx, cy, HOT[1]);
  }
}

export function crawlerHull(stage) {
  const parts = [];
  const skirt = new Part(W, H);
  skirt.poly([[10, 44], [170, 44], [174, 52], [166, 58], [14, 58], [4, 52]], GM[1]).cel(GM, 0.3, -0.2);
  for (let x = 18; x < 166; x += 14) skirt.rect(x, 47, 2, 8, GM[2]);
  skirt.rect(8, 50, 164, 1, GM[0]);
  parts.push(skirt.ink());
  const body = new Part(W, H);
  body.poly([[22, 24], [150, 24], [166, 32], [168, 44], [8, 44], [12, 34]], SAND[1]).cel(SAND, 0.35, -0.2);
  for (let x = 30; x < 160; x += 16) body.dots([[x, 27], [x, 41]], SAND[3]);
  body.rect(12, 36, 154, 1, SAND[3]);
  body.rect(12, 37, 154, 1, SAND[0]);
  for (let k = 0; k < 6; k++) body.poly([[100 + k * 10, 38], [106 + k * 10, 38], [102 + k * 10, 44], [96 + k * 10, 44]], k % 2 ? DARK : ORANGE[1]);
  parts.push(body.ink());
  const glacis = new Part(W, H);
  glacis.poly([[8, 44], [12, 34], [22, 24], [36, 24], [28, 44]], SAND[2]).cel(SAND, 0.5, -0.1, -0.3);
  glacis.rect(16, 30, 6, 4, HOT[1]);
  glacis.rect(16, 30, 6, 1, HOT[0]);
  parts.push(glacis.ink());
  const deck = new Part(W, H);
  deck.poly([[118, 18], [158, 18], [162, 24], [114, 24]], GM[1]).cel(GM, 0.4, -0.2);
  for (let x = 120; x < 158; x += 4) deck.rect(x, 20, 2, 3, GM[3]);
  deck.poly([[150, 8], [156, 8], [156, 18], [150, 18]], GM[2]).cel(GM, 0.3, -0.3);
  deck.rect(149, 7, 8, 2, GM[3]);
  parts.push(deck.ink());
  const hatch = new Part(W, H);
  hatch.ellipse(98, 22, 7, 3, GM[1]).cel(GM, 0.3, -0.25);
  hatch.rect(95, 21, 6, 1, GM[3]);
  parts.push(hatch.ink());
  if (stage > 0) {
    const d = new Part(W, H);
    scar(d, 52, 32, 5, 3, true);
    scar(d, 132, 40, 4, 2, false);
    parts.push(d);
  }
  if (stage > 1) {
    const d = new Part(W, H);
    scar(d, 74, 38, 7, 4, true);
    scar(d, 150, 30, 5, 3, true);
    d.limb(40, 26, 60, 40, 2, 2, DARK);
    parts.push(d);
  }
  return { pix: compose(parts, W, H), anchor: { turret: { x: 76, y: 24 }, engine: { x: 132, y: 16 }, exhaust: { x: 153, y: 6 }, hatch: { x: 98, y: 20 } } };
}

export function crawlerTread(frame) {
  const t = new Part(W, 24);
  t.poly([[6, 4], [170, 4], [176, 12], [170, 22], [6, 22], [0, 12]], GM[2]).cel(GM, 0.2, -0.25);
  const off = frame * 2;
  for (let x = -8 + off; x < W; x += 8) {
    t.rect(x, 3, 4, 2, GM[3]);
    t.rect(x + 2, 21, 4, 2, GM[3]);
  }
  const wheels = [new Part(W, 24)];
  for (const wx of [20, 44, 68, 92, 116, 140, 160]) {
    const w = new Part(W, 24);
    w.ellipse(wx, 13, 7, 7, GM[1]).cel(GM, 0.35, -0.2);
    w.ellipse(wx, 13, 3, 3, ST[1]);
    const a = (frame / 4) * (Math.PI / 2);
    for (let k = 0; k < 4; k++) w.set(wx + Math.round(Math.cos(a + (k * Math.PI) / 2) * 5), 13 + Math.round(Math.sin(a + (k * Math.PI) / 2) * 5), GM[3]);
    w.set(wx, 13, DARK);
    wheels.push(w.ink());
  }
  return { pix: compose([t.ink(), ...wheels], W, 24) };
}

const TW = 96;
const TH = 44;

export function crawlerTurret(angle, broken = false) {
  const parts = [];
  const lift = [0, 0.2, 0.4][angle];
  const pivotX = 40;
  const pivotY = 26;
  if (!broken) {
    const barrel = new Part(TW, TH);
    const len = 40;
    const bx = pivotX - 8 - Math.cos(lift) * len;
    const by = pivotY - 2 - Math.sin(lift) * len;
    barrel.limb(pivotX - 8, pivotY - 2, bx, by, 7, 6, GM[1]).cel(GM, 0.35, -0.2);
    barrel.limb(pivotX - 8 - Math.cos(lift) * (len - 6), pivotY - 2 - Math.sin(lift) * (len - 6), bx - Math.cos(lift) * 2, by - Math.sin(lift) * 2, 10, 10, GM[2]);
    parts.push(barrel.ink());
    parts.muzzle = { x: Math.round(bx - Math.cos(lift) * 3), y: Math.round(by - Math.sin(lift) * 3) };
  }
  const body = new Part(TW, TH);
  if (broken) {
    body.poly([[24, 30], [70, 30], [74, 40], [20, 40]], SAND[2]).cel(SAND, 0.1, -0.1);
    body.limb(30, 30, 36, 22, 3, 2, GM[2]);
    body.limb(54, 30, 62, 20, 3, 2, GM[2]);
    body.ellipse(46, 34, 6, 3, HOT[2]);
    body.set(46, 34, HOT[1]);
  } else {
    body.poly([[26, 18], [62, 16], [76, 22], [78, 40], [22, 40], [20, 28]], SAND[1]).cel(SAND, 0.35, -0.2);
    body.rect(22, 33, 56, 1, SAND[3]);
    body.rect(22, 34, 56, 1, SAND[0]);
    body.dots([[30, 21], [44, 19], [58, 19], [70, 24]], SAND[3]);
    body.poly([[44, 10], [56, 10], [58, 16], [42, 16]], GM[1]);
    body.rect(41, 9, 18, 2, GM[2]);
    body.rect(26, 36, 10, 2, ORANGE[1]);
    body.rect(36, 36, 10, 2, DARK);
    body.rect(46, 36, 10, 2, ORANGE[1]);
    body.rect(16, 32, 8, 3, GM[1]);
  }
  parts.push(body.ink());
  const muzzle = parts.muzzle ?? { x: 0, y: 0 };
  return { pix: compose(parts, TW, TH), anchor: { muzzle, mg: { x: 15, y: 33 }, pivot: { x: pivotX, y: 40 } } };
}

export function crawlerEngine(state, frame = 0) {
  const e = new Part(32, 20);
  e.rect(1, 1, 30, 18, GM[1]).cel(GM, 0.3, -0.2);
  const inner = new Part(32, 20);
  if (state === "closed") {
    for (let y = 4; y < 17; y += 3) inner.rect(4, y, 24, 2, GM[3]);
  } else if (state === "open") {
    inner.rect(4, 4, 24, 12, DARK);
    const glow = frame ? HOT : ["#ffe9a8", "#f4a23b", "#d8582e", "#8e2f2a"];
    inner.ellipse(16, 10, 9, 4, glow[2]);
    inner.ellipse(16, 10, 6, 3, glow[1]);
    inner.ellipse(15, 9, 3, 1.5, glow[0]);
  } else {
    inner.rect(4, 4, 24, 12, DARK);
    inner.limb(6, 6, 26, 14, 2, 2, GM[3]);
  }
  return { pix: compose([e.ink(), inner], 32, 20) };
}
