import { C, Pix, R, rng, tone } from "../pix.mjs";

const one = (w, h, draw, outline = true) => {
  const p = new Pix(w, h);
  draw(p);
  if (outline) p.outline();
  return { pix: p };
};

export const fx = {
  bullet_e: [0, 1].map((f) => one(8, 8, (p) => { p.disc(4, 4, 3, f ? C.red : C.fire3); p.disc(4, 4, 1, C.fire1); })),
  bomb: [0, 1, 2, 3].map((f) => one(9, 9, (p) => { const a = (f / 4) * Math.PI * 2; p.blob(4, 4, 3, 3, R.olive); p.px(4 + Math.round(Math.cos(a) * 3), 4 + Math.round(Math.sin(a) * 3), R.steel[0]); })),
  shell: [one(10, 8, (p) => { p.blob(5, 4, 4, 3, R.steel); p.rect(1, 3, 2, 2, R.brass[1]); })],
  mortar: [one(9, 9, (p) => { p.blob(4, 4, 3.5, 3.5, R.gunmetal); p.px(3, 2, R.steel[0]); })],
  casing: [one(3, 2, (p) => p.rect(0, 0, 3, 2, C.yellow), false)],
  debris: [0, 1, 2].map((f) => one(5, 5, (p) => { p.rect(0, f % 2, 4 - f, 3, [C.greyD, C.brownL, C.rust][f]); })),
  excl: [one(7, 13, (p) => { p.box(2, 0, 3, 8, R.red); p.box(2, 10, 3, 3, R.red); })],
};

fx.flash = [0, 1].map((f) =>
  one(12, 12, (p) => {
    p.disc(6, 6, f ? 3 : 5, C.fire2);
    p.disc(6, 6, f ? 1 : 3, C.fire1);
    if (!f) { p.rect(0, 5, 12, 2, C.fire2); p.rect(5, 0, 2, 12, C.fire2); }
  }, false),
);

function boomFrame(size, f, total, seed) {
  const p = new Pix(size, size);
  const c = size / 2;
  const r = rng(seed);
  const t = f / (total - 1);
  const R = Math.round((c - 2) * (0.35 + 0.65 * Math.sin(Math.min(1, t * 1.4) * Math.PI * 0.5)));
  if (t < 0.85) {
    for (let k = 0; k < 7; k++) {
      const a = r() * Math.PI * 2;
      const d = r() * R * 0.6;
      const rr = Math.max(1, Math.round(R * (0.45 + r() * 0.3)));
      const col = t < 0.25 ? C.fire1 : t < 0.5 ? C.fire2 : t < 0.7 ? C.fire3 : C.fire4;
      p.disc(c + Math.cos(a) * d, c + Math.sin(a) * d, rr, col);
    }
    if (t < 0.6) p.disc(c, c, Math.round(R * 0.45), C.fire1);
  }
  if (t >= 0.45) {
    for (let k = 0; k < 6; k++) {
      const a = r() * Math.PI * 2;
      const d = R * (0.5 + r() * 0.5);
      p.disc(c + Math.cos(a) * d, c + Math.sin(a) * d - t * 4, Math.max(1, Math.round(R * 0.3 * (1.2 - t))), t > 0.8 ? C.smokeL : C.smoke);
    }
  }
  if (f === 0) p.ring(c, c, R, C.white);
  p.outline(C.ink);
  return { pix: p };
}

fx.boom = Array.from({ length: 8 }, (_, f) => boomFrame(48, f, 8, 7));
fx.boom_s = Array.from({ length: 6 }, (_, f) => boomFrame(24, f, 6, 3));
fx.spark = [0, 1, 2, 3].map((f) =>
  one(9, 9, (p) => {
    const d = f + 1;
    p.px(4, 4, C.fire1);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p.line(4 + dx * (d - 1), 4 + dy * (d - 1), 4 + dx * d, 4 + dy * d, f < 2 ? C.fire1 : C.fire2);
  }, false),
);
fx.smoke = [0, 1, 2, 3].map((f) => one(14, 14, (p) => { p.disc(7, 7, 3 + f, f < 2 ? C.smokeL : C.smoke, 230 - f * 40); }, false));
fx.blast = [0, 1, 2].map((f) =>
  one(56, 28, (p) => {
    const r = rng(11 + f);
    for (let k = 0; k < 40; k++) {
      const a = (r() - 0.5) * 0.9;
      const d = 6 + r() * (20 + f * 14);
      p.disc(4 + Math.cos(a) * d, 14 + Math.sin(a) * d, 1 + Math.round(r() * 2), f === 0 ? C.fire1 : f === 1 ? C.fire2 : C.fire3);
    }
  }, false),
);

