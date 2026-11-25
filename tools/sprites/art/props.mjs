import { Part, compose, INK } from "./ink.mjs";

const WOOD = ["#e8bb82", "#b47c4c", "#7e5234", "#4c3128"];
const PLANK = ["#d9a76c", "#a06a40", "#70472e", "#452b24"];
const GM = ["#9aa3b4", "#5f6779", "#3d4456", "#24283a"];
const ST = ["#e6ebf2", "#b0b8c6", "#7a8394", "#4c5364"];
const BR = ["#fff0a8", "#e6bc4f", "#b07f2c", "#6c4a24"];
const RED = ["#ff9c8a", "#e24b3e", "#a62d36", "#64202e"];
const OLIVE = ["#c9d483", "#8f9c4a", "#5f6b34", "#3a4428"];
const SLATE = ["#a9b8d0", "#6b7fa0", "#475878", "#2c3850"];
const YEL = ["#fff3b0", "#f8d25a", "#d39c30", "#8f5f28"];
const STRAW = ["#fbe7a0", "#e2bf62", "#b38a3e", "#7a5a2e"];
const BURLAP = ["#e9d2a4", "#c4a571", "#937649", "#5e4a33"];
const TEAL = ["#b4f0d8", "#58bfae", "#33878c", "#20536a"];
const ORANGE = ["#ffd9a0", "#f4a23b", "#c8622e", "#7f3426"];
const GLASS = ["#e8fbff", "#8fd8ea", "#4d9ab8", "#2e5c7c"];
const CREAM = ["#fff8e4", "#efe0b9", "#c9b38a", "#8f7a60"];
const SAND = ["#efdcaa", "#c9ae78", "#9a8156", "#65553c"];

const GLYPH = {
  R: ["####", "#  #", "####", "# # ", "#  #"],
  S: [" ###", "#   ", " ## ", "   #", "### "],
  T: ["####", " ## ", " ## ", " ## ", " ## "],
  B: ["### ", "#  #", "### ", "#  #", "### "],
  F: ["####", "#   ", "### ", "#   ", "#   "],
  A: [" ## ", "#  #", "####", "#  #", "#  #"],
  L: ["#   ", "#   ", "#   ", "#   ", "####"],
};

function vshade(part, x0, x1, y0, y1, ramp) {
  const w = x1 - x0;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      if (!part.mask[y * part.pix.w + x]) continue;
      const t = (x - x0) / w;
      part.pix.px(x, y, t < 0.18 ? ramp[1] : t < 0.36 ? ramp[0] : t < 0.72 ? ramp[1] : ramp[2]);
    }
  return part;
}

function pickupCrate(letter, ramp, glyph) {
  const box = new Part(18, 18);
  box.rect(1, 3, 16, 14, ramp[1]).cel(ramp, 0.4, -0.3);
  box.rect(1, 3, 16, 2, ramp[0]);
  box.rect(1, 5, 16, 1, ramp[3]);
  box.rect(1, 15, 16, 2, ramp[2]);
  box.dots([[2, 4], [15, 4], [2, 15], [15, 15]], BR[1]);
  GLYPH[letter].forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== "#") return;
    box.set(7 + x, 8 + y, ramp[3]);
    box.set(6 + x, 7 + y, glyph);
  }));
  box.ink();
  const handle = new Part(18, 18);
  handle.rect(6, 1, 6, 1, GM[1]);
  handle.dots([[6, 2], [11, 2]], GM[2]);
  return { pix: compose([handle.ink(), box], 18, 18) };
}

export const items = {
  pick_R: [pickupCrate("R", OLIVE, BR[0])],
  pick_S: [pickupCrate("S", OLIVE, BR[0])],
  pick_T: [pickupCrate("T", OLIVE, BR[0])],
  pick_B: [pickupCrate("B", WOOD, "#ffffff")],
  pick_F: [pickupCrate("F", RED, "#ffffff")],
  pick_A: [pickupCrate("A", SLATE, BR[0])],
  pick_L: [pickupCrate("L", TEAL, "#ffffff")],
};

items.gem = [0, 1, 2, 3].map((f) => {
  const g = new Part(12, 12);
  g.poly([[3, 1], [9, 1], [11, 4], [6, 11], [1, 4]], GLASS[1]).cel(GLASS, 0.3, -0.3);
  g.rect(2, 4, 9, 1, GLASS[0]);
  g.limb(6, 4, 6, 10, 1, 1, GLASS[2]);
  const sparkle = [[4, 2], [8, 2], [9, 5], [3, 5]][f];
  g.set(sparkle[0], sparkle[1], "#ffffff");
  return { pix: compose([g.ink()], 12, 12) };
});

