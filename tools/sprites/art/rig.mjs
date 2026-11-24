import { INK, Part, compose } from "./ink.mjs";
import { Pix } from "../pix.mjs";

export const SKIN = ["#ffdcb8", "#f2ac7c", "#c27358", "#8c4a40"];
const WHITE = "#fff8ec";
const EYE = "#2a1d2e";

export const LOOKS = {
  pip: {
    coat: ["#8fe0cc", "#46a99c", "#2c7170", "#1e4f55"],
    vest: ["#e3cf98", "#b39a62", "#7c6744", "#54452f"],
    pants: ["#a3adc2", "#6c7790", "#4a5268", "#333a4e"],
    boot: ["#b0805a", "#7d5338", "#523526", "#38241d"],
    glove: ["#c99a6a", "#8f6345", "#5f3f30", "#3a2528"],
    hair: ["#9a6446", "#6a422e", "#472a20", "#2e1a16"],
    accent: ["#ffc07a", "#f08a3c", "#b4542a", "#7a3322"],
  },
  juno: {
    coat: ["#d6d79a", "#9ea263", "#6c7343", "#475030"],
    vest: ["#c99a6a", "#8f6345", "#5f3f30", "#3a2528"],
    pants: ["#a88a68", "#7a6048", "#544232", "#382c22"],
    boot: ["#8e96a8", "#5f6779", "#3d4456", "#262a38"],
    glove: ["#c99a6a", "#8f6345", "#5f3f30", "#3a2528"],
    hair: ["#f09a62", "#c4603c", "#8c3a2a", "#5c2422"],
    accent: ["#ff8c78", "#e04a3e", "#a62d36", "#64202e"],
  },
  grunt: {
    coat: ["#ffad78", "#de6a3a", "#a8452d", "#6b2a28"],
    vest: ["#c9c98a", "#8f9457", "#5f673d", "#3c4430"],
    pants: ["#a3825f", "#735a42", "#4f3d2f", "#352820"],
    boot: ["#6c7486", "#454c5e", "#2c3242", "#1c2030"],
    glove: ["#6c7486", "#454c5e", "#2c3242", "#1c2030"],
    hair: ["#e8ecf0", "#a8b0bc", "#727a88", "#4a505c"],
    accent: ["#ff9c8a", "#ff4a3a", "#b42a30", "#64202e"],
  },
  lobber: null,
  rusher: null,
  tinker: {
    coat: ["#a9ccff", "#628fe0", "#3d62b0", "#29407a"],
    vest: ["#fff4dc", "#e8d6b0", "#bba67e", "#7f6f52"],
    pants: ["#8fb2ec", "#5577c4", "#3a529a", "#28386a"],
    boot: ["#b0805a", "#7d5338", "#523526", "#38241d"],
    glove: ["#fff0a8", "#f0c848", "#b48a2a", "#6c4a24"],
    hair: ["#ffffff", "#e6e1d6", "#b8ae9e", "#7d7366"],
    accent: ["#fff3b0", "#f8d25a", "#d39c30", "#8f5f28"],
  },
};
LOOKS.lobber = { ...LOOKS.grunt, vest: ["#c49a6c", "#8f6345", "#5f3f30", "#3a2528"], pants: ["#c9c98a", "#8f9457", "#5f673d", "#3c4430"] };
LOOKS.bazooka = { ...LOOKS.grunt, coat: ["#d6d79a", "#9ea263", "#6c7343", "#475030"], vest: ["#c49a6c", "#8f6345", "#5f3f30", "#3a2528"], hair: ["#c9c98a", "#8f9457", "#5f673d", "#3c4430"] };
LOOKS.shield = { ...LOOKS.grunt, coat: ["#a3adc2", "#6c7790", "#4a5268", "#333a4e"], vest: ["#ffad78", "#de6a3a", "#a8452d", "#6b2a28"], hair: ["#3f4658", "#2c3242", "#1f2433", "#141824"] };
LOOKS.rusher = { ...LOOKS.grunt, pants: ["#a3adc2", "#6c7790", "#4a5268", "#333a4e"], accent: ["#ff8c78", "#d8323a", "#962632", "#5a1c28"] };

