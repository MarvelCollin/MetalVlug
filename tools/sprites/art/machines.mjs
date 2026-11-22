import { C, Pix, R } from "../pix.mjs";
import { Part, compose } from "./ink.mjs";

function rivets(p, x0, x1, y, step, ramp) {
  for (let x = x0; x <= x1; x += step) {
    p.px(x, y, ramp[0]);
    p.px(x + 1, y + 1, ramp[3]);
  }
}

function muleLeg(p, hx, hy, fx, fy, back) {
  const bias = back ? -0.35 : 0;
  const kx = (hx + fx) / 2 - 6;
  const ky = (hy + fy) / 2 + 1;
  p.limb(hx, hy, kx, ky, 6, R.gunmetal, bias);
  p.limb(kx, ky, fx, fy - 3, 4, R.steel, bias);
  p.limb(hx + 2, hy + 2, fx + 1, fy - 6, 1, R.brass, bias);
  p.blob(kx, ky, 2.5, 2.5, R.steel, bias);
  p.box(fx - 5, fy - 3, 11, 3, R.gunmetal, bias);
}

const YEL = ["#fff2a8", "#f4c843", "#c48a2a", "#7f5424"];
const GM = ["#9aa3b4", "#5f6779", "#3d4456", "#24283a"];
const ST = ["#e6ebf2", "#b0b8c6", "#7a8394", "#4c5364"];
const GL = ["#e8fbff", "#8fd8ea", "#4d9ab8", "#2e5c7c"];

function inkLeg(hx, hy, fx, fy, back) {
  const kx = (hx + fx) / 2 - 6;
  const ky = (hy + fy) / 2 + 1;
  const thigh = new Part(64, 56);
  thigh.limb(hx, hy, kx, ky, 8, 6, GM[1]).cel(GM, 0.35, -0.15, back ? -0.35 : 0).ink();
  const shin = new Part(64, 56);
  shin.limb(kx, ky, fx, fy - 4, 6, 5, ST[1]).cel(ST, 0.35, -0.15, back ? -0.35 : 0);
  shin.limb(hx + 2, hy + 2, fx + 2, fy - 7, 1, 1, YEL[2]);
  shin.ink();
  const knee = new Part(64, 56);
  knee.ellipse(kx, ky, 3, 3, GM[1]).cel(GM, 0.2, -0.3).ink();
  const foot = new Part(64, 56);
  foot.poly([[fx - 6, fy - 4], [fx + 4, fy - 4], [fx + 7, fy - 2], [fx + 7, fy], [fx - 6, fy]], GM[1]).cel(GM, 0.3, -0.2, back ? -0.3 : 0);
  foot.rect(fx - 6, fy - 1, 14, 1, GM[3]);
  foot.ink();
  return [thigh, shin, knee, foot];
}

export function muleBody(frame, mode) {
  const crouch = mode === "crouch" ? 7 : 0;
  const t = (frame / 6) * Math.PI * 2;
  const walk = mode === "walk";
  const bob = walk ? Math.round(Math.abs(Math.cos(t))) : 0;
  const by = 14 + crouch + bob;
  const s = walk ? Math.sin(t) * 8 : 0;
  const lift = (v) => (walk ? Math.max(0, v) * 4 : 0);
  const parts = [...inkLeg(27, by + 15, 25 - s, 55 - lift(-Math.cos(t)), true)];
  const hull = new Part(64, 56);
  hull.poly([[12, by + 4], [18, by - 1], [44, by - 1], [52, by + 4], [54, by + 12], [50, by + 18], [14, by + 18], [10, by + 12]], YEL[1]);
  hull.cel(YEL, 0.3, -0.2);
  hull.rect(12, by + 13, 41, 1, YEL[3]);
  hull.rect(14, by + 14, 37, 4, YEL[2]);
  for (let x = 16; x <= 48; x += 6) hull.dots([[x, by + 15], [x + 1, by + 16]], YEL[0]);
  hull.rect(22, by + 2, 1, 11, YEL[2]);
  hull.dots([[15, by + 5], [16, by + 4], [17, by + 3]], YEL[0]);
  hull.rect(47, by + 9, 4, 2, "#e24b3e");
  hull.rect(14, by + 6, 6, 1, YEL[3]);
  hull.rect(14, by + 8, 6, 1, YEL[3]);
  parts.push(hull.ink());
  const glass = new Part(64, 56);
  glass.poly([[30, by + 1], [44, by + 1], [48, by + 6], [48, by + 9], [30, by + 9]], GL[1]).cel(GL, 0.25, -0.3);
  glass.dots([[32, by + 2], [33, by + 2], [34, by + 2], [32, by + 3]], "#ffffff");
  glass.rect(38, by + 2, 1, 7, GL[3]);
  parts.push(glass.ink());
  const exhaust = new Part(64, 56);
  exhaust.rect(5, by + 6, 7, 8, GM[1]).cel(GM, 0.3, -0.2);
  exhaust.ellipse(5, by + 9, 2, 3, ST[1]);
  parts.push(exhaust.ink());
  const turret = new Part(64, 56);
  turret.poly([[23, by - 1], [25, by - 5], [34, by - 5], [36, by - 1]], GM[1]).cel(GM, 0.3, -0.2);
  turret.rect(25, by - 8, 2, 3, ST[2]);
  turret.set(25, by - 9, "#ff4a3a");
  parts.push(turret.ink());
  parts.push(...inkLeg(37, by + 15, 39 + s, 55 - lift(Math.cos(t)), false));
  return { pix: compose(parts, 64, 56), anchor: { pivot: { x: 29, y: by - 3 }, seat: { x: 38, y: by + 4 } } };
}

