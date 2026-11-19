import { Pix } from "../pix.mjs";
import {
  LOOKS, Part, STANCE, UPPER, bladeHeld, crawlStance, fullBody, grenade, playerKnife, playerLegs, playerThrow,
  playerTorso, rifle, runStance, satchel,
} from "./rig.mjs";

const CREAM = ["#fff8e4", "#efe0b9", "#c9b38a", "#8f7a60"];
const MUG = ["#ffffff", "#e6e1d6", "#b8ae9e", "#7d7366"];

function up(base, over) {
  return { ...base, ...over };
}

function deathFrames(look, kind) {
  const lean = fullBody(look, kind, STANCE.fall, up(UPPER.fwd, { bh: [22, 16], fh: [36, 16], be: [22, 22], fe: [34, 21] }), { mood: "shout" });
  const base = fullBody(look, kind, STANCE.stand, up(UPPER.fwd, { bh: [20, 22], fh: [36, 22], be: [21, 26], fe: [34, 25] }), { mood: "shout" });
  const frames = [{ pix: lean.rotated(-0.2, 24, 47) }];
  for (const [i, a] of [0.5, 0.95, 1.35, Math.PI / 2].entries()) {
    const r = base.rotated(-a, 24, 34).shifted(4, Math.round((a / (Math.PI / 2)) * 12));
    frames.push({ pix: i === 3 ? r.shifted(0, 1) : r });
  }
  frames.push({ pix: frames[frames.length - 1].pix.clone() });
  return frames;
}

export function playerFrames(kind) {
  const look = LOOKS[kind];
  const out = {};
  out.legs_stand = [playerLegs(look, kind, STANCE.stand)];
  out.legs_run = Array.from({ length: 8 }, (_, f) => playerLegs(look, kind, runStance(f)));
  out.legs_jump = [playerLegs(look, kind, STANCE.jump)];
  out.legs_fall = [playerLegs(look, kind, STANCE.fall)];
  out.legs_crouch = [playerLegs(look, kind, STANCE.crouch)];
  out.legs_crawl = Array.from({ length: 6 }, (_, f) => playerLegs(look, kind, crawlStance(f)));
  for (const weapon of ["pistol", "heavy"])
    for (const aim of ["fwd", "up", "down"]) out[`${weapon}_${aim}`] = [playerTorso(look, kind, aim, weapon, false), playerTorso(look, kind, aim, weapon, true)];
  out.knife = [0, 1, 2].map((f) => playerKnife(look, kind, f));
  out.throw = [0, 1, 2].map((f) => playerThrow(look, kind, f));
  out.die = deathFrames(look, kind);
  return out;
}

function mug(u, f) {
  const m = new Part();
  const [hx, hy] = u.fh;
  m.rect(hx - 1, hy - 4 - f, 4, 5, MUG[1]);
  m.rect(hx + 3, hy - 3 - f, 1, 2, MUG[2]);
  m.cel(MUG, 0.3, -0.2);
  m.ink();
  const steam = new Part();
  steam.dots([[hx, hy - 7 - f * 2], [hx + 1, hy - 9 - f]], CREAM[0]);
  return [m, steam];
}

function paper(u, f) {
  const p = new Part();
  const [hx, hy] = u.fh;
  p.rect(hx - 4, hy - 8 + f, 11, 10, CREAM[1]);
  for (let i = 0; i < 4; i++) p.rect(hx - 2, hy - 6 + f + i * 2, 7, 1, CREAM[3]);
  p.rect(hx - 4, hy - 8 + f, 11, 1, CREAM[0]);
  return [p.ink()];
}

const SIT_UP = up(UPPER.fwd, { chest: [25, 25], head: [27, 16], bs: [23, 27], be: [27, 31], bh: [31, 30], fs: [28, 27], fe: [31, 31], fh: [33, 29] });
const RIFLE_RUN = up(UPPER.fwd, { bs: [24, 27], be: [26, 31], bh: [31, 29], fs: [29, 27], fe: [30, 31], fh: [33, 28] });
const ARMS_UP = up(UPPER.fwd, { be: [22, 20], bh: [20, 13], fe: [34, 20], fh: [36, 13] });

function crate(u) {
  const c = new Part();
  c.rect(12, 38, 16, 10, "#a06c42");
  c.cel(["#d8a26a", "#a06c42", "#6c462e", "#442c22"], 0.3, -0.2);
  c.rect(12, 42, 16, 1, "#6c462e");
  return [c.ink()];
}

export function gruntFrames() {
  const look = LOOKS.grunt;
  const k = "grunt";
  const out = {};
  out.idle = [0, 1].map((f) => ({ pix: fullBody(look, k, STANCE.sit, SIT_UP, { behind: crate, held: (u) => mug(u, f) }) }));
  out.read = [0, 1].map((f) => ({ pix: fullBody(look, k, STANCE.sit, SIT_UP, { behind: crate, held: (u) => paper(u, f), frontArm: true }) }));
  out.alert = [0, 1].map((f) => ({ pix: fullBody(look, k, f ? STANCE.jump : STANCE.stand, ARMS_UP, { mood: "shout" }) }));
  out.run = Array.from({ length: 8 }, (_, f) => ({ pix: fullBody(look, k, runStance(f), RIFLE_RUN, { held: (u) => [rifle(u).part] }) }));
  out.aim = [{ pix: fullBody(look, k, STANCE.kneel, UPPER.fwd, { held: (u) => [rifle(u).part] }) }];
  out.fire = [{ pix: fullBody(look, k, STANCE.kneel, UPPER.fwd, { held: (u) => [rifle(u, -2).part], mood: "shout" }) }];
  out.die = deathFrames(look, k);
  const kneel = { ...UPPER.fwd };
  const dy = STANCE.kneel.hip[1] - 34;
  const muzzle = rifle({ fh: [kneel.fh[0], kneel.fh[1] + dy] }).muzzle;
  return { frames: out, anchors: { aim_0: { muzzle } } };
}

