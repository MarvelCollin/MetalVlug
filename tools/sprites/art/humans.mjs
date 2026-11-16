import { C, Pix, R } from "../pix.mjs";

export const S = 48;
const HX = 24;
const HY = 31;

const HAIR = ["#7a5a46", "#553b30", "#3b2826", "#251a1e"];
const AUBURN = ["#e08a5a", "#b65a3a", "#83392e", "#55242a"];

export const PAL = {
  pip: { kind: "pip", skin: R.skin, coat: R.teal, pants: R.slate, boot: R.leather, glove: R.leather, belt: R.leather },
  juno: { kind: "juno", skin: R.skin, coat: R.olive, pants: R.leather, boot: R.gunmetal, glove: R.leather, belt: R.leather },
  grunt: { kind: "grunt", skin: R.skin, coat: R.rust, pants: R.leather, boot: R.gunmetal, glove: R.gunmetal, belt: R.olive },
  lobber: { kind: "lobber", skin: R.skin, coat: R.rust, pants: R.olive, boot: R.gunmetal, glove: R.leather, belt: R.leather },
  rusher: { kind: "rusher", skin: R.skin, coat: R.rust, pants: R.slate, boot: R.gunmetal, glove: R.gunmetal, belt: R.leather },
  tinker: { kind: "tinker", skin: R.skin, coat: R.overall, pants: R.overall, boot: R.leather, glove: R.hardhat, belt: R.overall },
};

export function gait(frame, count = 8, stride = 7, lift = 4) {
  const t = (frame / count) * Math.PI * 2;
  return {
    front: { x: HX + stride * Math.sin(t), y: 47 - Math.max(0, lift * Math.cos(t)) },
    back: { x: HX - stride * Math.sin(t), y: 47 - Math.max(0, -lift * Math.cos(t)) },
    drop: Math.abs(Math.cos(t)) > 0.75 ? 1 : 0,
  };
}

export const POSE = {
  stand: { front: { x: 27, y: 47 }, back: { x: 21, y: 47 }, frontKnee: { x: 27, y: 39 }, backKnee: { x: 21, y: 39 }, drop: 0 },
  jump: { front: { x: 30, y: 43 }, back: { x: 19, y: 44 }, frontKnee: { x: 31, y: 36 }, backKnee: { x: 23, y: 38 }, drop: 0 },
  fall: { front: { x: 28, y: 46 }, back: { x: 18, y: 45 }, frontKnee: { x: 29, y: 39 }, backKnee: { x: 21, y: 39 }, drop: 0 },
  crouch: { front: { x: 31, y: 47 }, back: { x: 17, y: 47 }, frontKnee: { x: 33, y: 40 }, backKnee: { x: 21, y: 44 }, drop: 9 },
  kneel: { front: { x: 31, y: 47 }, back: { x: 14, y: 47 }, frontKnee: { x: 31, y: 39 }, backKnee: { x: 20, y: 47 }, drop: 8 },
  sit: { front: { x: 35, y: 47 }, back: { x: 33, y: 46 }, frontKnee: { x: 32, y: 38 }, backKnee: { x: 30, y: 39 }, drop: 7 },
};

export function crawlPose(frame, count = 6) {
  const s = Math.sin((frame / count) * Math.PI * 2) * 4;
  return { front: { x: 31 + s, y: 47 }, back: { x: 16 - s, y: 47 }, frontKnee: { x: 33 + s, y: 41 }, backKnee: { x: 21 - s, y: 45 }, drop: 10 };
}

function bootAt(p, x, y, ramp) {
  p.box(Math.round(x) - 2, Math.round(y) - 4, 8, 4, ramp);
  p.rect(Math.round(x) - 2, Math.round(y) - 1, 8, 1, ramp[3]);
}

