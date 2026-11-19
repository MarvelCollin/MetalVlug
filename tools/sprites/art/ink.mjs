import { Pix } from "../pix.mjs";

export const INK = "#1e1624";

export class Part {
  constructor(w = 48, h = 48) {
    this.pix = new Pix(w, h);
    this.mask = new Uint8Array(w * h);
  }

  poly(points, color) {
    const p = this.pix;
    let minY = Infinity, maxY = -Infinity;
    for (const [, y] of points) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[(i + 1) % points.length];
        if ((y0 <= y + 0.5 && y1 > y + 0.5) || (y1 <= y + 0.5 && y0 > y + 0.5)) xs.push(x0 + ((y + 0.5 - y0) / (y1 - y0)) * (x1 - x0));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.set(x, y, color);
    }
    return this;
  }

  set(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.pix.w || y >= this.pix.h) return this;
    this.pix.px(x, y, color);
    this.mask[y * this.pix.w + x] = 1;
    return this;
  }

  rect(x, y, w, h, color) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, color);
    return this;
  }

  dots(list, color) {
    for (const [x, y] of list) this.set(x, y, color);
    return this;
  }

  limb(x0, y0, x1, y1, w0, w1, color) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    return this.poly([
      [x0 + nx * w0 / 2, y0 + ny * w0 / 2],
      [x1 + nx * w1 / 2, y1 + ny * w1 / 2],
      [x1 - nx * w1 / 2, y1 - ny * w1 / 2],
      [x0 - nx * w0 / 2, y0 - ny * w0 / 2],
    ], color);
  }

  ellipse(cx, cy, rx, ry, color) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const a = (x - cx) / rx;
        const b = (y - cy) / ry;
        if (a * a + b * b <= 1.0) this.set(x, y, color);
      }
    return this;
  }

  cel(ramp, light = 0.3, dark = -0.25, bias = 0) {
    const { w, h } = this.pix;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (this.mask[y * w + x]) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = Math.max(1, (maxX - minX) / 2);
    const ry = Math.max(1, (maxY - minY) / 2);
    for (let y = minY; y <= maxY; y++)
      for (let x = minX; x <= maxX; x++) {
        if (!this.mask[y * w + x]) continue;
        const v = -(((x - cx) / rx) * 0.55 + ((y - cy) / ry) * 0.85) + bias;
        const edge = !this.mask[(y + 1) * w + x] || !this.mask[y * w + x + 1];
        const c = v > light ? ramp[0] : v < dark ? ramp[2] : ramp[1];
        this.pix.px(x, y, edge && v < dark + 0.4 ? ramp[3] ?? ramp[2] : c);
      }
    return this;
  }

  ink(color = INK) {
    const { w, h } = this.pix;
    const out = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (this.mask[y * w + x]) continue;
        const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < w && yy < h && this.mask[yy * w + xx];
        if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) out.push([x, y]);
      }
    for (const [x, y] of out) this.set(x, y, color);
    return this;
  }
}

export function compose(parts, w = 48, h = 48) {
  const p = new Pix(w, h);
  for (const part of parts) if (part) p.blit(part.pix, 0, 0);
  return p;
}
