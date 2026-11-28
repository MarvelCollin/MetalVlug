export const TEX = {
  atlas: "atlas",
  fx: "fx",
  font: "font",
  fontBig: "font_big",
} as const;

export type Theme = "harbour" | "camp" | "yard";
export const THEMES: readonly Theme[] = ["harbour", "camp", "yard"];
export const BG_VARIANTS = 3;

function pickVariant(): number {
  if (typeof location === "undefined") return 0;
  const forced = Number(new URLSearchParams(location.search).get("bg") ?? NaN);
  if (Number.isInteger(forced) && forced >= 0 && forced < BG_VARIANTS) return forced;
  return Math.floor(Math.random() * BG_VARIANTS);
}

export const BG_VARIANT = pickVariant();
export const bgKey = (kind: "sky" | "far" | "mid", theme: Theme): string => `bg_${kind}_${theme}_${BG_VARIANT}`;

export const DATA = {
  anchors: "anchors",
  fontMeta: "fontMeta",
  fxMeta: "fxMeta",
} as const;

export const FONT = "retro";
export const FONT_BIG = "retroBig";

export interface Point {
  x: number;
  y: number;
}

export interface FxMeta {
  frames: number;
  fps: number;
  originX: number;
  originY: number;
}

export type FxMetaTable = Record<string, FxMeta>;

export type AnchorTable = Record<string, Record<string, Point | number>>;
