import { GROUND_Y } from "../../../config/display";
import type { LevelData } from "../LevelData";

const G = GROUND_Y;

export const CAMP: LevelData = {
  name: "camp",
  label: "TRAINING",
  title: "BRIGADE YARD",
  theme: "camp",
  music: "training",
  clock: false,
  lives: 9,
  length: 2700,
  groundY: G,
  playerStart: 50,
  goalX: 2580,
  tips: [
    { x: 0, text: "ARROWS MOVE   K JUMPS" },
    { x: 170, text: "J SHOOTS. ONE TAP, ONE SHOT" },
    { x: 470, text: "JUMP THE SANDBAGS WITH K" },
    { x: 690, text: "STAND CLOSE AND PRESS J TO SLASH" },
    { x: 900, text: "L THROWS A BOMB OVER COVER" },
    { x: 1150, text: "HOLD UP TO AIM UP" },
    { x: 1350, text: "SHOOT OR TOUCH A CAGE TO FREE A TINKER" },
    { x: 1620, text: "WALK INTO THE MULE TO RIDE IT" },
    { x: 1830, text: "UP+K CLIMBS OUT. UP+K+J LAUNCHES IT" },
    { x: 2060, text: "LIVE FIRE! CLEAR THE YARD" },
    { x: 2380, text: "REACH THE FLAG" },
  ],
  blocks: [
    { x: 0, y: G, w: 2700, h: 32, kind: "solid", tile: "grass", fill: "dirt" },
    { x: 560, y: G - 24, w: 32, h: 24, kind: "solid", tile: "sandbag" },
    { x: 1000, y: G - 24, w: 32, h: 24, kind: "solid", tile: "sandbag" },
    { x: 1250, y: 112, w: 64, h: 7, kind: "oneWay", tile: "plank" },
    { x: 2150, y: G - 24, w: 32, h: 24, kind: "solid", tile: "sandbag" },
  ],
  props: [
    { type: "crate", x: 380, drop: "ration" },
    { type: "crate", x: 1540, drop: "bombs" },
    { type: "crate", x: 2300, drop: "gem" },
  ],
  hostages: [{ x: 1460, drop: "scatter" }],
  mule: { x: 1760 },
  triggers: [
    { at: 0, spawns: [{ type: "dummy", x: 300, idle: "none", hold: true }, { type: "dummy", x: 340, idle: "none", hold: true }] },
    { at: 420, spawns: [{ type: "dummy", x: 780, idle: "none", hold: true }, { type: "dummy", x: 820, idle: "none", hold: true }] },
    { at: 700, spawns: [{ type: "dummy", x: 1050, idle: "none", hold: true }] },
    { at: 950, spawns: [{ type: "dummy", x: 1282, y: 100, idle: "none", hold: true }] },
    { at: 1550, spawns: [{ type: "dummy", x: 1950, idle: "none", hold: true }, { type: "dummy", x: 1990, idle: "none", hold: true }, { type: "dummy", x: 2030, idle: "none", hold: true }] },
    { at: 1950, lock: true, spawns: [
      { type: "grunt", side: "right", delay: 0.4 },
      { type: "grunt", side: "right", delay: 1.4 },
      { type: "rusher", side: "right", delay: 2.4 },
      { type: "grunt", side: "left", delay: 3.2 },
    ] },
  ],
};