export function drawLegs(p, pal, pose) {
  const hy = HY + pose.drop;
  const knee = (f, k) => k ?? { x: (HX + f.x) / 2 + 3, y: (hy + f.y) / 2 - 1 };
  const bk = knee(pose.back, pose.backKnee);
  const fk = knee(pose.front, pose.frontKnee);
  p.limb(HX - 2, hy, bk.x, bk.y, 5, pal.pants, -0.3);
  p.limb(bk.x, bk.y, pose.back.x, pose.back.y - 3, 4, pal.pants, -0.3);
  bootAt(p, pose.back.x, pose.back.y, pal.boot);
  p.limb(HX + 1, hy, fk.x, fk.y, 5, pal.pants);
  p.limb(fk.x, fk.y, pose.front.x, pose.front.y - 3, 4, pal.pants);
  bootAt(p, pose.front.x, pose.front.y, pal.boot);
  p.box(HX - 6, hy - 2, 12, 4, pal.pants);
  if (pal.kind !== "tinker") {
    p.box(HX - 6, hy - 3, 12, 2, pal.belt);
    p.rect(HX, hy - 3, 2, 2, R.brass[1]);
  }
}

function torso(p, pal, dy, flutter = 0) {
  const k = pal.kind;
  const y = 19 + dy;
  if (k === "grunt" || k === "lobber" || k === "rusher") {
    p.box(HX - 6, y, 13, 13, pal.coat);
    p.box(HX - 7, y + 11, 15, 5, pal.coat, -0.15);
    p.rect(HX + 2, y + 1, 1, 14, pal.coat[3]);
    p.px(HX + 4, y + 4, R.brass[1]).px(HX + 4, y + 8, R.brass[1]);
    p.box(HX - 6, y + 9, 13, 2, pal.belt);
    if (k === "lobber") {
      p.box(HX - 9, y + 8, 6, 7, R.leather);
      p.blob(HX - 7, y + 15, 2, 2, R.olive);
      p.blob(HX - 4, y + 15, 2, 2, R.olive);
    }
    return;
  }
  if (k === "tinker") {
    p.box(HX - 6, y, 13, 13, R.cream);
    p.box(HX - 5, y + 5, 11, 8, pal.coat);
    p.rect(HX - 4, y, 2, 6, pal.coat[2]);
    p.rect(HX + 3, y, 2, 6, pal.coat[2]);
    p.px(HX - 3, y + 6, R.brass[0]).px(HX + 4, y + 6, R.brass[0]);
    p.box(HX - 2, y + 7, 4, 3, pal.coat, -0.2);
    return;
  }
  if (k === "juno") {
    p.box(HX - 6, y, 13, 13, pal.coat);
    p.rect(HX + 2, y + 2, 1, 11, pal.coat[3]);
    p.line(HX + 5, y + 1, HX - 5, y + 11, R.leather[1], 2);
    for (let i = 0; i < 3; i++) p.blob(HX + 3 - i * 3, y + 3 + i * 3, 1.6, 1.6, R.red);
    p.box(HX - 6, y - 1, 13, 2, pal.coat, 0.2);
    return;
  }
  p.box(HX - 6, y, 13, 13, pal.coat);
  p.rect(HX + 2, y + 2, 1, 11, pal.coat[3]);
  p.box(HX - 5, y + 7, 4, 3, pal.coat, -0.2);
  p.line(HX - 5, y + 1, HX + 5, y + 11, R.leather[2], 2);
  p.px(HX - 5, y + 2, R.scarf[1]).px(HX - 4, y + 2, R.scarf[1]);
  p.limb(HX - 5, y, HX - 9, y + 4 + flutter, 3, R.scarf, -0.1);
  p.limb(HX - 9, y + 4 + flutter, HX - 11, y + 8 + flutter, 2, R.scarf, -0.25);
  p.box(HX - 6, y - 1, 13, 3, R.scarf);
  p.blob(HX + 5, y + 1, 2, 2, R.scarf);
}

