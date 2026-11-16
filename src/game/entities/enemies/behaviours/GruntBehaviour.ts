import { ENEMY } from "../../../../config/tuning";
import type { Enemy, EnemyState } from "../Enemy";
import { keepDistance, type EnemyBehaviour } from "./EnemyBehaviour";

const G = ENEMY.grunt;

export class GruntBehaviour implements EnemyBehaviour {
  engage(e: Enemy): EnemyState | void {
    e.move(keepDistance(e, G.keepMin, G.keepMax));
    const p = e.ctx.player;
    if (p.alive && e.cooldown.ready && e.ctx.camera.visible(e.x, -8) && Math.abs(p.x - e.x) < 300 && e.body.blocked.down) return "attack";
  }

  attack(e: Enemy, _dt: number, t: number): EnemyState | void {
    e.faceTarget();
    if (t < G.aimTime) {
      e.sprite.setFrame("grunt_aim_0");
      return;
    }
    if (!e.fired) {
      e.fired = true;
      e.sprite.setFrame("grunt_fire_0");
      const m = e.ctx.anchor("grunt_aim_0", "muzzle");
      const mx = e.x + (m.x - 24) * e.facing;
      const my = e.y - 48 + m.y;
      const p = e.ctx.player;
      let ang = Math.atan2(p.centerY - my, (p.x - mx) * e.facing);
      ang = Math.max(-G.maxAngle, Math.min(G.maxAngle, ang));
      e.ctx.projectiles.fire("enemyBullet", mx, my, Math.cos(ang) * e.facing * G.bulletSpeed, Math.sin(ang) * G.bulletSpeed, 1);
      e.ctx.fx.play("flash", mx, my);
      e.ctx.events.emit("sound", "enemyShot");
    }
    if (t > G.aimTime + 0.35) {
      e.cooldown.trigger(e.ctx.rng.range(G.fireGap[0], G.fireGap[1]) * (e.ctx.state.easy ? 1.5 : 1));
      return "engage";
    }
  }
}