const GUN = ["#c8d0dc", "#7c8496", "#4a5062", "#2c3040"];
const WOOD = ["#d8a26a", "#a06c42", "#6c462e", "#442c22"];
const BRASS = ["#fff0a8", "#e6bc4f", "#b07f2c", "#6c4a24"];
const STEEL = ["#eef2f6", "#b8c0cc", "#7c8496", "#4a5062"];
const RUSTY = ["#ffad78", "#de6a3a", "#a8452d", "#6b2a28"];

export function legs(look, pose, kind) {
  const hip = pose.hip;
  const back = new Part();
  back.limb(hip[0] - 2, hip[1], pose.bk[0], pose.bk[1], 7, 6, look.pants[1]);
  back.limb(pose.bk[0], pose.bk[1], pose.bf[0], pose.bf[1] - 3, 6, 5, look.pants[1]);
  back.cel(look.pants, 0.45, -0.1, -0.25);
  back.dots([[pose.bk[0] - 1, pose.bk[1]], [pose.bk[0], pose.bk[1] + 1]], look.pants[3]);
  back.ink();
  const backBoot = boot(look, pose.bf, true);
  const front = new Part();
  front.limb(hip[0] + 2, hip[1], pose.fk[0], pose.fk[1], 7, 6, look.pants[1]);
  front.limb(pose.fk[0], pose.fk[1], pose.ff[0], pose.ff[1] - 3, 6, 5, look.pants[1]);
  front.cel(look.pants, 0.3, -0.25);
  front.dots([[pose.fk[0] - 2, pose.fk[1] - 1], [pose.fk[0] - 1, pose.fk[1]], [pose.fk[0], pose.fk[1] + 1]], look.pants[3]);
  front.dots([[pose.fk[0] + 1, pose.fk[1] - 3], [pose.fk[0] + 2, pose.fk[1] - 2]], look.pants[0]);
  front.dots([[pose.ff[0] - 3, pose.ff[1] - 5], [pose.ff[0] - 2, pose.ff[1] - 5], [pose.ff[0] - 1, pose.ff[1] - 5], [pose.ff[0], pose.ff[1] - 5]], look.pants[2]);
  front.ink();
  const frontBoot = boot(look, pose.ff, false);
  const hips = new Part();
  hips.poly([[hip[0] - 6, hip[1] - 3], [hip[0] + 6, hip[1] - 3], [hip[0] + 6, hip[1] + 2], [hip[0] - 6, hip[1] + 2]], look.pants[1]);
  hips.cel(look.pants, 0.4, -0.3);
  if (kind !== "tinker") {
    hips.rect(hip[0] - 6, hip[1] - 3, 12, 2, look.glove[2]);
    hips.rect(hip[0] - 1, hip[1] - 3, 3, 2, BRASS[1]);
    hips.rect(hip[0] - 5, hip[1] - 1, 3, 3, look.vest[2]);
  }
  hips.ink();
  return [back, backBoot, front, frontBoot, hips];
}

function boot(look, foot, back) {
  const b = new Part();
  const [x, y] = foot;
  b.poly([[x - 4, y - 5], [x + 2, y - 5], [x + 3, y - 3], [x + 6, y - 2], [x + 6, y], [x - 4, y]], look.boot[1]);
  b.cel(look.boot, 0.3, -0.1, back ? -0.3 : 0);
  b.rect(x - 4, y - 1, 11, 1, look.boot[3]);
  b.dots([[x - 2, y - 4], [x - 1, y - 4]], look.boot[0]);
  b.dots([[x, y - 4], [x + 1, y - 3]], look.boot[3]);
  b.dots([[x + 4, y - 2]], look.boot[0]);
  return b.ink();
}

