import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { encodePng } from "./png.mjs";
import { headIcon } from "./art/rig.mjs";
import { bazookaFrames, gruntFrames, lobberFrames, playerFrames, rusherFrames, shieldFrames, tinkerFrames } from "./art/characters.mjs";
import { GUN_ANGLES, muleBody, muleGun, wardenCore, wardenHull, wardenTurret, wardenWheel } from "./art/machines.mjs";
import { fx } from "./art/fx.mjs";
import { BG_VARIANTS, background, hud, tiles } from "./art/world.mjs";
import { cageFrames, dummyFrames, flagFrames, items, sandbag } from "./art/props.mjs";
import { buildFont } from "./art/font.mjs";
import { campBackground, campTiles } from "./art/camp.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(root, "public", "assets");
mkdirSync(out, { recursive: true });

const frames = [];
const anchors = {};

function add(name, list) {
  list.forEach((f, i) => {
    const key = `${name}_${i}`;
    frames.push({ key, pix: f.pix });
    if (f.anchor) anchors[key] = f.anchor;
  });
}

for (const who of ["pip", "juno"]) for (const [anim, list] of Object.entries(playerFrames(who))) add(`${who}_${anim}`, list);

for (const [name, set] of [["grunt", gruntFrames()], ["lobber", lobberFrames()], ["rusher", rusherFrames()], ["bazooka", bazookaFrames()], ["shield", shieldFrames()], ["tinker", tinkerFrames()]]) {
  for (const [anim, list] of Object.entries(set.frames)) add(`${name}_${anim}`, list);
  for (const [key, anchor] of Object.entries(set.anchors)) anchors[`${name}_${key}`] = anchor;
  if (set.frames.die) add(`${name}_tumble`, Array.from({ length: 8 }, (_, k) => ({ pix: set.frames.die[0].pix.rotated((k * Math.PI) / 4, 24, 30) })));
}
add("cage", cageFrames());

add("mule_idle", [muleBody(0, "idle")]);
add("mule_walk", Array.from({ length: 6 }, (_, f) => muleBody(f, "walk")));
add("mule_crouch", [muleBody(0, "crouch")]);
add("mule_gun", Array.from({ length: GUN_ANGLES }, (_, i) => muleGun(i)));
add("warden_hull", [0, 1, 2].map(wardenHull));
add("warden_wheel", [0, 1, 2, 3].map(wardenWheel));
add("warden_turret", [wardenTurret(false), wardenTurret(true)]);
add("warden_core_closed", [wardenCore("closed")]);
add("warden_core_open", [wardenCore("open", 0), wardenCore("open", 1)]);
add("warden_core_broken", [wardenCore("broken")]);

for (const [name, list] of Object.entries(fx)) add(name, list);
for (const [name, list] of Object.entries(items)) add(name, list);
for (const [name, list] of Object.entries(tiles)) add(name, list);
for (const [name, list] of Object.entries(hud)) add(name, list);
for (const [name, list] of Object.entries(campTiles)) add(name, list);
add("sandbag", sandbag);
for (const kind of ["pip", "juno"]) add(`life_${kind}`, [{ pix: headIcon(kind) }]);
add("tinkericon", [{ pix: headIcon("tinker") }]);
for (const [name, list] of Object.entries(dummyFrames)) add(name, list);
add("flag", flagFrames);

const PAD = 2;
const WIDTH = 1024;
frames.sort((a, b) => b.pix.h - a.pix.h || b.pix.w - a.pix.w);
let x = PAD;
let y = PAD;
let row = 0;
for (const f of frames) {
  if (x + f.pix.w + PAD > WIDTH) {
    x = PAD;
    y += row + PAD;
    row = 0;
  }
  f.x = x;
  f.y = y;
  x += f.pix.w + PAD;
  row = Math.max(row, f.pix.h);
}
const height = 2 ** Math.ceil(Math.log2(y + row + PAD));
const atlas = new Uint8ClampedArray(WIDTH * height * 4);
const json = { frames: {}, meta: { image: "atlas.png", size: { w: WIDTH, h: height }, scale: "1" } };
for (const f of frames) {
  for (let j = 0; j < f.pix.h; j++)
    for (let i = 0; i < f.pix.w; i++) {
      const s = (j * f.pix.w + i) * 4;
      const d = ((f.y + j) * WIDTH + f.x + i) * 4;
      for (let k = 0; k < 4; k++) atlas[d + k] = f.pix.data[s + k];
    }
  json.frames[f.key] = {
    frame: { x: f.x, y: f.y, w: f.pix.w, h: f.pix.h },
    rotated: false,
    trimmed: false,
    spriteSourceSize: { x: 0, y: 0, w: f.pix.w, h: f.pix.h },
    sourceSize: { w: f.pix.w, h: f.pix.h },
  };
}
writeFileSync(join(out, "atlas.png"), encodePng(WIDTH, height, atlas));
writeFileSync(join(out, "atlas.json"), JSON.stringify(json));
writeFileSync(join(out, "anchors.json"), JSON.stringify(anchors, null, 1));

for (const kind of ["sky", "far", "mid"]) {
  for (const [theme, make] of [["harbour", background], ["camp", campBackground]]) {
    for (let v = 0; v < BG_VARIANTS; v++) {
      const p = make(kind, v);
      writeFileSync(join(out, `bg_${kind}_${theme}_${v}.png`), encodePng(p.w, p.h, p.data));
    }
  }
}

const font = buildFont();
writeFileSync(join(out, "font.png"), encodePng(font.pix.w, font.pix.h, font.pix.data));
const big = buildFont(true);
writeFileSync(join(out, "font_big.png"), encodePng(big.pix.w, big.pix.h, big.pix.data));
writeFileSync(join(out, "font.json"), JSON.stringify({ cellW: font.cellW, cellH: font.cellH, chars: font.chars, bigW: big.cellW, bigH: big.cellH }));

console.log(`atlas ${WIDTH}x${height}, ${frames.length} frames`);
