import { C, Pix, R, rng, tone } from "../pix.mjs";

const GLYPH = {
  R: ["####", "#  #", "####", "# # ", "#  #"],
  S: [" ###", "#   ", " ## ", "   #", "### "],
  T: ["####", " ## ", " ## ", " ## ", " ## "],
  B: ["### ", "#  #", "### ", "#  #", "### "],
  F: ["####", "#   ", "### ", "#   ", "#   "],
  A: [" ## ", "#  #", "####", "#  #", "#  #"],
};

function crateIcon(letter, ramp, glyphColor) {
  const p = new Pix(18, 18);
  p.box(1, 2, 16, 15, ramp);
  p.rect(1, 2, 16, 1, ramp[0]);
  p.rect(1, 15, 16, 2, ramp[3]);
  p.rect(2, 3, 1, 12, ramp[0]);
  GLYPH[letter].forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== "#") return;
    p.px(7 + x, 7 + y, R.gunmetal[3]);
    p.px(6 + x, 6 + y, glyphColor);
  }));
  p.selout();
  return { pix: p };
}

export const items = {
  pick_R: [crateIcon("R", R.olive, R.brass[0])],
  pick_S: [crateIcon("S", R.olive, R.brass[0])],
  pick_T: [crateIcon("T", R.olive, R.brass[0])],
  pick_B: [crateIcon("B", R.wood, C.white)],
  pick_F: [crateIcon("F", R.red, C.white)],
  pick_A: [crateIcon("A", R.slate, R.brass[0])],
};

items.gem = [0, 1, 2, 3].map((f) => {
  const p = new Pix(12, 12);
  p.box(3, 1, 6, 3, R.glass, 0.2);
  p.box(1, 4, 10, 3, R.glass);
  p.box(3, 7, 6, 2, R.glass, -0.2);
  p.rect(5, 9, 2, 2, R.glass[3]);
  p.px(3 + f, 2, C.white).px(2 + f, 5, C.white);
  p.selout();
  return { pix: p };
});

items.ration = [(() => {
  const p = new Pix(14, 12);
  p.box(1, 3, 12, 8, R.cream);
  p.box(1, 3, 12, 3, R.red);
  p.blob(7, 8, 2.5, 1.5, R.wood);
  p.selout();
  return { pix: p };
})()];

items.fuel = [(() => {
  const p = new Pix(14, 16);
  p.box(1, 3, 12, 12, R.red);
  p.box(8, 0, 4, 4, R.gunmetal);
  p.rect(3, 6, 8, 1, R.red[0]);
  p.rect(3, 9, 8, 4, R.brass[1]);
  p.selout();
  return { pix: p };
})()];

items.crate = [0, 1].map((dmg) => {
  const p = new Pix(24, 24);
  p.box(0, 0, 24, 24, R.wood);
  for (let y = 4; y < 22; y += 5) p.rect(2, y, 20, 1, R.wood[2]);
  p.box(0, 0, 24, 3, R.wood, 0.15);
  p.box(0, 21, 24, 3, R.wood, -0.2);
  p.box(0, 0, 3, 24, R.wood, -0.1);
  p.box(21, 0, 3, 24, R.wood, -0.25);
  p.limb(3, 3, 20, 20, 3, R.wood, -0.15);
  for (const [x, y] of [[1, 1], [22, 1], [1, 22], [22, 22]]) p.px(x, y, R.brass[1]);
  if (dmg) { p.blob(8, 9, 3, 2, R.wood, -0.9); p.blob(16, 16, 2, 3, R.wood, -0.9); p.line(10, 4, 14, 12, R.wood[3]); }
  p.selout();
  return { pix: p };
});

items.barrel = [(() => {
  const p = new Pix(16, 22);
  p.box(1, 0, 14, 22, R.red);
  p.box(1, 3, 14, 2, R.gunmetal);
  p.box(1, 16, 14, 2, R.gunmetal);
  p.box(5, 7, 6, 6, R.hardhat);
  p.line(7, 8, 9, 11, C.ink);
  p.selout();
  return { pix: p };
})()];

export const tiles = {};

tiles.dock = [(() => {
  const p = new Pix(16, 16);
  p.box(0, 0, 16, 5, R.wood, 0.1);
  p.rect(0, 0, 16, 1, R.wood[0]);
  p.box(0, 5, 16, 11, R.wood, -0.35);
  p.rect(7, 5, 1, 11, R.wood[3]);
  p.rect(15, 5, 1, 11, R.wood[3]);
  p.rect(0, 10, 16, 1, R.wood[3]);
  p.px(3, 2, R.gunmetal[1]).px(11, 2, R.gunmetal[1]);
  p.rect(2, 7, 3, 1, R.wood[2]);
  p.rect(10, 12, 3, 1, R.wood[2]);
  return { pix: p };
})()];