function torsoPart(look, pose, kind) {
  const [hx, hy] = pose.hip;
  const [cx, cy] = pose.chest;
  const t = new Part();
  const coatLong = kind === "grunt" || kind === "lobber" || kind === "rusher";
  t.poly([[hx - 6, hy], [hx + 5, hy], [cx + 6, cy + 3], [cx + 4, cy - 2], [cx - 5, cy - 2], [cx - 7, cy + 2]], look.coat[1]);
  if (coatLong) t.poly([[hx - 7, hy - 3], [hx + 7, hy - 3], [hx + 8, hy + 5], [hx - 8, hy + 5]], look.coat[1]);
  t.cel(look.coat, 0.35, -0.2);
  if (kind === "tinker") {
    t.poly([[hx - 5, hy - 1], [hx + 5, hy - 1], [cx + 4, cy + 4], [cx - 4, cy + 4]], look.coat[1]);
    t.rect(cx - 6, cy - 2, 12, 5, look.vest[1]);
    t.rect(cx - 4, cy - 2, 2, 7, look.coat[2]);
    t.rect(cx + 3, cy - 2, 2, 7, look.coat[2]);
    t.dots([[cx - 3, cy + 4], [cx + 4, cy + 4]], BRASS[0]);
    t.rect(hx - 2, hy - 7, 5, 3, look.coat[2]);
  } else {
    const vx = (hx + cx) / 2;
    const vy = (hy + cy) / 2;
    t.poly([[vx - 5, vy - 6], [vx + 5, vy - 6], [vx + 5, vy + 5], [vx - 5, vy + 5]], look.vest[1]);
    t.rect(vx - 4, vy - 1, 3, 3, look.vest[2]);
    t.rect(vx + 2, vy - 1, 3, 3, look.vest[2]);
    t.rect(vx - 4, vy - 1, 3, 1, look.vest[3]);
    t.rect(vx + 2, vy - 1, 3, 1, look.vest[3]);
    t.rect(vx - 5, vy - 6, 10, 1, look.vest[0]);
    t.rect(vx, vy - 6, 1, 11, look.vest[2]);
    t.dots([[vx - 3, vy - 4], [vx + 3, vy - 4]], look.vest[0]);
    t.dots([[vx - 3, vy + 3], [vx - 2, vy + 4], [vx + 3, vy + 3]], look.vest[2]);
    t.dots([[vx - 4, vy], [vx + 2, vy]], BRASS[1]);
    if (coatLong) {
      t.rect(hx - 7, hy + 4, 15, 1, look.coat[3]);
      t.dots([[hx + 3, hy - 9], [hx + 3, hy - 6]], BRASS[1]);
    }
  }
  return t.ink();
}

function arm(look, from, elbow, hand, back) {
  const a = new Part();
  a.limb(from[0], from[1], elbow[0], elbow[1], 6, 5, look.coat[1]);
  a.limb(elbow[0], elbow[1], hand[0], hand[1], 5, 4, look.coat[1]);
  a.cel(look.coat, 0.4, -0.15, back ? -0.35 : 0);
  a.ellipse(hand[0], hand[1], 2.8, 2.6, look.glove[1]);
  a.dots([[hand[0] - 1, hand[1] - 1], [hand[0], hand[1] - 2]], look.glove[0]);
  a.dots([[hand[0] + 1, hand[1] + 1], [hand[0] + 2, hand[1]]], look.glove[2]);
  return a.ink();
}

