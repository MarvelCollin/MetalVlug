import type { Enemy, EnemyState } from "../Enemy";

export interface EnemyBehaviour {
  engage(e: Enemy, dt: number): EnemyState | void;
  attack(e: Enemy, dt: number, t: number): EnemyState | void;
}

export function keepDistance(e: Enemy, min: number, max: number): number {
  const dx = e.ctx.player.x - e.x;
  const dist = Math.abs(dx);
  if (dist > max) return Math.sign(dx);
  if (dist < min) return -Math.sign(dx);
  return 0;
}