export const GUN_ANGLES = 32;

export function muleGun(i) {
  const a = (i / GUN_ANGLES) * Math.PI * 2;
  const p = new Pix(45, 45);
  const c = 22;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  for (const s of [-1.5, 1.5]) p.limb(c + nx * s, c + ny * s, c + nx * s + dx * 17, c + ny * s + dy * 17, 2, R.steel, s > 0 ? -0.2 : 0);
  p.limb(c + dx * 14, c + dy * 14, c + dx * 18, c + dy * 18, 6, R.gunmetal);
  p.blob(c, c, 4.5, 4.5, R.gunmetal);
  p.selout();
  return { pix: p };
}

const RU = ["#ffad78", "#de6a3a", "#a8452d", "#6b2a28"];
const BR = ["#fff0a8", "#e6bc4f", "#b07f2c", "#6c4a24"];
const HOT = ["#fff8d0", "#ffd166", "#f4873b", "#c8452e"];
const DARK = "#1e1624";

function hole(part, cx, cy, rx, ry, fire) {
  part.ellipse(cx, cy, rx, ry, DARK);
  for (let i = 0; i < 6; i++) part.set(cx + Math.round(Math.cos(i) * (rx + 1)), cy + Math.round(Math.sin(i * 1.3) * (ry + 1)), DARK);
  if (fire) {
    part.ellipse(cx, cy + 1, rx * 0.5, ry * 0.4, HOT[2]);
    part.set(cx, cy, HOT[1]);
  }
}

export function wardenHull(stage) {
  const W = 192;
  const H = 120;
  const parts = [];
  const skirt = new Part(W, H);
  skirt.poly([[4, 88], [192, 88], [192, 100], [4, 100]], GM[1]).cel(GM, 0.3, -0.1);
  for (let x = 10; x < 190; x += 12) skirt.rect(x, 92, 2, 6, GM[2]);
  skirt.rect(4, 99, 188, 1, GM[3]);
  parts.push(skirt.ink());
  const catcher = new Part(W, H);
  for (let i = 0; i < 6; i++) catcher.limb(6 + i * 3, 99, 1 + i * 2, 113, 2, 2, ST[2]);
  catcher.rect(0, 112, 22, 2, GM[2]);
  parts.push(catcher.cel(ST, 0.3, -0.2).ink());
  const body = new Part(W, H);
  body.poly([[10, 42], [186, 42], [188, 88], [8, 88]], RU[1]).cel(RU, 0.35, -0.25);
  for (let x = 22; x < 184; x += 18) {
    body.rect(x, 46, 1, 40, RU[3]);
    body.dots([[x + 3, 47], [x + 3, 85], [x - 3, 47], [x - 3, 85]], BR[1]);
  }
  body.rect(10, 62, 176, 1, RU[3]);
  body.rect(10, 63, 176, 1, RU[0]);
  parts.push(body.ink());
  const deck = new Part(W, H);
  deck.poly([[8, 36], [188, 36], [188, 43], [8, 43]], GM[1]).cel(GM, 0.4, -0.2);
  for (let x = 12; x < 186; x += 8) deck.set(x, 39, GM[0]);
  parts.push(deck.ink());
  const stack = new Part(W, H);
  stack.poly([[131, 10], [151, 10], [149, 36], [133, 36]], GM[1]).cel(GM, 0.3, -0.2);
  for (let y = 14; y < 34; y += 6) stack.rect(132, y, 18, 2, ST[2]);
  stack.poly([[126, 3], [156, 3], [154, 10], [128, 10]], ST[1]).cel(ST, 0.3, -0.2);
  stack.rect(129, 4, 24, 1, ST[0]);
  if (stage > 1) stack.limb(130, 8, 150, 32, 3, 3, DARK);
  parts.push(stack.ink());
  const cab = new Part(W, H);
  cab.poly([[152, 16], [184, 16], [186, 36], [150, 36]], ST[1]).cel(ST, 0.3, -0.2);
  cab.rect(150, 14, 36, 3, GM[1]);
  for (let i = 0; i < 3; i++) {
    cab.rect(156 + i * 9, 20, 6, 7, HOT[1]);
    cab.rect(156 + i * 9, 20, 6, 2, HOT[0]);
    cab.rect(156 + i * 9, 26, 6, 1, HOT[2]);
  }
  parts.push(cab.ink());
  const grill = new Part(W, H);
  grill.poly([[14, 50], [38, 50], [38, 84], [14, 84]], GM[1]).cel(GM, 0.3, -0.2);
  for (let y = 54; y < 82; y += 4) grill.rect(16, y, 20, 1, GM[3]);
  parts.push(grill.ink());
  const lamp = new Part(W, H);
  lamp.ellipse(10, 66, 6, 6, BR[1]).cel(BR, 0.3, -0.2);
  lamp.ellipse(10, 66, 3, 3, "#fff8ec");
  parts.push(lamp.ink());
  if (stage > 0) {
    const d = new Part(W, H);
    hole(d, 64, 52, 6, 4, true);
    hole(d, 116, 76, 5, 3, false);
    parts.push(d);
  }
  if (stage > 1) {
    const d = new Part(W, H);
    hole(d, 46, 70, 8, 6, true);
    hole(d, 166, 58, 6, 5, true);
    parts.push(d);
  }
  return { pix: compose(parts, W, H), anchor: { turretA: { x: 34, y: 80 }, turretB: { x: 120, y: 80 }, core: { x: 77, y: 72 }, stack: { x: 141, y: 2 } } };
}

