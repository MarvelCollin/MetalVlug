import type { Hit } from "../../../../domain/combat/Damage";
import { ENEMY } from "../../../../config/tuning";
import type { Enemy, EnemyState } from "../Enemy";
import type { EnemyBehaviour } from "./EnemyBehaviour";

const S = ENEMY.shield;

export class ShieldBehaviour implements EnemyBehaviour {
  engage(e: Enemy): EnemyState | void {
    const dx = e.ctx.player.x - e.x;
    e.move(Math.abs(dx) > S.keepMax || (Math.abs(dx) > S.keepMin && !e.cooldown.ready) ? Math.sign(dx) : 0);
    const p = e.ctx.player;
    if (p.alive && e.cooldown.ready && e.ctx.camera.visible(e.x, -8) && Math.abs(p.x - e.x) < 220 && e.body.blocked.down) return "attack";
  }

  attack(e: Enemy, _dt: number, t: number): EnemyState | void {
    e.faceTarget();
    if (t < S.peekTime) {
      e.sprite.setFrame("shield_peek_0");
      return;
    }
    if (!e.fired) {
      e.fired = true;
      e.sprite.setFrame("shield_fire_0");
      const m = e.ctx.anchor("shield_peek_0", "muzzle");
      const mx = e.x + (m.x - 24) * e.facing;
      const my = e.y - 48 + m.y;
      const p = e.ctx.player;
      let ang = Math.atan2(p.centerY - my, (p.x - mx) * e.facing);
      ang = Math.max(-S.maxAngle, Math.min(S.maxAngle, ang));
      e.ctx.projectiles.fire("enemyBullet", mx, my, Math.cos(ang) * e.facing * S.bulletSpeed, Math.sin(ang) * S.bulletSpeed, 1);
      e.ctx.fx.play("flash", mx, my);
      e.ctx.events.emit("sound", "enemyShot");
    }
    if (t > S.peekTime + S.exposed) {
      e.cooldown.trigger(e.ctx.rng.range(S.fireGap[0], S.fireGap[1]) * (e.ctx.state.easy ? 1.5 : 1));
      return "engage";
    }
  }

  blocks(e: Enemy, hit: Hit): boolean {
    if (hit.kind !== "bullet" || e.fsm.is("attack", "idle", "para")) return false;
    const front = (hit.x - e.x) * e.facing > -2;
    const fromAbove = hit.y < e.y - S.coverHeight;
    return front && !fromAbove;
  }
}
