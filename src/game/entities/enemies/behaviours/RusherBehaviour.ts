import { Geom } from "phaser";
import { ENEMY } from "../../../../config/tuning";
import type { Enemy, EnemyState } from "../Enemy";
import type { EnemyBehaviour } from "./EnemyBehaviour";

const R = ENEMY.rusher;
const slashBox = new Geom.Rectangle();

export class RusherBehaviour implements EnemyBehaviour {
  engage(e: Enemy): EnemyState | void {
    const p = e.ctx.player;
    const dx = p.x - e.x;
    if (!p.alive) {
      e.move(0);
      return;
    }
    if (Math.abs(dx) < R.reach && Math.abs(p.y - e.y) < 24) return "attack";
    e.move(Math.sign(dx));
  }

  attack(e: Enemy, _dt: number, t: number): EnemyState | void {
    if (t < R.windup) {
      e.faceTarget();
      e.sprite.setFrame("rusher_slash_0");
      return;
    }
    if (t < R.windup + R.active) {
      e.sprite.setFrame("rusher_slash_1");
      if (!e.fired) {
        e.fired = true;
        e.ctx.events.emit("sound", "knife");
        const x0 = e.facing > 0 ? e.x : e.x - 28;
        slashBox.setTo(x0, e.y - 34, 28, 34);
        e.ctx.combat.strikeFirst(slashBox, { amount: 1, kind: "knife", from: "enemy", x: e.x, y: e.y - 16 });
      }
      return;
    }
    e.sprite.setFrame("rusher_slash_2");
    if (t > R.windup + R.active + R.recover) return "engage";
  }
}
