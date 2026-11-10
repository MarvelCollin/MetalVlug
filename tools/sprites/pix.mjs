export const C = {
  ink: "#1b1626",
  white: "#f4f1e8",
  skinL: "#f6cfa6",
  skin: "#e0a675",
  skinD: "#a86a4a",
  teal: "#3fa7a0",
  tealD: "#2a6f73",
  tealL: "#86d8c7",
  orange: "#f08a3c",
  orangeD: "#b45a2a",
  rust: "#c4552b",
  rustD: "#7e3320",
  rustL: "#e98250",
  brown: "#6b4a33",
  brownD: "#3f2b20",
  brownL: "#946a48",
  grey: "#8a8f98",
  greyD: "#565b66",
  greyL: "#c2c6cc",
  steel: "#3d4352",
  red: "#e0413a",
  redD: "#8e2430",
  yellow: "#f7d154",
  yellowD: "#c99a2e",
  blue: "#4a7bd1",
  blueD: "#2f4f8f",
  blueL: "#8bb3ee",
  cream: "#efe0b9",
  green: "#6fae4b",
  greenD: "#3f6e34",
  fire1: "#fff4c2",
  fire2: "#ffd166",
  fire3: "#f4873b",
  fire4: "#c8452e",
  smoke: "#6e6273",
  smokeL: "#a597a3",
};

function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

export class Pix {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }

  px(x, y, c, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return this;
    const [r, g, b] = hex(c);
    const i = (y * this.w + x) * 4;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a;
    return this;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.data[(y * this.w + x) * 4 + 3];
  }

  rect(x, y, w, h, c, a) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c, a);
    return this;
  }

  line(x0, y0, x1, y1, c, thick = 1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let s = 0; s <= steps; s++) {
      const x = x0 + ((x1 - x0) * s) / steps;
      const y = y0 + ((y1 - y0) * s) / steps;
      const o = Math.floor((thick - 1) / 2);
      this.rect(Math.round(x) - o, Math.round(y) - o, thick, thick, c);
    }
    return this;
  }

  disc(cx, cy, r, c, a) {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.px(cx + x, cy + y, c, a);
    return this;
  }

  ellipse(cx, cy, rx, ry, c) {
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1.05) this.px(cx + x, cy + y, c);
    return this;
  }

  ring(cx, cy, r, c, width = 1) {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++) {
        const d = Math.sqrt(x * x + y * y);
        if (d <= r + 0.4 && d >= r - width + 0.4) this.px(cx + x, cy + y, c);
      }
    return this;
  }

  outline(c = C.ink) {
    const mark = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) mark.push([x, y]);
      }
    for (const [x, y] of mark) this.px(x, y, c);
    return this;
  }

  flipX() {
    const out = new Pix(this.w, this.h);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const s = (y * this.w + x) * 4;
        const d = (y * this.w + (this.w - 1 - x)) * 4;
        for (let k = 0; k < 4; k++) out.data[d + k] = this.data[s + k];
      }
    return out;
  }

  blit(src, ox, oy) {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const s = (y * src.w + x) * 4;
        if (!src.data[s + 3]) continue;
        const tx = ox + x;
        const ty = oy + y;
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        const d = (ty * this.w + tx) * 4;
        for (let k = 0; k < 4; k++) this.data[d + k] = src.data[s + k];
      }
    return this;
  }
}

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const R = {
  teal: ["#b4f0d8", "#58bfae", "#33878c", "#20536a"],
  scarf: ["#ffd9a0", "#f59c4c", "#c9602f", "#80352b"],
  skin: ["#ffe4c4", "#f2b98f", "#cc8463", "#8c5248"],
  leather: ["#c49a6c", "#8f6345", "#5f3f30", "#3a2528"],
  slate: ["#a9b2c4", "#727c93", "#4c546c", "#30354b"],
  rust: ["#ffb27a", "#de6d3d", "#a8452d", "#6b2a28"],
  helmet: ["#e2e6ea", "#a3aab5", "#717987", "#454b5a"],
  olive: ["#c9c98a", "#8f9457", "#5f673d", "#3c4430"],
  overall: ["#a9ccff", "#628fe0", "#3d62b0", "#29407a"],
  hardhat: ["#fff3b0", "#f8d25a", "#d39c30", "#8f5f28"],
  steel: ["#d3d8e0", "#8e97a8", "#5d6678", "#383e50"],
  gunmetal: ["#9aa3b4", "#5f6779", "#3d4456", "#24283a"],
  wood: ["#e0b27c", "#b07a4c", "#7c5236", "#4c3128"],
  brass: ["#fff0a8", "#e6bc4f", "#b07f2c", "#6c4a24"],
  red: ["#ff9c8a", "#e24b3e", "#a62d36", "#64202e"],
  cream: ["#fff8e4", "#efe0b9", "#c9b38a", "#8f7a60"],
  glass: ["#e8fbff", "#8fd8ea", "#4d9ab8", "#2e5c7c"],
  beard: ["#ffffff", "#e6e1d6", "#b8ae9e", "#7d7366"],
  mule: ["#fff0a0", "#f3c843", "#c98f2a", "#7f5424"],
};

