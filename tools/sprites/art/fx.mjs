import { C, Pix, R, rng } from "../pix.mjs";

const one = (w, h, draw, outline = true) => {
  const p = new Pix(w, h);
  draw(p);
  if (outline) p.outline();
  return { pix: p };
};

export const fx = {
  bullet_p: [one(7, 4, (p) => { p.rect(0, 1, 7, 2, C.fire2); p.rect(4, 1, 3, 2, C.fire1); }, false)],
  bullet_r: [one(9, 4, (p) => { p.rect(0, 1, 9, 2, C.fire3); p.rect(5, 1, 4, 2, C.fire1); }, false)],
  bullet_v: [one(8, 4, (p) => { p.rect(0, 1, 8, 2, C.tealL); p.rect(4, 1, 4, 2, C.white); }, false)],
  bullet_e: [0, 1].map((f) => one(8, 8, (p) => { p.disc(4, 4, 3, f ? C.red : C.fire3); p.disc(4, 4, 1, C.fire1); })),
  rocket: [0, 1].map((f) => one(14, 7, (p) => { p.rect(3, 2, 9, 3, C.greyL); p.rect(11, 2, 2, 3, C.red); p.rect(3, 1, 2, 5, C.greyD); p.rect(0, 2 + f, 3, 2, C.fire2); }, true)),
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
