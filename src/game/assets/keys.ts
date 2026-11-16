export const TEX = {
  atlas: "atlas",
  fx: "fx",
  font: "font",
  fontBig: "font_big",
} as const;

export type Theme = "harbour" | "camp";
export const THEMES: readonly Theme[] = ["harbour", "camp"];
export const bgKey = (kind: "sky" | "far" | "mid", theme: Theme): string => `bg_${kind}_${theme}`;

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