items.ration = [(() => {
  const tin = new Part(14, 12);
  tin.rect(1, 3, 12, 8, CREAM[1]).cel(CREAM, 0.3, -0.3);
  tin.rect(1, 3, 12, 3, RED[1]);
  tin.rect(1, 3, 12, 1, RED[0]);
  tin.ellipse(7, 8, 2.5, 1.5, WOOD[1]);
  tin.set(6, 7, WOOD[0]);
  return { pix: compose([tin.ink()], 14, 12) };
})()];

items.fuel = [(() => {
  const cap = new Part(14, 16);
  cap.rect(8, 1, 3, 3, GM[1]).cel(GM, 0.3, -0.2);
  const can = new Part(14, 16);
  can.poly([[1, 5], [4, 3], [12, 3], [12, 15], [1, 15]], RED[1]).cel(RED, 0.3, -0.3);
  can.rect(3, 9, 8, 4, BR[1]);
  can.rect(3, 9, 8, 1, BR[0]);
  can.limb(4, 10, 9, 12, 1, 1, RED[3]);
  can.rect(3, 6, 7, 1, RED[0]);
  return { pix: compose([cap.ink(), can.ink()], 14, 16) };
})()];

items.crate = [0, 1].map((dmg) => {
  const parts = [];
  const body = new Part(24, 24);
  body.rect(1, 1, 22, 22, PLANK[1]);
  for (let y = 2; y < 22; y++) {
    const row = Math.floor((y - 2) / 5);
    const top = (y - 2) % 5 === 0;
    const bottom = (y - 2) % 5 === 4;
    for (let x = 1; x < 23; x++) body.pix.px(x, y, top ? PLANK[0] : bottom ? PLANK[3] : (x * 7 + row * 3) % 11 === 0 ? PLANK[2] : PLANK[1]);
  }
  body.rect(1, 1, 22, 1, PLANK[0]);
  parts.push(body.ink());
  const frame = new Part(24, 24);
  frame.rect(1, 1, 22, 3, WOOD[1]);
  frame.rect(1, 20, 22, 3, WOOD[1]);
  frame.rect(1, 1, 3, 22, WOOD[1]);
  frame.rect(20, 1, 3, 22, WOOD[1]);
  frame.limb(4, 19, 19, 4, 3, 3, WOOD[1]);
  frame.cel(WOOD, 0.35, -0.3);
  frame.rect(2, 2, 20, 1, WOOD[0]);
  frame.rect(2, 2, 1, 20, WOOD[0]);
  frame.dots([[2, 2], [21, 2], [2, 21], [21, 21]], GM[0]);
  frame.dots([[3, 3], [20, 3], [3, 20], [20, 20]], GM[2]);
  if (dmg) {
    frame.ellipse(9, 9, 2.5, 2, INK);
    frame.ellipse(16, 15, 2, 2.5, INK);
    frame.dots([[7, 7], [11, 8], [10, 11], [14, 13], [18, 17], [15, 18]], PLANK[0]);
    frame.limb(12, 2, 15, 10, 1, 1, PLANK[3]);
    frame.limb(4, 15, 8, 20, 1, 1, PLANK[3]);
  }
  parts.push(frame.ink());
  return { pix: compose(parts, 24, 24) };
});

items.barrel = [(() => {
  const b = new Part(16, 22);
  b.poly([[2, 1], [14, 1], [15, 4], [15, 18], [14, 21], [2, 21], [1, 18], [1, 4]], RED[1]);
  vshade(b, 1, 16, 0, 22, RED);
  b.rect(2, 1, 12, 1, RED[0]);
  for (const y of [4, 17]) {
    for (let x = 1; x < 16; x++) if (b.mask[y * 16 + x]) b.pix.px(x, y, GM[1]);
    for (let x = 1; x < 16; x++) if (b.mask[(y + 1) * 16 + x]) b.pix.px(x, y + 1, GM[2]);
    b.set(4, y, GM[0]);
  }
  const label = new Part(16, 22);
  label.poly([[8, 7], [12, 11], [8, 15], [4, 11]], YEL[1]).cel(YEL, 0.3, -0.3);
  label.rect(8, 9, 1, 3, INK);
  label.set(8, 13, INK);
  return { pix: compose([b.ink(), label.ink()], 16, 22) };
})()];