export function lobberFrames() {
  const look = LOOKS.lobber;
  const k = "lobber";
  const out = {};
  const rummage = (f) => up(UPPER.fwd, { fh: [18, 32 + f], fe: [22, 31], bh: [20, 33], be: [23, 31] });
  out.idle = [0, 1].map((f) => ({ pix: fullBody(look, k, STANCE.crouch, rummage(f), { behind: () => [satchel()], front: (u) => [grenade(u.fh[0], u.fh[1] + 1)] }) }));
  out.run = Array.from({ length: 8 }, (_, f) => ({ pix: fullBody(look, k, runStance(f), up(UPPER.fwd, { fh: [32, 31], fe: [29, 32], bh: [21, 31], be: [23, 31] }), { behind: () => [satchel()] }) }));
  out.throw = [
    { pix: fullBody(look, k, STANCE.stand, up(UPPER.fwd, { fh: [18, 12], fe: [20, 19] }), { behind: () => [satchel()], front: (u) => [grenade(u.fh[0], u.fh[1] - 2)] }) },
    { pix: fullBody(look, k, STANCE.stand, up(UPPER.fwd, { fh: [33, 13], fe: [30, 19] }), { behind: () => [satchel()] }) },
    { pix: fullBody(look, k, STANCE.stand, up(UPPER.fwd, { fh: [39, 26], fe: [34, 27] }), { behind: () => [satchel()] }) },
  ];
  out.die = deathFrames(look, k);
  return { frames: out, anchors: { throw_1: { hand: { x: 33, y: 13 } } } };
}

export function rusherFrames() {
  const look = LOOKS.rusher;
  const k = "rusher";
  const out = {};
  out.idle = [0, 1].map((f) => ({ pix: fullBody(look, k, STANCE.stand, up(UPPER.fwd, { fh: [33, 31 + f], fe: [30, 32] }), { held: (u) => [bladeHeld(u, false)], mood: "angry" }) }));
  out.run = Array.from({ length: 8 }, (_, f) => ({ pix: fullBody(look, k, runStance(f), up(UPPER.fwd, { fh: [31, 22], fe: [31, 28] }), { held: (u) => [bladeHeld(u, true)], mood: "angry" }) }));
  out.slash = [
    { pix: fullBody(look, k, STANCE.stand, up(UPPER.fwd, { fh: [20, 12], fe: [21, 19] }), { front: (u) => [bladeHeld(u, true)], mood: "angry" }) },
    { pix: fullBody(look, k, runStance(1), up(UPPER.fwd, { fh: [38, 28], fe: [34, 28] }), { front: (u) => [bladeHeld(u, false), slashArc()], mood: "angry" }) },
    { pix: fullBody(look, k, STANCE.stand, up(UPPER.fwd, { fh: [33, 36], fe: [31, 33] }), { front: (u) => [bladeHeld(u, false)], mood: "angry" }) },
  ];
  out.die = deathFrames(look, k);
  return { frames: out, anchors: {} };
}

function slashArc() {
  const a = new Part();
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    a.set(34 + t * 12, 12 + Math.sin(t * Math.PI) * 4 + t * 16, "#fff8ec");
  }
  return a;
}

export function tinkerFrames() {
  const look = LOOKS.tinker;
  const k = "tinker";
  const out = {};
  const hug = up(UPPER.fwd, { chest: [25, 26], head: [27, 17], be: [28, 32], bh: [32, 35], fe: [30, 32], fh: [33, 35] });
  out.sit = [0, 1].map((f) => ({ pix: fullBody(look, k, STANCE.sit, f ? up(hug, { fh: [33, 22], fe: [31, 28] }) : hug, {}) }));
  out.cheer = [0, 1].map((f) => ({ pix: fullBody(look, k, f ? STANCE.jump : STANCE.stand, up(ARMS_UP, { bh: [20, 12 - f], fh: [36, 12 - f] }), { mood: "shout" }) }));
  const toolbox = (u) => { const b = new Part(); b.rect(u.fh[0], u.fh[1] - 4, 6, 5, "#e24b3e"); b.cel(["#ff9c8a", "#e24b3e", "#a62d36", "#64202e"], 0.3, -0.2); return [b.ink()]; };
  out.give = [0, 1].map((f) => ({ pix: fullBody(look, k, STANCE.stand, up(UPPER.fwd, { fh: [36 + f, 26], fe: [32, 28] }), { front: toolbox }) }));
  out.run = Array.from({ length: 8 }, (_, f) => ({ pix: fullBody(look, k, runStance(f), up(UPPER.fwd, { fh: f < 4 ? [33, 24] : [20, 31], bh: f < 4 ? [20, 31] : [33, 24], fe: [30, 28], be: [24, 30] }), { mood: "shout" }) }));
  return { frames: out, anchors: {} };
}

export function cagedOverlay() {
  return new Pix(48, 48);
}