function faceParts(look, x, y, kind, mood) {
  const soft = kind === "juno";
  const face = new Part();
  const nose = soft ? 6 : 7;
  face.poly([
    [x - 5, y - 5], [x + 4, y - 5], [x + 5, y - 3], [x + 5, y + 1],
    [x + nose, y + 3], [x + nose, y + 4], [x + 5, y + 4], [x + 5, y + 5],
    [x + (soft ? 5 : 6), y + 6], [x + (soft ? 4 : 6), y + 7], [x + (soft ? 3 : 5), y + 8],
    [x + 1, y + 8], [x - 3, y + 6], [x - 5, y + 3],
  ], SKIN[1]);
  for (let yy = y + 4; yy <= y + 7; yy++) face.rect(x - 5, yy, 4 - (yy - y - 4), 1, SKIN[2]);
  face.rect(x - 1, y + 7, 6, 2, SKIN[2]);
  face.rect(x + 1, y + 8, 4, 1, SKIN[3]);
  face.dots([[x + 5, y + 1], [x + 6, y + 2], [x + 3, y + 3], [x + 4, y + 3], [x + 1, y - 3], [x + 2, y - 3], [x + 3, y - 4]], SKIN[0]);
  face.dots([[x + 5, y + 4], [x + nose - 2, y + 4]], SKIN[2]);
  face.set(x + nose - 1, y + 4, SKIN[3]);
  if (!soft && kind !== "lobber") {
    face.dots([[x - 3, y], [x - 4, y + 1], [x - 4, y + 2], [x - 3, y + 3]], SKIN[2]);
    face.dots([[x - 3, y + 1], [x - 3, y + 2]], SKIN[3]);
  }
  const eyes = kind !== "lobber" && kind !== "grunt";
  if (eyes) {
    face.rect(x + 2, y, 2, 3, WHITE);
    face.rect(x + 4, y, 1, 3, EYE);
    face.set(x + 3, y + 2, SKIN[2]);
    const brow = kind === "tinker" ? look.hair[1] : look.hair[3];
    if (mood === "angry") face.dots([[x + 1, y - 2], [x + 2, y - 2], [x + 3, y - 1], [x + 4, y - 1], [x + 5, y - 1], [x + 1, y - 1], [x + 2, y - 1]], brow);
    else if (soft) face.dots([[x + 2, y - 1], [x + 3, y - 1], [x + 4, y - 1], [x + 5, y], [x + 5, y - 1]], brow);
    else face.rect(x + 1, y - 2, 5, 2, brow);
  }
  if (kind !== "lobber" && kind !== "tinker") {
    if (mood === "shout" || mood === "angry") {
      face.rect(x + 3, y + 5, 3, 2, "#5a1e2a");
      face.rect(x + 3, y + 5, 3, 1, WHITE);
    } else if (soft) face.dots([[x + 4, y + 5], [x + 3, y + 5]], look.accent[2]);
    else face.dots([[x + 3, y + 5], [x + 4, y + 5], [x + 5, y + 5]], SKIN[3]);
  }
  const out = [face.ink()];
  if (soft) {
    const bangs = new Part();
    bangs.poly([[x - 6, y - 6], [x + 4, y - 6], [x + 5, y - 3], [x + 3, y - 2], [x + 2, y - 3], [x + 1, y - 2], [x, y - 1], [x - 1, y + 3], [x - 2, y + 6], [x - 4, y + 7], [x - 6, y + 5]], look.hair[1]);
    bangs.cel(look.hair, 0.2, -0.3);
    bangs.dots([[x - 3, y - 4], [x - 2, y - 4], [x + 1, y - 5], [x + 2, y - 5], [x - 3, y], [x - 3, y + 1], [x - 4, y + 3]], look.hair[0]);
    out.push(bangs.ink());
  }
  if (kind === "pip" || kind === "rusher") {
    const burn = new Part();
    burn.poly([[x - 2, y - 2], [x, y - 2], [x, y], [x - 1, y + 1], [x - 2, y + 1]], look.hair[1]);
    burn.cel(look.hair, 0.3, -0.3);
    out.push(burn);
  }
  return out;
}

