export type WeaponId = "pistol" | "rivet" | "scatter" | "thumper" | "furnace" | "lance";
export type FireMode = "bullet" | "stream" | "blast" | "rocket" | "flame" | "beam";
export type TorsoSet = "pistol" | "heavy";

export interface WeaponDef {
  readonly id: WeaponId;
  readonly label: string;
  readonly startAmmo: number;
  readonly refillAmmo: number;
  readonly cooldown: number;
  readonly burst: number;
  readonly burstGap: number;
  readonly mode: FireMode;
  readonly damage: number;
  readonly speed: number;
  readonly torso: TorsoSet;
  readonly diagonal: boolean;
  readonly range: number;
}

export const WEAPONS: Readonly<Record<WeaponId, WeaponDef>> = {
  pistol: { id: "pistol", label: "POCKET PISTOL", startAmmo: Infinity, refillAmmo: 0, cooldown: 0.08, burst: 1, burstGap: 0, mode: "bullet", damage: 1, speed: 360, torso: "pistol", diagonal: false, range: 420 },
  rivet: { id: "rivet", label: "RIVET GUN", startAmmo: 200, refillAmmo: 150, cooldown: 0.12, burst: 4, burstGap: 0.045, mode: "stream", damage: 1, speed: 420, torso: "heavy", diagonal: true, range: 420 },
  scatter: { id: "scatter", label: "SCATTER CANNON", startAmmo: 30, refillAmmo: 20, cooldown: 0.45, burst: 1, burstGap: 0, mode: "blast", damage: 6, speed: 0, torso: "heavy", diagonal: false, range: 72 },
  furnace: { id: "furnace", label: "FURNACE", startAmmo: 30, refillAmmo: 20, cooldown: 0.3, burst: 1, burstGap: 0, mode: "flame", damage: 3, speed: 200, torso: "heavy", diagonal: false, range: 170 },
  lance: { id: "lance", label: "ARC LANCE", startAmmo: 200, refillAmmo: 150, cooldown: 0.07, burst: 0, burstGap: 0, mode: "beam", damage: 1, speed: 0, torso: "heavy", diagonal: false, range: 360 },
  thumper: { id: "thumper", label: "THUMPER", startAmmo: 30, refillAmmo: 20, cooldown: 0.35, burst: 1, burstGap: 0, mode: "rocket", damage: 8, speed: 380, torso: "heavy", diagonal: false, range: 420 },
};