function head(p, pal, dy, mood = "calm") {
  const k = pal.kind;
  const cx = HX;
  const cy = 12 + dy;
  if (k === "pip") {
    p.blob(cx - 3, cy, 4, 5, HAIR);
    p.blob(cx, cy, 5.5, 5.5, pal.skin);
    p.rect(cx - 5, cy - 1, 2, 5, HAIR[2]);
    p.blob(cx - 3, cy + 1, 1.5, 1.5, R.skin, -0.4);
    p.box(cx - 6, cy - 7, 12, 5, R.leather);
    p.box(cx + 3, cy - 3, 6, 2, R.leather, -0.25);
    p.blob(cx - 2, cy - 4, 2, 1.6, R.glass);
    p.blob(cx + 2, cy - 4, 2, 1.6, R.glass);
    p.px(cx - 3, cy - 5, C.white).px(cx + 1, cy - 5, C.white);
    p.rect(cx - 6, cy - 3, 12, 1, R.brass[2]);
  } else if (k === "juno") {
    p.limb(cx - 4, cy - 3, cx - 10, cy + 6 + (mood === "shout" ? 1 : 0), 4, AUBURN, -0.1);
    p.blob(cx - 2, cy - 1, 5, 5.5, AUBURN);
    p.blob(cx, cy, 5.5, 5.5, pal.skin);
    p.blob(cx - 1, cy - 4, 5.5, 3, AUBURN, 0.1);
    p.rect(cx - 6, cy - 3, 12, 2, R.red[1]);
    p.rect(cx - 6, cy - 3, 12, 1, R.red[0]);
    p.rect(cx - 8, cy - 2, 2, 1, R.red[2]);
  } else if (k === "grunt") {
    p.blob(cx, cy + 1, 5.5, 5, pal.skin);
    p.blob(cx, cy - 1, 7, 5.5, R.helmet, 0.1);
    p.rect(cx - 7, cy + 2, 15, 1, R.helmet[2]);
    p.rect(cx - 6, cy - 5, 4, 1, R.helmet[0]);
    p.rect(cx + 1, cy + 2, 6, 2, R.red[1]);
    p.rect(cx + 3, cy + 2, 2, 1, R.red[0]);
    p.rect(cx - 3, cy + 3, 1, 4, R.leather[2]);
  } else if (k === "lobber") {
    p.blob(cx, cy, 5.5, 5.5, pal.skin);
    p.box(cx - 6, cy - 6, 12, 4, R.olive);
    p.box(cx - 1, cy - 1, 8, 6, R.gunmetal);
    p.blob(cx + 2, cy, 1.6, 1.6, R.glass);
    p.blob(cx + 5, cy, 1.4, 1.6, R.glass);
    p.blob(cx + 6, cy + 4, 2, 2, R.steel);
  } else if (k === "rusher") {
    p.blob(cx, cy + 1, 5.5, 5.5, pal.skin);
    p.blob(cx, cy - 2, 6.5, 4, R.steel);
    p.rect(cx - 6, cy, 13, 2, R.red[1]);
    p.rect(cx - 9, cy + 1, 3, 1, R.red[2]);
    p.rect(cx + 2, cy + 3, 3, 1, C.ink);
    p.line(cx + 1, cy + 2, cx + 4, cy + 3, C.ink);
    p.rect(cx + 2, cy + 6, 4, 1, mood === "angry" ? C.white : R.skin[3]);
  } else if (k === "tinker") {
    p.blob(cx, cy, 5.5, 5.5, pal.skin);
    p.blob(cx, cy - 3, 6.5, 4, R.hardhat);
    p.box(cx - 8, cy - 1, 16, 2, R.hardhat, -0.2);
    p.blob(cx + 3, cy + 2, 1.8, 1.8, R.glass);
    p.px(cx + 3, cy + 2, C.ink);
    p.blob(cx + 2, cy + 5, 4, 2, R.beard);
    p.blob(cx - 2, cy + 5, 2.5, 2, R.beard, -0.2);
  }
  if (k === "pip" || k === "juno") {
    const ey = cy;
    p.rect(cx + 2, ey, 2, 2, C.white);
    p.rect(cx + 3, ey, 1, 2, C.ink);
    p.line(cx + 2, ey - 2, cx + 4, ey - 2, k === "juno" ? AUBURN[3] : HAIR[3]);
    p.px(cx + 6, ey + 1, pal.skin[2]);
    p.rect(cx + 2, ey + 4, 3, 1, mood === "shout" ? C.ink : pal.skin[3]);
  }
}