function head(look, pose, kind, mood) {
  const [x, y] = pose.head;
  const parts = [];
  if (kind === "pip" || kind === "juno" || kind === "rusher") {
    const hair = new Part();
    if (kind === "juno") {
      hair.ellipse(x - 2, y, 6.5, 7, look.hair[1]);
      hair.limb(x - 6, y - 1, x - 12, y + 7 + (mood === "run" ? 1 : 0), 5, 3, look.hair[1]);
    } else if (kind === "pip") {
      hair.ellipse(x - 2, y + 1, 6, 6.5, look.hair[1]);
      hair.poly([[x - 8, y - 1], [x - 10, y + 1], [x - 7, y + 3], [x - 9, y + 5], [x - 6, y + 6]], look.hair[1]);
    }
    if (hair.mask.some((m) => m)) {
      hair.cel(look.hair, 0.25, -0.2);
      hair.dots([[x - 4, y - 4], [x - 5, y - 3], [x - 6, y - 1], [x - 7, y + 1]], look.hair[0]);
      hair.dots([[x - 3, y - 2], [x - 4, y], [x - 5, y + 2], [x - 6, y + 4]], look.hair[2]);
      parts.push(hair.ink());
    }
  }
  parts.push(...faceParts(look, x, y, kind, mood));
  const gear = new Part();
  if (kind === "pip") {
    gear.poly([[x - 6, y - 1], [x - 5, y - 5], [x - 1, y - 7], [x + 4, y - 6], [x + 6, y - 3], [x + 10, y - 2], [x + 10, y], [x - 6, y]], look.vest[1]);
    gear.cel(look.vest, 0.3, -0.2);
    gear.rect(x - 6, y - 2, 12, 1, look.vest[3]);
    gear.ellipse(x - 1, y - 3, 1.8, 1.6, "#7fd4ea");
    gear.ellipse(x + 3, y - 3, 1.8, 1.6, "#7fd4ea");
    gear.dots([[x - 2, y - 4], [x + 2, y - 4]], WHITE);
  } else if (kind === "juno") {
    gear.poly([[x - 6, y - 6], [x + 5, y - 6], [x + 6, y - 4], [x - 6, y - 4]], look.accent[1]);
    gear.limb(x - 6, y - 5, x - 10, y - 3, 2, 2, look.accent[1]);
    gear.limb(x - 6, y - 5, x - 9, y - 1, 2, 1, look.accent[2]);
    gear.cel(look.accent, 0.4, -0.2);
  } else if (kind === "grunt") {
    gear.ellipse(x, y - 2, 7.5, 5.5, look.hair[1]);
    gear.poly([[x - 8, y + 1], [x + 8, y + 1], [x + 8, y + 3], [x - 8, y + 3]], look.hair[1]);
    gear.cel(look.hair, 0.3, -0.25);
    gear.rect(x - 8, y + 2, 16, 1, look.hair[3]);
    gear.rect(x + 1, y + 2, 6, 2, look.accent[1]);
    gear.rect(x + 3, y + 2, 2, 1, look.accent[0]);
  } else if (kind === "lobber") {
    gear.poly([[x - 6, y - 2], [x - 4, y - 6], [x + 4, y - 6], [x + 6, y - 2]], look.pants[1]);
    gear.poly([[x - 1, y], [x + 6, y - 1], [x + 7, y + 6], [x, y + 7]], GUN[1]);
    gear.cel(GUN, 0.3, -0.2);
    gear.ellipse(x + 2, y + 1, 1.5, 1.5, "#7fd4ea");
    gear.ellipse(x + 5, y + 1, 1.3, 1.5, "#7fd4ea");
    gear.ellipse(x + 7, y + 6, 2, 2, STEEL[2]);
  } else if (kind === "rusher") {
    gear.ellipse(x, y - 3, 6.5, 4, STEEL[1]);
    gear.cel(STEEL, 0.3, -0.25);
    gear.rect(x - 6, y - 1, 13, 2, look.accent[1]);
    gear.limb(x - 6, y, x - 10, y + 2, 2, 1, look.accent[2]);
  } else if (kind === "tinker") {
    gear.ellipse(x, y - 3, 7, 4.5, look.accent[1]);
    gear.rect(x - 9, y, 18, 2, look.accent[2]);
    gear.cel(look.accent, 0.3, -0.25);
    gear.ellipse(x + 3, y + 5, 4.5, 2.5, look.hair[1]);
    gear.ellipse(x - 1, y + 5, 2.8, 2, look.hair[2]);
    gear.ellipse(x + 3, y + 1, 1.8, 1.8, "#7fd4ea");
    gear.set(x + 3, y + 1, EYE);
  }
  if (gear.mask.some((m) => m)) parts.push(gear.ink());
  if (kind === "pip" || kind === "juno") {
    const scarf = new Part();
    const [cx, cy] = pose.chest;
    if (kind === "pip") {
      scarf.poly([[cx - 6, cy - 2], [cx + 4, cy - 2], [cx + 4, cy], [cx - 6, cy]], look.accent[1]);
      scarf.limb(cx - 5, cy - 1, cx - 9, cy + 4 + (mood === "run" ? 1 : 0), 3, 2, look.accent[1]);
    } else {
      scarf.poly([[cx - 5, cy - 3], [cx + 5, cy - 3], [cx + 5, cy - 1], [cx - 5, cy - 1]], look.coat[2]);
    }
    parts.push(scarf.cel(look.accent, 0.35, -0.2).ink());
  }
  return parts;
}

