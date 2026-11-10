import { C, Pix, R } from "../pix.mjs";

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

export function muleBody(frame, mode) {
  const p = new Pix(64, 56);
  const crouch = mode === "crouch" ? 7 : 0;
  const t = (frame / 6) * Math.PI * 2;
  const walk = mode === "walk";
  const bob = walk ? Math.round(Math.abs(Math.cos(t))) : 0;
  const by = 14 + crouch + bob;
  const s = walk ? Math.sin(t) * 8 : 0;
  const lift = (v) => (walk ? Math.max(0, v) * 4 : 0);
  muleLeg(p, 27, by + 15, 25 - s, 55 - lift(-Math.cos(t)), true);
  p.blob(32, by + 9, 21, 11, R.mule);
  p.box(12, by + 12, 40, 5, R.mule, -0.3);
  p.rect(13, by + 17, 38, 1, R.mule[3]);
  p.box(31, by + 1, 15, 8, R.glass);
  p.rect(33, by + 2, 4, 2, C.white);
  p.rect(31, by + 9, 15, 1, R.mule[3]);
  p.box(14, by + 4, 10, 6, R.mule, -0.15);
  p.rect(16, by + 6, 6, 1, R.mule[3]);
  rivets(p, 14, 48, by + 14, 5, R.brass);
  p.box(6, by + 7, 7, 8, R.gunmetal);
  p.blob(5, by + 9, 2.5, 3, R.steel);
  p.box(24, by - 5, 11, 5, R.gunmetal);
  p.rect(25, by - 8, 2, 3, R.steel[2]);
  p.px(25, by - 9, R.red[1]);
  p.rect(48, by + 10, 4, 2, R.red[1]);
  muleLeg(p, 37, by + 15, 39 + s, 55 - lift(Math.cos(t)), false);
  p.selout();
  return { pix: p, anchor: { pivot: { x: 29, y: by - 3 }, seat: { x: 38, y: by + 4 } } };
}

export function muleGun() {
  const p = new Pix(24, 10);
  p.blob(4, 5, 4, 4, R.gunmetal);
  p.box(7, 2, 15, 3, R.steel);
  p.box(7, 5, 15, 3, R.steel, -0.2);
  p.box(19, 1, 4, 8, R.gunmetal);
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
  return { pix: p, anchor: { turretA: { x: 56, y: 36 }, turretB: { x: 104, y: 36 }, core: { x: 92, y: 66 }, stack: { x: 141, y: 2 } } };
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