function arm(p, pal, sx, sy, ex, ey, hx, hy, back = false) {
  const bias = back ? -0.35 : 0;
  p.limb(sx, sy, ex, ey, 4, pal.coat, bias);
  p.limb(ex, ey, hx, hy, 3, pal.coat, bias);
  p.blob(hx, hy, 1.6, 1.6, pal.glove, bias);
}

function pistol(p, x, y, dir) {
  if (dir === "fwd") {
    p.box(x, y - 1, 8, 3, R.gunmetal);
    p.rect(x, y - 1, 7, 1, R.gunmetal[0]);
    p.box(x + 1, y + 2, 2, 3, R.leather);
    return { x: x + 8, y };
  }
  if (dir === "up") {
    p.box(x - 1, y - 8, 3, 8, R.gunmetal);
    p.rect(x - 1, y - 8, 1, 7, R.gunmetal[0]);
    p.box(x + 2, y - 2, 3, 2, R.leather);
    return { x, y: y - 9 };
  }
  p.box(x - 1, y, 3, 8, R.gunmetal);
  p.rect(x + 1, y, 1, 7, R.gunmetal[0]);
  p.box(x - 4, y + 1, 3, 2, R.leather);
  return { x, y: y + 9 };
}

function heavy(p, x, y, dir) {
  if (dir === "fwd") {
    p.box(x - 3, y - 2, 12, 5, R.gunmetal);
    p.box(x + 9, y - 1, 6, 3, R.gunmetal);
    for (let i = 0; i < 3; i++) p.px(x + 10 + i * 2, y, R.gunmetal[3]);
    p.blob(x + 1, y + 4, 3, 2.5, R.brass);
    p.box(x - 6, y - 1, 4, 3, R.leather);
    return { x: x + 15, y };
  }
  if (dir === "up") {
    p.box(x - 2, y - 11, 5, 12, R.gunmetal);
    p.box(x - 1, y - 17, 3, 6, R.gunmetal);
    for (let i = 0; i < 3; i++) p.px(x, y - 16 + i * 2, R.gunmetal[3]);
    p.blob(x + 4, y - 4, 2.5, 3, R.brass);
    return { x, y: y - 18 };
  }
  p.box(x - 2, y, 5, 11, R.gunmetal);
  p.box(x - 1, y + 11, 3, 6, R.gunmetal);
  p.blob(x - 4, y + 4, 2.5, 3, R.brass);
  return { x, y: y + 18 };
}

export function pipTorso(aim, weapon, recoil, pal = PAL.pip) {
  const p = new Pix(S, S);
  const r = recoil ? -2 : 0;
  const heavyGun = weapon === "heavy";
  let muzzle;
  if (aim === "fwd") {
    if (heavyGun) arm(p, pal, HX - 1, 22, HX + 3, 27, HX + 8 + r, 26, true);
    torso(p, pal, 0);
    head(p, pal, 0);
    muzzle = heavyGun ? heavy(p, HX + 8 + r, 24, "fwd") : pistol(p, HX + 8 + r, 23, "fwd");
    arm(p, pal, HX + 1, 21, HX + 5, 25, HX + 8 + r, 24);
  } else if (aim === "up") {
    torso(p, pal, 0);
    head(p, pal, 0);
    muzzle = heavyGun ? heavy(p, HX + 5, 14 - r, "up") : pistol(p, HX + 5, 14 - r, "up");
    arm(p, pal, HX + 1, 21, HX + 5, 18, HX + 5, 14 - r);
  } else {
    torso(p, pal, 0);
    head(p, pal, 0);
    muzzle = heavyGun ? heavy(p, HX + 4, 31 + r, "down") : pistol(p, HX + 4, 31 + r, "down");
    arm(p, pal, HX + 1, 21, HX + 4, 26, HX + 4, 31 + r);
  }
  p.selout();
  return { pix: p, anchor: { muzzle } };
}