fx.bar = [0, 1].map((f) => one(3, f ? 8 : 12, (p) => p.box(0, 0, 3, f ? 8 : 12, R.steel)));
fx.dust = [0, 1, 2, 3].map((f) =>
  one(20, 10, (p) => {
    const ramp = ["#f2e6d0", "#d9c8ad", "#b8a487", "#8f7e68"];
    const a = 240 - f * 50;
    for (const dx of [-1, 1]) p.blob(10 + dx * (3 + f * 2), 7 - Math.floor(f / 2), 2 + f * 0.6, 1.6 + f * 0.4, ramp, 0.3);
    for (let i = 0; i < p.data.length; i += 4) if (p.data[i + 3]) p.data[i + 3] = a;
  }, false),
);

export const ANGLES = 16;

function streak(size, len, thick, tail, head) {
  return Array.from({ length: ANGLES }, (_, i) => {
    const a = (i / ANGLES) * Math.PI * 2;
    const p = new Pix(size, size);
    const c = (size - 1) / 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    p.line(Math.round(c - dx * len / 2), Math.round(c - dy * len / 2), Math.round(c + dx * len / 2), Math.round(c + dy * len / 2), tail, thick);
    p.line(Math.round(c + dx * (len / 2 - 2)), Math.round(c + dy * (len / 2 - 2)), Math.round(c + dx * len / 2), Math.round(c + dy * len / 2), head, thick);
    return { pix: p };
  });
}

fx.bullet_p = streak(11, 6, 2, C.fire2, C.fire1);
fx.bullet_r = streak(13, 8, 2, C.fire3, C.fire1);
fx.bullet_v = streak(13, 7, 2, C.tealL, C.white);

fx.rocket = [0, 1].flatMap((f) =>
  Array.from({ length: ANGLES }, (_, i) => {
    const a = (i / ANGLES) * Math.PI * 2;
    const p = new Pix(17, 17);
    const c = 8;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    p.line(Math.round(c - dx * 4), Math.round(c - dy * 4), Math.round(c + dx * 3), Math.round(c + dy * 3), R.steel[1], 3);
    p.line(Math.round(c + dx * 3), Math.round(c + dy * 3), Math.round(c + dx * 5), Math.round(c + dy * 5), R.red[1], 2);
    p.line(Math.round(c - dx * 5), Math.round(c - dy * 5), Math.round(c - dx * (7 + f)), Math.round(c - dy * (7 + f)), C.fire2, 2);
    p.selout();
    return { pix: p };
  }),
);

fx.blast_up = fx.blast.map((f) => ({ pix: f.pix.rotated(-Math.PI / 2, 27.5, 13.5) }));

const CHUTE = ["#ffe6c4", "#e9b48a", "#c47a5a", "#8a4a3e"];
function chute(sway, fold) {
  const p = new Pix(32, 30);
  const cx = 16 + sway;
  const h = Math.max(2, 9 - fold * 3);
  const w = 14 - fold * 2;
  for (let y = 0; y < h; y++) {
    const half = Math.round(w * Math.sqrt(1 - ((h - y) / h) ** 2) + 1);
    for (let x = -half; x <= half; x++) {
      const stripe = Math.floor((x + 16) / 5) % 2 ? R.rust : CHUTE;
      p.px(cx + x, 2 + y + fold * 4, tone(stripe, 0.85 - y / (h * 1.6) - Math.abs(x) / 40, cx + x, y));
    }
  }
  if (fold < 2) for (const sx of [-w + 1, -4, 4, w - 1]) p.line(cx + sx, 2 + h + fold * 4, 16, 28, "#3f3346");
  p.selout();
  return { pix: p };
}
fx.chute = [chute(-1, 0), chute(0, 0), chute(1, 0)];
fx.chute_fold = [chute(0, 1), chute(0, 2), chute(0, 3)];
