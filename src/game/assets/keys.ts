export const TEX = {
  atlas: "atlas",
  font: "font",
  sky: "bg_sky",
  far: "bg_far",
  mid: "bg_mid",
} as const;

export const DATA = {
  anchors: "anchors",
  fontMeta: "fontMeta",
} as const;

export const FONT = "retro";

export interface Point {
  x: number;
  y: number;
}

export type AnchorTable = Record<string, Record<string, Point | number>>;
