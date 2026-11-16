import type { Faction } from "../../domain/combat/Damage";

export type SoundId =
  | "shot" | "rivet" | "scatter" | "rocket" | "boom" | "bigboom" | "knife" | "hit" | "clank"
  | "jump" | "pickup" | "weapon" | "rescue" | "die" | "enemyDie" | "alarm" | "go" | "enemyShot"
  | "throw" | "vulcan" | "cannon" | "mission" | "complete" | "scream";

export interface GameEvents {
  score: { points: number; x: number; y: number };
  sound: SoundId;
  shake: { intensity: number; duration: number };
  explode: { x: number; y: number; radius: number; damage: number; from: Faction; big: boolean };
  banner: { text: string; sub?: string; seconds?: number };
  tip: { text: string; seconds: number };
  weapon: { label: string };
  rescued: { x: number; y: number };
  enemyKilled: { x: number; y: number; knife: boolean };
  playerDied: { x: number; y: number };
  playerSpawned: void;
  waveCleared: void;
  bossDefeated: void;
  timer: { units: number };
}
