import type { GameObjects, Geom } from "phaser";
import { ABSORBED, KILLED, MISS, type Hit, type HitResult } from "../../../domain/combat/Damage";
import { DEPTH } from "../../../config/display";
import { SCORE } from "../../../config/tuning";
import { TEX } from "../../assets/keys";
import type { GameContext } from "../../context/GameContext";
import type { Target } from "../../systems/CombatSystem";
import type { PickupType } from "../../systems/PickupSystem";

export type PropType = "crate" | "barrel";

export class Prop implements Target {
  readonly faction = "enemy" as const;
  private readonly view: GameObjects.Image;
  private hp: number;

  constructor(private readonly ctx: GameContext, private readonly type: PropType, x: number, y: number, private readonly drop?: PickupType) {
    this.hp = type === "crate" ? 3 : 1;
    this.view = ctx.scene.add.image(x, y, TEX.atlas, type === "crate" ? "crate_0" : "barrel_0").setOrigin(0.5, 1).setDepth(DEPTH.props);
    ctx.combat.add(this);
  }

  isHittable(): boolean {
    return this.hp > 0 && this.ctx.camera.visible(this.view.x, 8);
  }

  bounds(out: Geom.Rectangle): Geom.Rectangle {
    return out.setTo(this.view.x - this.view.width / 2, this.view.y - this.view.height, this.view.width, this.view.height);
  }

  hit(hit: Hit): HitResult {
    if (this.hp <= 0) return MISS;
    this.hp -= hit.amount;
    this.ctx.fx.flash(this.view as unknown as GameObjects.Sprite);
    if (this.hp > 0) {
      if (this.type === "crate") this.view.setFrame("crate_1");
      this.ctx.events.emit("sound", "clank");
      return ABSORBED;
    }
    this.destroy();
    return KILLED;
  }

  private destroy(): void {
    const { x, y } = this.view;
    this.view.setVisible(false);
    this.ctx.combat.remove(this);
    if (this.type === "barrel") {
      this.ctx.events.emit("explode", { x, y: y - 6, radius: 34, damage: 8, from: "player", big: true });
    } else {
      this.ctx.fx.debris(x, y - 12, 6, ["debris_1", "debris_1", "debris_0"]);
      this.ctx.events.emit("sound", "clank");
      this.ctx.events.emit("score", { points: SCORE.crate, x, y });
    }
    if (this.drop) this.ctx.pickups.spawn(this.drop, x, y - 12);
  }
}