function gunPart(kind, aim, hand, recoil) {
  const g = new Part();
  const r = recoil ? -2 : 0;
  const [hx, hy] = hand;
  let muzzle;
  if (kind === "pistol") {
    if (aim === "fwd") {
      g.rect(hx + r - 1, hy - 2, 9, 3, GUN[1]);
      g.rect(hx + r, hy + 1, 3, 3, WOOD[1]);
      g.rect(hx + r + 3, hy + 1, 2, 1, GUN[2]);
      muzzle = { x: hx + r + 8, y: hy - 1 };
    } else if (aim === "up") {
      g.rect(hx - 1, hy - 10 - r, 3, 9, GUN[1]);
      g.rect(hx + 2, hy - 3 - r, 3, 3, WOOD[1]);
      muzzle = { x: hx, y: hy - 11 - r };
    } else {
      g.rect(hx - 1, hy + 1 + r, 3, 9, GUN[1]);
      g.rect(hx - 4, hy + 1 + r, 3, 3, WOOD[1]);
      muzzle = { x: hx, y: hy + 11 + r };
    }
  } else {
    if (aim === "fwd") {
      g.rect(hx + r - 5, hy - 3, 14, 5, GUN[1]);
      g.rect(hx + r + 9, hy - 2, 6, 3, STEEL[1]);
      g.rect(hx + r - 8, hy - 2, 4, 3, WOOD[1]);
      g.ellipse(hx + r, hy + 3, 3, 2.5, BRASS[1]);
      muzzle = { x: hx + r + 15, y: hy - 1 };
    } else if (aim === "up") {
      g.rect(hx - 2, hy - 13 - r, 5, 14, GUN[1]);
      g.rect(hx - 1, hy - 19 - r, 3, 6, STEEL[1]);
      g.ellipse(hx + 4, hy - 5 - r, 2.5, 3, BRASS[1]);
      muzzle = { x: hx, y: hy - 20 - r };
    } else {
      g.rect(hx - 2, hy + r, 5, 13, GUN[1]);
      g.rect(hx - 1, hy + 13 + r, 3, 6, STEEL[1]);
      g.ellipse(hx - 4, hy + 5 + r, 2.5, 3, BRASS[1]);
      muzzle = { x: hx, y: hy + 20 + r };
    }
  }
  g.cel(GUN, 0.35, -0.1);
  if (aim === "fwd") g.rect(hx + r - 1 + (kind === "pistol" ? 1 : -3), hy - 2, kind === "pistol" ? 6 : 12, 1, GUN[0]);
  return { part: g.ink(), muzzle };
}

export const STANCE = {
  stand: { hip: [23, 34], bk: [18, 40], bf: [17, 47], fk: [29, 39], ff: [30, 47] },
  jump: { hip: [23, 32], bk: [19, 37], bf: [15, 41], fk: [29, 35], ff: [30, 42] },
  fall: { hip: [23, 33], bk: [18, 39], bf: [16, 45], fk: [29, 38], ff: [31, 45] },
  crouch: { hip: [23, 39], bk: [16, 42], bf: [16, 47], fk: [31, 41], ff: [32, 47] },
  kneel: { hip: [23, 38], bk: [16, 46], bf: [12, 47], fk: [30, 39], ff: [31, 47] },
  sit: { hip: [22, 38], bk: [29, 38], bf: [32, 47], fk: [31, 37], ff: [35, 47] },
};