export function pipKnife(frame, pal = PAL.pip) {
  const p = new Pix(S, S);
  torso(p, pal, 0, frame);
  head(p, pal, 0, frame === 1 ? "shout" : "calm");
  if (frame === 0) {
    arm(p, pal, HX + 1, 21, HX - 1, 15, HX - 2, 10);
    p.line(HX - 2, 9, HX - 4, 2, R.steel[0], 2);
  } else if (frame === 1) {
    arm(p, pal, HX + 1, 21, HX + 7, 22, HX + 12, 22);
    p.line(HX + 13, 21, HX + 22, 19, R.steel[0], 2);
    p.line(HX + 10, 12, HX + 22, 26, C.white, 1);
    p.line(HX + 12, 12, HX + 22, 23, R.glass[1], 1);
  } else {
    arm(p, pal, HX + 1, 21, HX + 5, 26, HX + 8, 29);
    p.line(HX + 9, 29, HX + 14, 34, R.steel[1], 2);
  }
  p.selout();
  return { pix: p };
}

export function pipThrow(frame, pal = PAL.pip) {
  const p = new Pix(S, S);
  torso(p, pal, 0);
  head(p, pal, 0);
  if (frame === 0) {
    arm(p, pal, HX - 2, 21, HX - 6, 16, HX - 7, 11);
    p.blob(HX - 7, 9, 2.5, 2.5, R.olive);
  } else if (frame === 1) {
    arm(p, pal, HX + 1, 21, HX + 3, 14, HX + 6, 11);
  } else {
    arm(p, pal, HX + 1, 21, HX + 7, 21, HX + 11, 21);
  }
  p.selout();
  return { pix: p };
}

export function pipLegs(pose, pal = PAL.pip) {
  const p = new Pix(S, S);
  drawLegs(p, pal, pose);
  p.selout();
  return { pix: p, anchor: { drop: pose.drop } };
}

function full(pal, pose, draw, mood) {
  const p = new Pix(S, S);
  const d = pose.drop;
  if (draw?.behind) draw.behind(p, d);
  drawLegs(p, pal, pose);
  torso(p, pal, d);
  head(p, pal, d, mood);
  if (draw?.front) draw.front(p, d);
  p.selout();
  return p;
}

export function deathFrames(pal, hitDraw) {
  const base = full(pal, POSE.stand, hitDraw);
  const lean = full(pal, POSE.fall, hitDraw);
  const frames = [{ pix: lean.rotated(-0.18, HX, 47) }];
  const steps = [0.5, 0.95, 1.35, Math.PI / 2];
  steps.forEach((a, i) => {
    const r = base.rotated(-a, HX, HY).shifted(4, Math.round((a / (Math.PI / 2)) * 11));
    frames.push({ pix: i === steps.length - 1 ? r.shifted(0, 1) : r });
  });
  frames.push({ pix: frames[frames.length - 1].pix.clone() });
  return frames;
}

function rifle(p, x, y, len = 18, dy = 0) {
  p.box(x, y + dy - 1, len, 3, R.wood);
  p.box(x + len - 8, y + dy - 2, 8, 2, R.gunmetal);
  p.box(x + 3, y + dy + 2, 3, 3, R.wood, -0.2);
}