tiles.fill = [(() => {
  const p = new Pix(16, 16);
  p.rect(0, 0, 16, 16, "#2c2330");
  p.box(2, 0, 5, 16, R.wood, -0.55);
  p.box(10, 0, 5, 16, R.wood, -0.55);
  p.rect(0, 6, 16, 2, R.wood[3]);
  return { pix: p };
})()];

tiles.plank = [(() => {
  const p = new Pix(16, 7);
  p.box(0, 0, 16, 4, R.wood, 0.15);
  p.rect(0, 0, 16, 1, R.wood[0]);
  p.box(0, 4, 16, 3, R.wood, -0.4);
  p.box(2, 4, 2, 3, R.gunmetal);
  p.box(12, 4, 2, 3, R.gunmetal);
  return { pix: p };
})()];

tiles.brick = [(() => {
  const p = new Pix(16, 16);
  const brick = ["#b06a55", "#8c4f45", "#6c3a3c", "#472632"];
  for (let row = 0; row < 4; row++) {
    const o = row % 2 ? 4 : 0;
    for (let x = -o; x < 16; x += 8) p.box(x, row * 4, 7, 3, brick);
  }
  for (let y = 3; y < 16; y += 4) p.rect(0, y, 16, 1, "#3a2630");
  return { pix: p };
})()];

tiles.roof = [(() => {
  const p = new Pix(16, 9);
  for (let x = 0; x < 16; x += 4) p.box(x, 0, 4, 8, R.teal, -0.2);
  p.rect(0, 0, 16, 1, R.teal[0]);
  p.rect(0, 8, 16, 1, R.teal[3]);
  return { pix: p };
})()];

tiles.rail = [(() => {
  const p = new Pix(16, 16);
  p.rect(0, 0, 16, 16, "#3a3140");
  p.box(0, 3, 16, 3, R.steel, 0.2);
  p.rect(0, 2, 16, 1, R.steel[0]);
  p.box(1, 6, 5, 10, R.wood, -0.45);
  p.box(9, 6, 5, 10, R.wood, -0.45);
  for (let x = 0; x < 16; x += 3) p.px(x, 15, "#5a4c58");
  return { pix: p };
})()];

export const hud = {
  life: [(() => { const p = new Pix(10, 10); p.blob(5, 6, 4, 4, R.skin); p.box(1, 1, 8, 3, R.leather); p.blob(4, 3, 1.2, 1, R.glass); p.blob(7, 3, 1.2, 1, R.glass); p.selout(); return { pix: p }; })()],
  bombicon: [(() => { const p = new Pix(9, 10); p.blob(4, 6, 3.5, 3.5, R.olive); p.rect(4, 1, 1, 2, R.steel[1]); p.px(5, 0, R.brass[0]); p.selout(); return { pix: p }; })()],
  tinkericon: [(() => { const p = new Pix(10, 10); p.blob(5, 6, 4, 3.5, R.skin); p.blob(5, 3, 4.5, 2.5, R.hardhat); p.blob(5, 8, 3, 1.5, R.beard); p.selout(); return { pix: p }; })()],
  go: [0, 1].map((f) => { const p = new Pix(34, 18); const ramp = f ? R.hardhat : R.red; p.box(0, 6, 20, 6, ramp); for (let i = 0; i < 9; i++) p.box(20 + i, i, 1, 18 - i * 2, ramp); p.selout(); return { pix: p }; }),
  hud_cursor: [(() => { const p = new Pix(7, 9); for (let i = 0; i < 4; i++) p.box(i, i, 1, 9 - i * 2, R.hardhat); p.selout(); return { pix: p }; })()],
  armour: [0, 1].map((f) => { const p = new Pix(8, 6); p.box(0, 0, 8, 6, f ? R.olive : R.red); p.selout(); return { pix: p }; }),
};

function skyBand(p, y0, y1, colors, r) {
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / (y1 - y0);
    for (let x = 0; x < p.w; x++) p.px(x, y, tone(colors, 1 - t, x, y));
  }
}

function cloud(p, cx, cy, w, r) {
  const hi = ["#fff6e6", "#fbe3c8", "#efc3a8", "#d99c94"];
  for (let k = 0; k < Math.max(3, Math.floor(w / 9)); k++) {
    const x = cx + (k / Math.max(1, Math.floor(w / 9) - 1)) * w;
    const rr = 5 + r() * 6;
    p.blob(Math.round(x), Math.round(cy - r() * 4), rr, rr * 0.6, hi, 0.2);
  }
}