export function wardenWheel(frame) {
  const w = new Part(28, 28);
  w.ellipse(14, 14, 13, 13, GM[1]).cel(GM, 0.3, -0.25);
  w.ellipse(14, 14, 9, 9, ST[2]);
  const a = (frame / 4) * (Math.PI / 2);
  for (let k = 0; k < 6; k++) {
    const ang = a + (k * Math.PI) / 3;
    w.limb(14, 14, 14 + Math.cos(ang) * 9, 14 + Math.sin(ang) * 9, 2, 2, GM[2]);
  }
  w.ellipse(14, 14, 3, 3, BR[1]);
  w.set(13, 13, BR[0]);
  return { pix: compose([w.ink()], 28, 28) };
}

export function wardenTurret(broken) {
  const t = new Part(36, 26);
  if (!broken) {
    t.poly([[6, 12], [32, 12], [32, 26], [6, 26]], GM[1]).cel(GM, 0.3, -0.2);
    t.rect(6, 17, 26, 1, GM[3]);
    const dome = new Part(36, 26);
    dome.ellipse(20, 11, 11, 7, ST[1]).cel(ST, 0.3, -0.25);
    dome.ellipse(24, 8, 2, 2, "#ff4a3a");
    dome.set(23, 7, "#ffc4b8");
    const barrel = new Part(36, 26);
    barrel.rect(1, 9, 14, 5, ST[1]).cel(ST, 0.3, -0.2);
    barrel.rect(0, 8, 3, 7, GM[1]);
    return { pix: compose([t.ink(), dome.ink(), barrel.ink()], 36, 26), anchor: { muzzle: { x: 0, y: 11 } } };
  }
  t.poly([[6, 18], [32, 18], [32, 26], [6, 26]], GM[2]).cel(GM, 0.1, -0.1);
  t.limb(10, 18, 15, 12, 3, 2, ST[2]);
  t.limb(22, 18, 28, 14, 3, 2, ST[2]);
  t.ellipse(18, 21, 4, 2, HOT[2]);
  t.set(18, 21, HOT[1]);
  return { pix: compose([t.ink()], 36, 26), anchor: { muzzle: { x: 0, y: 11 } } };
}

export function wardenCore(state, frame = 0) {
  const frameP = new Part(36, 36);
  frameP.rect(2, 2, 32, 32, GM[1]).cel(GM, 0.3, -0.2);
  frameP.rect(5, 5, 26, 26, GM[3]);
  const inner = new Part(36, 36);
  if (state === "closed") {
    inner.rect(6, 6, 12, 24, ST[1]);
    inner.rect(18, 6, 12, 24, ST[2]);
    for (let y = 9; y < 28; y += 4) { inner.rect(7, y, 10, 1, ST[3]); inner.rect(19, y, 10, 1, GM[2]); }
    inner.rect(17, 6, 1, 24, DARK);
  } else if (state === "open") {
    inner.rect(6, 6, 24, 24, DARK);
    const ring = frame ? HOT : ["#ffe9a8", "#f4a23b", "#d8582e", "#8e2f2a"];
    inner.ellipse(18, 18, 9, 9, ring[2]);
    inner.ellipse(18, 18, 6, 6, ring[1]);
    inner.ellipse(17, 17, 3, 3, ring[0]);
    inner.rect(3, 6, 3, 24, ST[2]);
    inner.rect(30, 6, 3, 24, ST[3]);
  } else {
    inner.rect(6, 6, 24, 24, DARK);
    inner.limb(8, 10, 27, 27, 2, 2, ST[3]);
    inner.ellipse(19, 20, 4, 4, "#6e6273");
  }
  return { pix: compose([frameP.ink(), inner], 36, 36) };
}
