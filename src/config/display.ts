export const VIEW_W = 384;
export const VIEW_H = 216;
export const GROUND_Y = 184;
export const FIXED_FPS = 60;

export const DEPTH = {
  sky: 0,
  far: 1,
  mid: 2,
  terrain: 10,
  props: 20,
  hostages: 25,
  enemies: 30,
  boss: 28,
  vehicle: 35,
  player: 40,
  projectiles: 50,
  fx: 60,
  foreground: 70,
} as const;