export function background(kind) {
  const W = kind === "sky" ? 384 : 512;
  const H = 216;
  const p = new Pix(W, H);
  const r = rng(kind.length * 131 + 7);
  if (kind === "sky") {
    skyBand(p, 0, 120, ["#fde2b4", "#f7c491", "#ea9f84", "#c97f8f"], r);
    skyBand(p, 120, 168, ["#fde9c4", "#fbd6a4", "#f2b78f", "#e39a86"], r);
    p.blob(286, 132, 30, 30, ["#fffbe9", "#fff0c4", "#ffe09c", "#ffd07a"], 0.4);
    for (let k = 0; k < 7; k++) cloud(p, Math.floor(r() * W), 24 + Math.floor(r() * 80), 30 + Math.floor(r() * 50), r);
    skyBand(p, 168, 216, ["#6f8fae", "#56769a", "#435f84", "#33496c"], r);
    for (let k = 0; k < 90; k++) {
      const y = 168 + Math.floor(r() * 48);
      p.rect(Math.floor(r() * W), y, 4 + Math.floor(r() * 18), 1, y < 180 ? "#ffe2b0" : "#8fb0cc");
    }
    return p;
  }
  if (kind === "far") {
    const hill = ["#b58fa0", "#a07d93", "#8c6c86", "#785c79"];
    for (let x = 0; x < W; x++) {
      const h = 22 + Math.round(Math.sin(x * 0.018) * 8 + Math.sin(x * 0.051 + 1) * 4);
      for (let y = 172 - h; y < 172; y++) p.px(x, y, tone(hill, 0.75 - (y - (172 - h)) / 60, x, y));
    }
    const sil = ["#9a7a92", "#876a84", "#745b76", "#614c68"];
    for (const cx of [70, 270, 450]) {
      p.box(cx, 64, 6, 108, sil);
      p.box(cx - 34, 62, 80, 5, sil);
      for (let i = 0; i < 9; i++) p.line(cx - 32 + i * 8, 67, cx - 28 + i * 8, 62, sil[2]);
      p.line(cx + 3, 64, cx + 40, 64, sil[3]);
      p.rect(cx + 38, 67, 1, 36, sil[3]);
      p.box(cx + 34, 103, 9, 6, sil);
      p.box(cx - 6, 150, 18, 22, sil);
    }
    p.box(150, 118, 84, 54, sil);
    p.box(162, 98, 14, 20, sil);
    p.box(190, 104, 12, 14, sil);
    for (let x = 156; x < 230; x += 8) p.rect(x, 126, 4, 3, "#c79aa0");
    p.box(340, 56, 12, 116, sil);
    p.box(336, 48, 20, 10, sil);
    p.box(340, 42, 12, 6, ["#fffbe0", "#ffeaa0", "#ffd166", "#f4a23b"]);
    return p;
  }
  const wall = ["#a0707a", "#87606c", "#6e4f5e", "#563f4f"];
  const roof = ["#8fc0bf", "#6a9ea3", "#4f7c86", "#3a5b68"];
  let x = 0;
  while (x < W) {
    const w = 64 + Math.floor(r() * 56);
    const h = 52 + Math.floor(r() * 44);
    const top = 178 - h;
    p.box(x, top, w, h, wall);
    for (let by = top + 4; by < 178; by += 4) for (let bx = x + ((by / 4) % 2 ? 0 : 3); bx < x + w; bx += 7) p.px(bx, by, wall[3]);
    p.box(x - 3, top - 6, w + 6, 7, roof);
    for (let wy = top + 10; wy < 162; wy += 16)
      for (let wx = x + 9; wx < x + w - 12; wx += 15) {
        const lit = r() > 0.72;
        p.box(wx, wy, 8, 9, lit ? ["#fff4c4", "#ffe08a", "#f4b860", "#c98a4c"] : ["#5d4a5c", "#4a3b4c", "#3a2f3e", "#2a2230"]);
        p.rect(wx + 3, wy, 1, 9, wall[3]);
      }
    if (r() > 0.4) { p.box(x + w - 18, top - 24, 8, 18, wall, -0.2); p.blob(x + w - 14, top - 28, 4, 3, ["#c9bcc6", "#a99aa8", "#8a7c8a", "#6c5f6e"]); }
    if (r() > 0.6) { p.box(x + 8, top + 18, 3, h - 18, ["#a8b0be", "#848c9c", "#646b7c", "#474c5c"]); }
    x += w + 8 + Math.floor(r() * 16);
  }
  for (let cx = 6; cx < W; cx += 80 + Math.floor(r() * 60)) {
    const colors = [R.rust, R.teal, R.olive, R.slate];
    const col = colors[Math.floor(r() * colors.length)];
    p.box(cx, 150, 40, 28, col, -0.25);
    for (let k = 3; k < 40; k += 5) p.rect(cx + k, 152, 1, 24, col[3]);
    if (r() > 0.5) { p.box(cx + 6, 126, 34, 24, colors[Math.floor(r() * colors.length)], -0.2); }
  }
  return p;
}