export function gruntFrames() {
  const pal = PAL.grunt;
  const out = {};
  out.idle = [0, 1].map((f) => ({
    pix: full(pal, POSE.sit, {
      behind: (p, d) => p.box(HX - 10, 38, 16, 10, R.wood),
      front: (p, d) => {
        arm(p, pal, HX + 1, 21 + d, HX + 5, 26 + d, HX + 9, 24 + d);
        p.box(HX + 8, 21 + d - f, 4, 5, R.cream);
        p.rect(HX + 12, 22 + d - f, 1, 2, R.cream[2]);
        p.px(HX + 9, 18 + d - f * 2, R.cream[0]).px(HX + 10, 16 + d - f, R.cream[0]);
      },
    }),
  }));
  out.read = [0, 1].map((f) => ({
    pix: full(pal, POSE.sit, {
      behind: (p) => p.box(HX - 10, 38, 16, 10, R.wood),
      front: (p, d) => {
        p.box(HX + 2, 16 + d + f, 12, 10, R.cream);
        for (let i = 0; i < 4; i++) p.rect(HX + 4, 18 + d + f + i * 2, 8, 1, R.cream[3]);
        arm(p, pal, HX + 1, 21 + d, HX + 3, 25 + d, HX + 3, 22 + d + f);
      },
    }),
  }));
  out.alert = [0, 1].map((f) => ({
    pix: full(pal, f ? POSE.jump : POSE.stand, {
      front: (p, d) => {
        arm(p, pal, HX - 3, 21 + d, HX - 8, 15 + d, HX - 9, 10 + d - f);
        arm(p, pal, HX + 3, 21 + d, HX + 8, 15 + d, HX + 9, 10 + d - f);
      },
    }, "shout"),
  }));
  out.run = Array.from({ length: 8 }, (_, f) => ({
    pix: full(pal, gait(f), {
      front: (p, d) => {
        rifle(p, HX - 6, 25 + d, 18);
        arm(p, pal, HX + 1, 21 + d, HX + 3, 26 + d, HX + 6, 26 + d);
      },
    }),
  }));
  out.aim = [0].map(() => ({
    pix: full(pal, POSE.kneel, {
      front: (p, d) => {
        rifle(p, HX - 2, 23 + d, 22);
        arm(p, pal, HX + 1, 21 + d, HX + 5, 25 + d, HX + 9, 24 + d);
      },
    }),
  }));
  out.fire = [0].map(() => ({
    pix: full(pal, POSE.kneel, {
      front: (p, d) => {
        rifle(p, HX - 4, 23 + d, 22);
        arm(p, pal, HX + 1, 21 + d, HX + 4, 25 + d, HX + 7, 24 + d);
      },
    }),
  }));
  out.die = deathFrames(pal);
  return { frames: out, anchors: { aim_0: { muzzle: { x: HX + 20, y: 22 + POSE.kneel.drop } } } };
}

export function lobberFrames() {
  const pal = PAL.lobber;
  const out = {};
  out.idle = [0, 1].map((f) => ({
    pix: full(pal, POSE.crouch, {
      front: (p, d) => {
        arm(p, pal, HX + 1, 21 + d, HX + 4, 27 + d, HX - 4, 27 + d + f);
        p.blob(HX - 3, 29 + d + f, 2.5, 2.5, R.olive);
      },
    }),
  }));
  out.run = Array.from({ length: 8 }, (_, f) => ({
    pix: full(pal, gait(f), { front: (p, d) => arm(p, pal, HX + 1, 21 + d, HX + 4 - (f % 4), 26 + d, HX + 6 - (f % 4), 29 + d) }),
  }));
  out.throw = [0, 1, 2].map((f) => ({
    pix: full(pal, POSE.stand, {
      front: (p, d) => {
        if (f === 0) {
          arm(p, pal, HX - 2, 21 + d, HX - 7, 15 + d, HX - 8, 9 + d);
          p.blob(HX - 8, 7 + d, 2.5, 2.5, R.olive);
          p.px(HX - 8, 4 + d, R.red[0]);
        } else if (f === 1) arm(p, pal, HX + 1, 21 + d, HX + 4, 14 + d, HX + 7, 11 + d);
        else arm(p, pal, HX + 1, 21 + d, HX + 7, 21 + d, HX + 12, 22 + d);
      },
    }),
  }));
  out.die = deathFrames(pal);
  return { frames: out, anchors: { throw_1: { hand: { x: HX + 7, y: 11 } } } };
}

function blade(p, x, y, up) {
  if (up) p.limb(x, y, x - 3, y - 12, 3, R.steel);
  else p.limb(x, y, x + 12, y + 2, 3, R.steel);
  p.box(x - 1, y - 1, 3, 3, R.gunmetal);
}