export function cageFrames() {
  return [false, true].map((broken) => {
    const parts = [];
    const base = new Part(40, 48);
    base.rect(1, 42, 38, 5, GM[1]).cel(GM, 0.4, -0.2);
    base.rect(1, 42, 38, 1, GM[0]);
    for (let x = 4; x < 38; x += 8) base.dots([[x, 44]], BR[1]);
    parts.push(base.ink());
    if (!broken) {
      const bars = new Part(40, 48);
      for (const x of [8, 14, 20, 26, 32]) {
        bars.rect(x, 6, 1, 36, ST[0]);
        bars.rect(x + 1, 6, 1, 36, ST[2]);
        bars.rect(x + 2, 7, 1, 35, ST[3]);
      }
      bars.rect(4, 24, 32, 1, GM[2]);
      bars.rect(4, 25, 32, 1, GM[3]);
      parts.push(bars);
      const posts = new Part(40, 48);
      posts.rect(1, 1, 38, 5, GM[1]).cel(GM, 0.4, -0.2);
      posts.rect(1, 1, 38, 1, GM[0]);
      posts.rect(1, 5, 38, 1, GM[3]);
      posts.rect(1, 6, 3, 36, ST[1]).rect(36, 6, 3, 36, ST[1]);
      posts.rect(1, 6, 1, 36, ST[0]).rect(38, 6, 1, 36, ST[3]);
      for (let x = 4; x < 38; x += 8) posts.dots([[x, 3]], BR[1]);
      parts.push(posts.ink());
      const lock = new Part(40, 48);
      lock.ellipse(31, 29, 2.5, 2.5, ST[2]);
      lock.ellipse(31, 29, 1, 1, INK);
      lock.ink();
      const body = new Part(40, 48);
      body.rect(27, 30, 8, 7, BR[1]).cel(BR, 0.3, -0.3);
      body.rect(30, 32, 2, 2, INK);
      body.set(31, 34, INK);
      parts.push(lock, body.ink());
    } else {
      for (const [x0, y0, x1, y1] of [[4, 41, 3, 30], [10, 41, 16, 36], [27, 41, 31, 38], [35, 41, 36, 24]]) {
        const bar = new Part(40, 48);
        bar.limb(x0 + 1, y0, x1 + 1, y1, 3, 3, ST[1]).cel(ST, 0.3, -0.3);
        parts.push(bar.ink());
      }
      const debris = new Part(40, 48);
      debris.rect(18, 39, 6, 3, GM[1]).cel(GM, 0.3, -0.2);
      debris.rect(22, 37, 4, 3, BR[2]);
      parts.push(debris.ink());
    }
    return { pix: compose(parts, 40, 48) };
  });
}