const BAYER = [[0, 0.5], [0.75, 0.25]];
const L = (() => { const v = [-0.5, -0.75, 0.55]; const m = Math.hypot(...v); return v.map((x) => x / m); })();

export function tone(ramp, v, x, y) {
  const n = ramp.length - 1;
  const t = Math.max(0, Math.min(1, 1 - v)) * n;
  const i = Math.floor(t);
  const f = t - i;
  if (f < 0.38) return ramp[i];
  if (f > 0.62) return ramp[Math.min(n, i + 1)];
  const th = BAYER[((y % 2) + 2) % 2][((x % 2) + 2) % 2];
  return ramp[Math.min(n, th < 0.5 ? i + 1 : i)];
}

Pix.prototype.blob = function (cx, cy, rx, ry, ramp, bias = 0) {
  for (let y = Math.floor(-ry); y <= Math.ceil(ry); y++)
    for (let x = Math.floor(-rx); x <= Math.ceil(rx); x++) {
      const nx = x / rx;
      const ny = y / ry;
      const d = nx * nx + ny * ny;
      if (d > 1.02) continue;
      const nz = Math.sqrt(Math.max(0, 1 - d));
      const v = (nx * L[0] + ny * L[1] + nz * L[2]) * 0.75 + 0.3 + bias;
      this.px(cx + x, cy + y, tone(ramp, v, Math.round(cx + x), Math.round(cy + y)));
    }
  return this;
};

Pix.prototype.box = function (x, y, w, h, ramp, bias = 0) {
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      let v = 0.78 - (w > 1 ? i / (w - 1) : 0) * 0.5 + bias;
      if (j === 0) v += 0.25;
      if (j === h - 1 && h > 2) v -= 0.25;
      if (i === 0 && w > 2) v += 0.1;
      this.px(x + i, y + j, tone(ramp, v, x + i, y + j));
    }
  return this;
};

Pix.prototype.limb = function (x0, y0, x1, y1, t, ramp, bias = 0) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (nx * L[0] + ny * L[1] < 0) { nx = -nx; ny = -ny; }
  const r = t / 2;
  const minX = Math.floor(Math.min(x0, x1) - r - 1);
  const maxX = Math.ceil(Math.max(x0, x1) + r + 1);
  const minY = Math.floor(Math.min(y0, y1) - r - 1);
  const maxY = Math.ceil(Math.max(y0, y1) + r + 1);
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const px = x - x0;
      const py = y - y0;
      const u = Math.max(0, Math.min(1, (px * dx + py * dy) / (len * len)));
      const cxp = x0 + u * dx;
      const cyp = y0 + u * dy;
      const ox = x - cxp;
      const oy = y - cyp;
      if (ox * ox + oy * oy > r * r + 0.3) continue;
      const s = (ox * nx + oy * ny) / Math.max(r, 0.5);
      const v = 0.5 + s * 0.4 + bias;
      this.px(x, y, tone(ramp, v, x, y));
    }
  return this;
};

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return "#" + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("");
}

Pix.prototype.colorAt = function (x, y) {
  const i = (y * this.w + x) * 4;
  return "#" + [0, 1, 2].map((k) => this.data[i + k].toString(16).padStart(2, "0")).join("");
};

Pix.prototype.selout = function (ink = "#1b1626", amount = 0.72) {
  const mark = [];
  for (let y = 0; y < this.h; y++)
    for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
        if (this.get(x + dx, y + dy)) { mark.push([x, y, this.colorAt(x + dx, y + dy)]); break; }
      }
    }
  for (const [x, y, c] of mark) this.px(x, y, mixHex(c, ink, amount));
  return this;
};

Pix.prototype.rotated = function (angle, px, py) {
  const out = new Pix(this.w, this.h);
  const c = Math.cos(-angle);
  const s = Math.sin(-angle);
  for (let y = 0; y < this.h; y++)
    for (let x = 0; x < this.w; x++) {
      const dx = x - px;
      const dy = y - py;
      const sx = Math.round(px + dx * c - dy * s);
      const sy = Math.round(py + dx * s + dy * c);
      if (sx < 0 || sy < 0 || sx >= this.w || sy >= this.h) continue;
      const si = (sy * this.w + sx) * 4;
      if (!this.data[si + 3]) continue;
      const di = (y * this.w + x) * 4;
      for (let k = 0; k < 4; k++) out.data[di + k] = this.data[si + k];
    }
  return out;
};

Pix.prototype.shifted = function (dx, dy) {
  const out = new Pix(this.w, this.h);
  out.blit(this, dx, dy);
  return out;
};

Pix.prototype.clone = function () {
  const out = new Pix(this.w, this.h);
  out.data.set(this.data);
  return out;
};