const RUN = [
  { ff: [33, 46], fk: [31, 38], bf: [14, 45], bk: [18, 40], drop: 1 },
  { ff: [31, 47], fk: [30, 39], bf: [16, 42], bk: [20, 39], drop: 1 },
  { ff: [26, 47], fk: [28, 40], bf: [21, 41], bk: [24, 37], drop: 0 },
  { ff: [21, 45], fk: [25, 40], bf: [26, 43], bk: [28, 37], drop: 0 },
  { ff: [14, 45], fk: [18, 40], bf: [33, 46], bk: [31, 38], drop: 1 },
  { ff: [16, 42], fk: [20, 39], bf: [31, 47], bk: [30, 39], drop: 1 },
  { ff: [21, 41], fk: [24, 37], bf: [26, 47], bk: [28, 40], drop: 0 },
  { ff: [26, 43], fk: [28, 37], bf: [21, 45], bk: [25, 40], drop: 0 },
];

export function runStance(frame) {
  const r = RUN[frame % RUN.length];
  return { hip: [23, 34 + r.drop], ff: r.ff, fk: r.fk, bf: r.bf, bk: r.bk, drop: r.drop };
}

export function crawlStance(frame, count = 6) {
  const s = Math.sin((frame / count) * Math.PI * 2) * 4;
  return { hip: [23, 39], bk: [16 - s, 43], bf: [15 - s, 47], fk: [31 + s, 41], ff: [32 + s, 47] };
}

export const UPPER = {
  fwd: { chest: [28, 25], head: [30, 16], bs: [25, 27], be: [28, 32], bh: [35, 30], fs: [30, 27], fe: [32, 32], fh: [36, 29] },
  up: { chest: [26, 24], head: [25, 15], bs: [24, 25], be: [27, 20], bh: [31, 14], fs: [29, 25], fe: [32, 20], fh: [32, 14] },
  down: { chest: [26, 24], head: [28, 15], bs: [25, 26], be: [28, 31], bh: [30, 35], fs: [28, 26], fe: [31, 31], fh: [31, 35] },
};

function shift(u, dy) {
  const out = {};
  for (const [k, v] of Object.entries(u)) out[k] = [v[0], v[1] + dy];
  return out;
}

export function playerLegs(look, kind, stance) {
  return { pix: compose(legs(look, stance, kind)), anchor: { drop: stance.hip[1] - 34 } };
}

export function playerTorso(look, kind, aim, weapon, recoil) {
  const u = UPPER[aim];
  const pose = { ...u, hip: [23, 34] };
  const torso = torsoPart(look, pose, kind);
  const back = arm(look, u.bs, u.be, u.bh, true);
  const gun = gunPart(weapon, aim, aim === "fwd" ? u.fh : u.fh, recoil);
  const front = arm(look, u.fs, u.fe, u.fh, false);
  const heads = head(look, pose, kind, recoil ? "shout" : "calm");
  const parts = aim === "up" ? [back, torso, ...heads, gun.part, front] : [back, torso, ...heads, gun.part, front];
  return { pix: compose(parts), anchor: { muzzle: gun.muzzle } };
}

export function playerKnife(look, kind, frame) {
  const u = UPPER.fwd;
  const pose = { ...u, hip: [23, 34] };
  const torso = torsoPart(look, pose, kind);
  const heads = head(look, pose, kind, frame === 1 ? "shout" : "calm");
  const blade = new Part();
  let hand;
  if (frame === 0) {
    hand = [21, 13];
    blade.limb(21, 12, 19, 4, 2, 2, STEEL[0]);
  } else if (frame === 1) {
    hand = [37, 26];
    blade.limb(38, 25, 46, 22, 2, 2, STEEL[0]);
    blade.limb(34, 14, 46, 30, 1, 1, WHITE);
  } else {
    hand = [32, 33];
    blade.limb(33, 34, 38, 39, 2, 2, STEEL[1]);
  }
  blade.cel(STEEL, 0.3, -0.2).ink();
  const elbow = frame === 0 ? [22, 20] : frame === 1 ? [31, 27] : [29, 30];
  const front = arm(look, u.fs, elbow, hand, false);
  const back = arm(look, u.bs, u.be, [30, 30], true);
  return { pix: compose([back, torso, ...heads, blade, front]) };
}

