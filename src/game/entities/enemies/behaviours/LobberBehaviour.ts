import { ENEMY, PHYSICS } from "../../../../config/tuning";
import type { Enemy, EnemyState } from "../Enemy";
import { keepDistance, type EnemyBehaviour } from "./EnemyBehaviour";

const L = ENEMY.lobber;

export class LobberBehaviour implements EnemyBehaviour {
  engage(e: Enemy): EnemyState | void {
    e.move(keepDistance(e, L.keepMin, L.keepMax));
    const p = e.ctx.player;
    if (p.alive && e.cooldown.ready && e.ctx.camera.visible(e.x, -8) && Math.abs(p.x - e.x) < 260) return "attack";
  }

  attack(e: Enemy, _dt: number, t: number): EnemyState | void {
    e.faceTarget();
    if (t < L.windup) {
      e.sprite.setFrame("lobber_throw_0");
      return;
    }
    if (!e.fired) {
      e.fired = true;
      e.sprite.setFrame("lobber_throw_1");
      const sx = e.x + 6 * e.facing;
      const sy = e.y - 38;
      const p = e.ctx.player;
      const tt = L.flightTime;
      const vx = (p.x + e.ctx.rng.range(-12, 12) - sx) / tt;
      const vy = (p.y - sy - 0.5 * PHYSICS.gravity * tt * tt) / tt;
      e.ctx.projectiles.fire("enemyBomb", sx, sy, vx, vy, 1);
      e.ctx.events.emit("sound", "throw");
    }
    if (t > L.windup + 0.15) e.sprite.setFrame("lobber_throw_2");
    if (t > L.windup + 0.45) {
      e.cooldown.trigger(e.ctx.rng.range(L.throwGap[0], L.throwGap[1]));
      return "engage";
    }
  }
}
