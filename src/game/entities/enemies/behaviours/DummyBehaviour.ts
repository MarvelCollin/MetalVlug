import type { Enemy, EnemyState } from "../Enemy";
import type { EnemyBehaviour } from "./EnemyBehaviour";

export class DummyBehaviour implements EnemyBehaviour {
  engage(e: Enemy): EnemyState | void {
    e.body.setVelocityX(0);
    if (!e.sprite.anims.isPlaying) e.sprite.setFrame("dummy_idle_0");
  }

  attack(): EnemyState | void {
    return "engage";
  }
}