export function playerThrow(look, kind, frame) {
  const u = UPPER.fwd;
  const pose = { ...u, hip: [23, 34] };
  const torso = torsoPart(look, pose, kind);
  const heads = head(look, pose, kind, "calm");
  const hand = frame === 0 ? [18, 15] : frame === 1 ? [30, 13] : [36, 24];
  const elbow = frame === 0 ? [20, 21] : frame === 1 ? [28, 18] : [31, 25];
  const parts = [arm(look, u.bs, u.be, [30, 30], true), torso, ...heads];
  if (frame === 0) {
    const g = new Part();
    g.ellipse(17, 12, 2.5, 2.5, "#8f9457").cel(["#c9c98a", "#8f9457", "#5f673d", "#3c4430"], 0.3, -0.2).ink();
    parts.push(g);
  }
  parts.push(arm(look, u.fs, elbow, hand, false));
  return { pix: compose(parts) };
}

export function fullBody(look, kind, stance, upper, extra = {}) {
  const dy = stance.hip[1] - 34;
  const u = shift(upper, dy);
  const pose = { ...u, hip: stance.hip };
  const parts = [];
  if (extra.behind) parts.push(...extra.behind(u));
  parts.push(...legs(look, stance, kind));
  if (extra.backArm !== false) parts.push(arm(look, u.bs, u.be, u.bh, true));
  parts.push(torsoPart(look, pose, kind));
  parts.push(...head(look, pose, kind, extra.mood ?? "calm"));
  if (extra.held) parts.push(...extra.held(u));
  if (extra.frontArm !== false) parts.push(arm(look, u.fs, u.fe, u.fh, false));
  if (extra.front) parts.push(...extra.front(u));
  return compose(parts);
}

export function rifle(u, recoil = 0) {
  const g = new Part();
  const [hx, hy] = u.fh;
  g.rect(hx - 9 + recoil, hy - 2, 18, 3, WOOD[1]);
  g.rect(hx + 3 + recoil, hy - 3, 9, 2, GUN[1]);
  g.rect(hx - 3 + recoil, hy + 1, 3, 3, WOOD[2]);
  g.cel(WOOD, 0.35, -0.15);
  return { part: g.ink(), muzzle: { x: hx + 12 + recoil, y: hy - 2 } };
}

export function bladeHeld(u, up) {
  const b = new Part();
  const [hx, hy] = u.fh;
  if (up) b.limb(hx, hy, hx - 3, hy - 13, 3, 2, STEEL[1]);
  else b.limb(hx, hy, hx + 13, hy + 2, 3, 2, STEEL[1]);
  b.cel(STEEL, 0.3, -0.2);
  b.rect(hx - 1, hy - 1, 3, 3, GUN[2]);
  return b.ink();
}

export function satchel(u) {
  const s = new Part();
  s.poly([[14, 31], [20, 31], [20, 38], [14, 38]], "#8f6345");
  s.cel(["#c49a6c", "#8f6345", "#5f3f30", "#3a2528"], 0.3, -0.2);
  s.rect(14, 31, 6, 1, "#5f3f30");
  return s.ink();
}

export function grenade(x, y) {
  const g = new Part();
  g.ellipse(x, y, 2.5, 2.5, "#8f9457").cel(["#c9c98a", "#8f9457", "#5f673d", "#3c4430"], 0.3, -0.2);
  g.set(x, y - 3, STEEL[1]);
  return g.ink();
}

export function headIcon(kind) {
  const full = compose(head(LOOKS[kind], { head: [24, 24], chest: [23, 34] }, kind, "idle"), 48, 48);
  const p = new Pix(18, 18);
  for (let y = 0; y < 18; y++)
    for (let x = 0; x < 18; x++) {
      const s = ((y + 16) * 48 + (x + 16)) * 4;
      const d = (y * 18 + x) * 4;
      for (let k = 0; k < 4; k++) p.data[d + k] = full.data[s + k];
    }
  return p;
}

export { INK, RUSTY, compose, Part };
