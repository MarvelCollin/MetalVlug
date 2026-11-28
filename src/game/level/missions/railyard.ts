import { GROUND_Y } from "../../../config/display";
import type { BlockDef, LevelData } from "../LevelData";

const G = GROUND_Y;

function car(x: number, w: number, stack = false): BlockDef[] {
  const out: BlockDef[] = [
    { x, y: G - 32, w, h: 24, kind: "decor", tile: "boxcar" },
    { x: x + 6, y: G - 8, w: 32, h: 8, kind: "decor", tile: "bogie" },
    { x: x + w - 38, y: G - 8, w: 32, h: 8, kind: "decor", tile: "bogie" },
    { x: x - 4, y: G - 41, w: w + 8, h: 9, kind: "oneWay", tile: "carroof" },
  ];
  if (stack) {
    out.push({ x: x + 16, y: G - 65, w: w - 32, h: 24, kind: "decor", tile: "boxcar" });
    out.push({ x: x + 12, y: G - 74, w: w - 24, h: 9, kind: "oneWay", tile: "carroof" });
  }
  return out;
}

export const RAILYARD: LevelData = {
  name: "railyard",
  label: "MISSION 2",
  title: "RUSTBELT RAILYARD",
  theme: "yard",
  music: "railyard",
  clock: true,
  lives: 3,
  tips: [],
  length: 4300,
  groundY: G,
  playerStart: 60,
  blocks: [
    { x: 0, y: G, w: 4300, h: 32, kind: "solid", tile: "track", fill: "gravel" },
    ...car(520, 96),
    { x: 900, y: G - 24, w: 48, h: 24, kind: "solid", tile: "crate" },
    { x: 924, y: G - 48, w: 24, h: 24, kind: "solid", tile: "crate" },
    ...car(1180, 128, true),
    ...car(1640, 96),
    { x: 2050, y: G - 24, w: 72, h: 24, kind: "solid", tile: "crate" },
    ...car(2380, 112),
    ...car(2720, 128, true),
    { x: 3160, y: G - 24, w: 48, h: 24, kind: "solid", tile: "crate" },
    ...car(3420, 96),
  ],
  props: [
    { type: "barrel", x: 460 },
    { type: "crate", x: 760, drop: "bombs" },
    { type: "barrel", x: 1120 },
    { type: "crate", x: 1500, drop: "ammo" },
    { type: "barrel", x: 1980 },
    { type: "crate", x: 2280, drop: "gem" },
    { type: "barrel", x: 2660 },
    { type: "crate", x: 3060, drop: "ration" },
    { type: "barrel", x: 3340 },
    { type: "crate", x: 3720, drop: "bombs" },
  ],
  hostages: [
    { x: 700, drop: "furnace" },
    { x: 1240, y: G - 74, drop: "gem" },
    { x: 1820, drop: "scatter" },
    { x: 2790, y: G - 74, drop: "lance" },
    { x: 3560, drop: "thumper" },
  ],
  mule: { x: 2160 },
  triggers: [
    { at: 0, spawns: [{ type: "grunt", x: 330, idle: "idle" }, { type: "bazooka", x: 560, y: G - 41, idle: "none", hold: true }] },
    { at: 300, lock: true, spawns: [
      { type: "shield", side: "right", delay: 0.2 },
      { type: "grunt", side: "right", delay: 0.9 },
      { type: "grunt", entry: "para", delay: 1.5 },
      { type: "rusher", side: "left", delay: 2.4 },
      { type: "lobber", side: "right", delay: 3 },
    ] },
    { at: 760, spawns: [{ type: "grunt", x: 1000, idle: "read" }, { type: "lobber", x: 1060, idle: "idle" }, { type: "rusher", side: "right", delay: 1.2 }] },
    { at: 1000, spawns: [{ type: "bazooka", x: 1260, y: G - 74, idle: "none", hold: true }, { type: "grunt", x: 1200, y: G - 41, idle: "idle", hold: true }, { type: "shield", side: "right", delay: 1.5 }] },
    { at: 1400, spawns: [{ type: "grunt", entry: "para", delay: 0 }, { type: "grunt", entry: "para", delay: 0.6 }, { type: "rusher", side: "right", delay: 1.2 }, { type: "bazooka", side: "right", delay: 2.2 }] },
    { at: 1700, lock: true, spawns: [
      { type: "shield", side: "right", delay: 0 },
      { type: "shield", side: "right", delay: 1.2 },
      { type: "lobber", x: 1690, y: G - 41, idle: "none", hold: true, delay: 0.4 },
      { type: "grunt", entry: "para", delay: 2 },
      { type: "rusher", side: "left", delay: 2.8 },
      { type: "bazooka", side: "right", delay: 3.4 },
      { type: "grunt", side: "right", delay: 4.2 },
    ] },
    { at: 2200, spawns: [{ type: "grunt", x: 2440, y: G - 41, idle: "idle", hold: true }, { type: "grunt", x: 2500, idle: "read" }, { type: "rusher", side: "right", delay: 1 }, { type: "rusher", side: "right", delay: 1.5 }] },
    { at: 2550, spawns: [{ type: "bazooka", x: 2830, y: G - 74, idle: "none", hold: true }, { type: "shield", side: "right", delay: 0.6 }, { type: "grunt", entry: "para", delay: 1.4 }, { type: "lobber", side: "right", delay: 2.2 }] },
    { at: 3000, lock: true, spawns: [
      { type: "bazooka", side: "right", delay: 0 },
      { type: "shield", side: "right", delay: 0.8 },
      { type: "grunt", entry: "para", delay: 1.4 },
      { type: "grunt", entry: "para", delay: 1.8 },
      { type: "rusher", side: "left", delay: 2.6 },
      { type: "shield", side: "right", delay: 3.4 },
      { type: "lobber", x: 3440, y: G - 41, idle: "none", hold: true, delay: 1 },
    ] },
    { at: 3400, spawns: [{ type: "grunt", x: 3650, idle: "idle" }, { type: "bazooka", x: 3700, idle: "idle" }, { type: "rusher", side: "right", delay: 1.4 }] },
  ],
  boss: { lockAt: 3916, stopX: 4180, type: "crawler" },
};
