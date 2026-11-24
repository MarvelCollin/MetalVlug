import { ENEMY } from "../../../../config/tuning";
import type { Enemy, EnemyState } from "../Enemy";
import { keepDistance, type EnemyBehaviour } from "./EnemyBehaviour";

const B = ENEMY.bazooka;

export class BazookaBehaviour implements EnemyBehaviour {
  engage(e: Enemy): EnemyState | void {
    e.move(keepDistance(e, B.keepMin, B.keepMax));
    const p = e.ctx.player;
    if (p.alive && e.cooldown.ready && e.ctx.camera.visible(e.x, -8) && Math.abs(p.x - e.x) < 320 && e.body.blocked.down) return "attack";
  }

  attack(e: Enemy, _dt: number, t: number): EnemyState | void {
    if (t < B.aimTime) {
      e.faceTarget();
      e.sprite.setFrame("bazooka_aim_0");
      return;
    }
    if (!e.fired) {
      e.fired = true;
      e.sprite.setFrame("bazooka_fire_0");
      const m = e.ctx.anchor("bazooka_aim_0", "muzzle");
      const mx = e.x + (m.x - 24) * e.facing;
      const my = e.y - 48 + m.y - B.rocketLift;
      e.ctx.projectiles.fire("enemyRocket", mx, my, e.facing * B.rocketSpeed, 0, 1);
      e.ctx.fx.play("smoke", e.x - e.facing * 20, my - 2);
      e.ctx.events.emit("sound", "rocket");
    }
    if (t > B.aimTime + B.recover) {
      e.cooldown.trigger(e.ctx.rng.range(B.fireGap[0], B.fireGap[1]) * (e.ctx.state.easy ? 1.5 : 1));
      return "engage";
    }
  }
}
