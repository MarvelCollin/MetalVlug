import { Geom, type GameObjects } from "phaser";
import { StateMachine } from "../../../core/fsm/StateMachine";
import { KILLED, MISS, type Hit, type HitResult } from "../../../domain/combat/Damage";
import { DEPTH, VIEW_H } from "../../../config/display";
import { PHYSICS } from "../../../config/tuning";
import { TEX } from "../../assets/keys";
import type { GameContext } from "../../context/GameContext";
import type { Target } from "../../systems/CombatSystem";
import type { PickupType } from "../../systems/PickupSystem";

type HostageState = "caged" | "cheer" | "give" | "run" | "gone";

export class Hostage implements Target {
  readonly faction = "enemy" as const;
  readonly meleeable = true;
  private readonly cage: GameObjects.Image;
  private readonly man: GameObjects.Sprite;
  private readonly fsm: StateMachine<Hostage, HostageState>;
  private readonly touch = new Geom.Rectangle();
  private vy = 0;

  constructor(private readonly ctx: GameContext, x: number, y: number, private readonly drop: PickupType) {
    this.man = ctx.scene.add.sprite(x, y, TEX.atlas, "tinker_sit_0").setOrigin(0.5, 1).setDepth(DEPTH.hostages).play("tinker_sit");
    this.cage = ctx.scene.add.image(x, y, TEX.atlas, "cage_0").setOrigin(0.5, 1).setDepth(DEPTH.hostages + 1);
    this.fsm = new StateMachine<Hostage, HostageState>(this, {
      caged: {},
      cheer: {
        enter: (h) => {
          h.cage.setFrame("cage_1");
          h.man.play("tinker_cheer");
          h.ctx.events.emit("sound", "rescue");
          h.ctx.events.emit("rescued", { x: h.man.x, y: h.man.y });
        },
        update: (_h, _dt, t) => (t > 0.7 ? "give" : undefined),
      },
      give: {
        enter: (h) => {
          h.man.play("tinker_give");
          const toward = Math.sign(h.ctx.player.x - h.man.x) || 1;
          const reach = Math.min(Math.abs(h.ctx.player.x - h.man.x), 120);
          h.ctx.pickups.spawn(h.drop, h.man.x + toward * 10, h.man.y - 20, toward * Math.max(40, reach * 1.6));
        },
        update: (_h, _dt, t) => (t > 0.5 ? "run" : undefined),
      },
      run: {
        enter: (h) => {
          h.vy = 0;
          h.man.setFlipX(true).play("tinker_run");
        },
        update: (h, dt) => {
          h.man.x -= 110 * dt;
          const floor = h.ctx.terrain.groundBelow(h.man.x, h.man.y);
          if (h.man.y < floor) {
            h.vy = Math.min(420, h.vy + PHYSICS.gravity * dt);
            h.man.y = Math.min(floor, h.man.y + h.vy * dt);
            if (h.man.anims.isPlaying) h.man.stop();
            h.man.setFrame("tinker_cheer_1");
          } else if (!h.man.anims.isPlaying) {
            h.vy = 0;
            h.man.play("tinker_run");
          }
          return h.man.x < h.ctx.camera.left - 30 || h.man.y > VIEW_H + 40 ? "gone" : undefined;
        },
      },
      gone: { enter: (h) => h.man.setVisible(false) },
    }, "caged");
    ctx.combat.add(this);
  }

  get x(): number {
    return this.man.x;
  }

  get caged(): boolean {
    return this.fsm.is("caged");
  }

  isHittable(): boolean {
    return this.fsm.is("caged") && this.ctx.camera.visible(this.man.x);
  }

  bounds(out: Geom.Rectangle): Geom.Rectangle {
    return out.setTo(this.cage.x - 14, this.cage.y - 40, 28, 40);
  }

  hit(_hit: Hit): HitResult {
    if (!this.isHittable()) return MISS;
    this.free();
    return KILLED;
  }

  free(): void {
    if (!this.fsm.is("caged")) return;
    this.ctx.fx.debris(this.cage.x, this.cage.y - 24, 7, ["bar_0", "bar_1", "bar_1", "debris_0"]);
    this.ctx.fx.spark(this.cage.x, this.cage.y - 22);
    this.ctx.fx.sparkles(this.cage.x, this.cage.y - 26, 6, 14);
    this.ctx.events.emit("sound", "clank");
    this.fsm.change("cheer");
  }

  tick(dt: number, playerBox: Geom.Rectangle): void {
    if (this.fsm.is("caged") && Geom.Intersects.RectangleToRectangle(playerBox, this.bounds(this.touch))) this.free();
    this.fsm.update(dt);
  }
}
