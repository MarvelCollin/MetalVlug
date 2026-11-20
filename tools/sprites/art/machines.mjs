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

export function wardenHull(stage) {
  const p = new Pix(192, 120);
  p.box(10, 40, 176, 56, R.rust);
  for (let x = 22; x < 186; x += 16) {
    p.rect(x, 44, 1, 48, R.rust[3]);
    rivets(p, x + 3, x + 3, 46, 1, R.brass);
    rivets(p, x + 3, x + 3, 88, 1, R.brass);
  }
  p.box(10, 36, 176, 6, R.gunmetal);
  p.box(4, 88, 188, 12, R.gunmetal);
  p.rect(4, 99, 188, 2, R.gunmetal[3]);
  for (let i = 0; i < 8; i++) p.limb(4 + i * 3, 100, 0 + i * 2, 112, 2, R.steel);
  p.box(130, 8, 22, 30, R.gunmetal);
  for (let y = 12; y < 36; y += 7) p.rect(130, y, 22, 2, R.steel[2]);
  p.box(126, 2, 30, 8, R.steel);
  p.box(150, 14, 36, 26, R.steel);
  p.box(154, 18, 28, 10, R.gunmetal, -0.3);
  for (let i = 0; i < 3; i++) p.box(157 + i * 9, 20, 6, 6, R.brass, 0.2);
  p.box(14, 52, 22, 30, R.gunmetal);
  for (let y = 56; y < 80; y += 4) p.rect(16, y, 18, 1, R.gunmetal[0]);
  p.blob(10, 64, 6, 6, R.brass);
  p.blob(10, 64, 3, 3, R.cream);
  if (stage > 0) {
    p.blob(70, 52, 8, 6, R.gunmetal, -0.6);
    p.line(64, 50, 76, 56, R.red[1], 2);
    p.blob(120, 74, 6, 5, R.gunmetal, -0.6);
  }
  if (stage > 1) {
    p.blob(40, 64, 10, 9, R.gunmetal, -0.7);
    p.line(128, 6, 150, 34, R.gunmetal[3], 3);
    p.blob(168, 60, 7, 6, R.gunmetal, -0.6);
  }
  p.selout();
  return { pix: p, anchor: { turretA: { x: 34, y: 80 }, turretB: { x: 120, y: 80 }, core: { x: 77, y: 72 }, stack: { x: 141, y: 2 } } };
}

export function wardenWheel(frame) {
  const p = new Pix(28, 28);
  p.blob(14, 14, 13, 13, R.gunmetal);
  p.blob(14, 14, 10, 10, R.steel, -0.2);
  const a = (frame / 4) * (Math.PI / 2);
  for (let k = 0; k < 6; k++) {
    const ang = a + (k * Math.PI) / 3;
    p.limb(14, 14, 14 + Math.cos(ang) * 9, 14 + Math.sin(ang) * 9, 2, R.gunmetal);
  }
  p.blob(14, 14, 3, 3, R.brass);
  p.selout();
  return { pix: p };
}

export function wardenTurret(broken) {
  const p = new Pix(36, 26);
  if (!broken) {
    p.box(6, 12, 26, 14, R.gunmetal);
    p.blob(20, 11, 11, 8, R.steel);
    p.box(0, 9, 14, 5, R.steel, 0.1);
    p.box(0, 8, 3, 7, R.gunmetal);
    p.blob(23, 8, 2, 2, R.red, 0.2);
    p.rect(8, 16, 22, 1, R.gunmetal[3]);
  } else {
    p.box(6, 18, 26, 8, R.gunmetal, -0.4);
    p.limb(10, 18, 16, 12, 3, R.steel, -0.3);
    p.limb(22, 18, 28, 14, 3, R.steel, -0.3);
    p.blob(18, 21, 4, 2, R.red, -0.5);
  }
  p.selout();
  return { pix: p, anchor: { muzzle: { x: 0, y: 11 } } };
}

export function wardenCore(state, frame = 0) {
  const p = new Pix(36, 36);
  p.box(2, 2, 32, 32, R.gunmetal);
  p.box(5, 5, 26, 26, R.steel, -0.2);
  if (state === "closed") {
    p.box(7, 7, 11, 22, R.steel);
    p.box(18, 7, 11, 22, R.steel, -0.15);
    for (let y = 10; y < 28; y += 4) { p.rect(8, y, 9, 1, R.steel[3]); p.rect(19, y, 9, 1, R.steel[3]); }
  } else if (state === "open") {
    p.box(7, 7, 22, 22, R.gunmetal, -0.6);
    const hot = frame ? ["#fff8d0", "#ffd166", "#f4873b", "#c8452e"] : ["#ffe9a8", "#f4a23b", "#d8582e", "#8e2f2a"];
    p.blob(18, 18, 9, 9, hot);
    p.box(3, 7, 4, 22, R.steel);
    p.box(29, 7, 4, 22, R.steel, -0.2);
  } else {
    p.box(7, 7, 22, 22, R.gunmetal, -0.7);
    p.limb(9, 10, 26, 26, 2, R.steel, -0.3);
    p.blob(19, 20, 4, 4, ["#a597a3", "#6e6273", "#4c4352", "#2f2833"]);
  }
  p.selout();
  return { pix: p };
}