export function rusherFrames() {
  const pal = PAL.rusher;
  const out = {};
  out.idle = [0, 1].map((f) => ({
    pix: full(pal, POSE.stand, {
      front: (p, d) => {
        blade(p, HX + 8, 26 + d, false);
        arm(p, pal, HX + 1, 21 + d, HX + 4, 25 + d, HX + 8, 26 + d);
        arm(p, pal, HX - 2, 21 + d, HX + 3, 26 + d, HX + 12 - f * 3, 27 + d, true);
      },
    }),
  }));
  out.run = Array.from({ length: 8 }, (_, f) => ({
    pix: full(pal, gait(f, 8, 8, 5), {
      front: (p, d) => {
        blade(p, HX + 6, 18 + d, true);
        arm(p, pal, HX + 1, 21 + d, HX + 4, 22 + d, HX + 6, 18 + d);
      },
    }, "angry"),
  }));
  out.slash = [0, 1, 2].map((f) => ({
    pix: full(pal, f === 1 ? gait(2, 8, 8, 0) : POSE.stand, {
      front: (p, d) => {
        if (f === 0) {
          arm(p, pal, HX - 2, 21 + d, HX - 6, 15 + d, HX - 7, 10 + d);
          blade(p, HX - 7, 10 + d, true);
        } else if (f === 1) {
          arm(p, pal, HX + 1, 21 + d, HX + 7, 23 + d, HX + 12, 24 + d);
          blade(p, HX + 12, 24 + d, false);
          p.line(HX + 10, 10 + d, HX + 24, 30 + d, C.white, 1);
          p.line(HX + 12, 10 + d, HX + 24, 26 + d, R.glass[1], 1);
        } else {
          arm(p, pal, HX + 1, 21 + d, HX + 5, 27 + d, HX + 8, 31 + d);
          blade(p, HX + 8, 31 + d, false);
        }
      },
    }, "angry"),
  }));
  out.die = deathFrames(pal);
  return { frames: out, anchors: {} };
}

export function tinkerFrames() {
  const pal = PAL.tinker;
  const out = {};
  out.sit = [0, 1].map((f) => ({
    pix: full(pal, POSE.sit, {
      front: (p, d) => {
        arm(p, pal, HX + 1, 21 + d, HX + 6, 25 + d, HX + 10, 29 + d);
        if (f) arm(p, pal, HX - 2, 21 + d, HX - 6, 16 + d, HX - 5, 11 + d, true);
      },
    }),
  }));
  out.cheer = [0, 1].map((f) => ({
    pix: full(pal, f ? POSE.jump : POSE.stand, {
      front: (p, d) => {
        arm(p, pal, HX - 3, 21 + d, HX - 8, 15 + d, HX - 9, 9 + d - f);
        arm(p, pal, HX + 3, 21 + d, HX + 8, 15 + d, HX + 9, 9 + d - f);
      },
    }),
  }));
  out.give = [0, 1].map((f) => ({
    pix: full(pal, POSE.stand, {
      front: (p, d) => {
        arm(p, pal, HX + 1, 21 + d, HX + 7, 24 + d, HX + 12 + f, 24 + d);
        p.box(HX + 11 + f, 20 + d, 5, 4, R.red);
      },
    }),
  }));
  out.run = Array.from({ length: 8 }, (_, f) => ({
    pix: full(pal, gait(f, 8, 8, 5), {
      front: (p, d) => {
        arm(p, pal, HX - 2, 21 + d, HX - 5, 25 + d, HX - 7 + (f % 4), 29 + d);
        arm(p, pal, HX + 2, 21 + d, HX + 5, 18 + d, HX + 8, 16 + d);
      },
    }),
  }));
  return { frames: out, anchors: {} };
}

export function cageFrames() {
  return [false, true].map((broken) => {
    const p = new Pix(40, 48);
    if (!broken) {
      p.box(0, 0, 40, 4, R.gunmetal);
      p.box(0, 44, 40, 4, R.gunmetal);
      for (let x = 2; x < 40; x += 6) p.box(x, 4, 3, 40, R.steel);
      p.box(15, 20, 10, 8, R.brass);
      p.rect(19, 23, 2, 3, R.brass[3]);
    } else {
      p.box(0, 44, 40, 4, R.gunmetal);
      p.box(2, 32, 3, 12, R.steel);
      p.box(35, 26, 3, 18, R.steel);
      p.limb(10, 43, 16, 36, 3, R.steel);
      p.limb(26, 43, 30, 39, 3, R.steel);
    }
    p.selout();
    return { pix: p };
  });
}
