import type { GameObjects, Geom } from "phaser";
import { ABSORBED, KILLED, MISS, type Hit, type HitResult } from "../../../domain/combat/Damage";
import type { GameContext } from "../../context/GameContext";
import type { Target } from "../../systems/CombatSystem";

export class BossPart implements Target {
  readonly faction = "enemy" as const;
  armoured = false;
  hp: number;

  constructor(
    private readonly ctx: GameContext,
    readonly view: GameObjects.Sprite,
    hp: number,
    private readonly w: number,
    private readonly h: number,
    private readonly onBreak: (part: BossPart) => void,
  ) {
    this.hp = hp;
    ctx.combat.add(this);
  }

  get broken(): boolean {
    return this.hp <= 0;
  }

  isHittable(): boolean {
    return !this.broken && !this.armoured && this.view.visible;
  }

  bounds(out: Geom.Rectangle): Geom.Rectangle {
    return out.setTo(this.view.x - this.w / 2, this.view.y - this.h, this.w, this.h);
  }

  hit(hit: Hit): HitResult {
    if (this.broken) return MISS;
    this.hp -= hit.kind === "knife" ? hit.amount / 2 : hit.amount;
    this.ctx.fx.flash(this.view);
    this.ctx.events.emit("sound", "hit");
    if (this.hp > 0) return ABSORBED;
    this.onBreak(this);
    return KILLED;
  }
}
