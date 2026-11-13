export const TEX = {
  atlas: "atlas",
  fx: "fx",
  font: "font",
  fontBig: "font_big",
  sky: "bg_sky",
  far: "bg_far",
  mid: "bg_mid",
} as const;

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