function dummy(state, frame) {
  const parts = [];
  const post = new Part(32, 48);
  post.rect(14, 26, 4, 19, WOOD[1]).cel(WOOD, 0.3, -0.2, 0.2);
  post.rect(14, 26, 1, 19, WOOD[0]);
  const foot = new Part(32, 48);
  foot.poly([[8, 46], [10, 43], [22, 43], [24, 46]], WOOD[1]).cel(WOOD, 0.3, -0.3);
  if (state === "broken") {
    const tufts = new Part(32, 48);
    tufts.ellipse(9, 44, 5, 2.5, STRAW[1]).ellipse(22, 45, 4, 2, STRAW[1]).cel(STRAW, 0.2, -0.3);
    for (let i = 0; i < 5; i++) tufts.limb(5 + i * 2, 45, 3 + i * 3, 40 + (i % 2), 1, 1, STRAW[2]);
    const sack = new Part(32, 48);
    sack.poly([[18, 43], [27, 42], [29, 46], [17, 46]], BURLAP[1]).cel(BURLAP, 0.3, -0.3);
    post.rect(14, 26, 4, 3, WOOD[3]);
    post.dots([[14, 25], [16, 24], [17, 25]], WOOD[2]);
    parts.push(post.ink(), foot.ink(), tufts.ink(), sack.ink());
    return { pix: compose(parts, 32, 48) };
  }
  const lean = state === "hit" ? (frame ? 2 : -2) : 0;
  const arms = new Part(32, 48);
  arms.limb(5 + lean, 19, 27 + lean, 18, 3, 3, WOOD[1]).cel(WOOD, 0.3, -0.2);
  arms.ellipse(6 + lean, 19, 2.5, 2.5, STRAW[1]);
  arms.ellipse(26 + lean, 18, 2.5, 2.5, STRAW[1]);
  arms.dots([[4 + lean, 21], [6 + lean, 22], [27 + lean, 21]], STRAW[2]);
  const sack = new Part(32, 48);
  sack.poly([[11 + lean, 15], [21 + lean, 15], [23 + lean, 22], [21 + lean, 31], [11 + lean, 31], [9 + lean, 22]], BURLAP[1]).cel(BURLAP, 0.3, -0.3);
  for (const y of [18, 27]) sack.rect(10 + lean, y, 13, 1, BURLAP[3]);
  sack.dots([[12 + lean, 20], [14 + lean, 24], [19 + lean, 21], [17 + lean, 29]], BURLAP[2]);
  sack.ellipse(16 + lean, 23, 3.5, 3.5, "#ffffff");
  sack.ellipse(16 + lean, 23, 2.2, 2.2, RED[1]);
  sack.set(16 + lean, 23, "#ffffff");
  const head = new Part(32, 48);
  head.ellipse(16 + lean, 9, 6, 6, BURLAP[1]).cel(BURLAP, 0.3, -0.3);
  head.rect(13 + lean, 8, 2, 1, INK).rect(18 + lean, 8, 2, 1, INK);
  head.dots([[14 + lean, 12], [15 + lean, 13], [16 + lean, 12], [17 + lean, 13], [18 + lean, 12]], BURLAP[3]);
  head.rect(11 + lean, 14, 10, 1, BURLAP[3]);
  head.dots([[12 + lean, 3], [15 + lean, 2], [19 + lean, 3]], STRAW[1]);
  parts.push(post.ink(), foot.ink(), arms.ink(), sack.ink(), head.ink());
  return { pix: compose(parts, 32, 48) };
}

export const dummyFrames = {
  dummy_idle: [dummy("idle", 0)],
  dummy_hit: [dummy("hit", 0), dummy("hit", 1)],
  dummy_broken: [dummy("broken", 0)],
};

export const flagFrames = [0, 1, 2].map((f) => {
  const pole = new Part(24, 48);
  pole.rect(2, 4, 3, 43, ST[1]);
  pole.rect(2, 4, 1, 43, ST[0]);
  pole.rect(4, 4, 1, 43, ST[3]);
  pole.ellipse(3, 2, 2, 2, BR[1]);
  pole.set(2, 1, BR[0]);
  const cloth = new Part(24, 48);
  const pts = [];
  for (let x = 5; x <= 22; x++) pts.push([x, 5 + Math.round(Math.sin((x * 0.45) - f * 2.1) * 1.4)]);
  for (let x = 22; x >= 5; x--) pts.push([x, 17 + Math.round(Math.sin((x * 0.45) - f * 2.1) * 1.4)]);
  cloth.poly(pts, TEAL[1]);
  for (let x = 5; x <= 22; x++) {
    const fold = Math.sin(x * 0.45 - f * 2.1);
    for (let y = 0; y < 48; y++) if (cloth.mask[y * 24 + x]) cloth.pix.px(x, y, fold > 0.5 ? TEAL[0] : fold < -0.5 ? TEAL[2] : TEAL[1]);
  }
  cloth.ellipse(13, 11 + Math.round(Math.sin(13 * 0.45 - f * 2.1) * 1.4), 3, 3, ORANGE[1]);
  cloth.set(12, 10 + Math.round(Math.sin(13 * 0.45 - f * 2.1) * 1.4), ORANGE[0]);
  return { pix: compose([pole.ink(), cloth.ink()], 24, 48) };
});

export const sandbag = [(() => {
  const parts = [];
  for (const [bx, by] of [[-4, 1], [4, 1], [12, 1], [0, 6], [8, 6], [16, 6]]) {
    const bag = new Part(16, 12);
    bag.ellipse(bx + 4, by + 3, 4.5, 2.6, SAND[1]).cel(SAND, 0.2, -0.35);
    bag.set(bx + 4, by + 2, SAND[2]);
    parts.push(bag.ink());
  }
  return { pix: compose(parts, 16, 12) };
})()];
