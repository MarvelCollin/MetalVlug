import { Geom, type GameObjects, type Physics } from "phaser";
import { StateMachine } from "../../../core/fsm/StateMachine";
import { Action } from "../../../domain/input/Actions";
import { ABSORBED, MISS, type Hit, type HitResult } from "../../../domain/combat/Damage";
import { DEPTH } from "../../../config/display";
import { MULE, SCORE } from "../../../config/tuning";
import { TEX } from "../../assets/keys";
import type { GameContext } from "../../context/GameContext";
import type { Target } from "../../systems/CombatSystem";
import type { Player } from "../Player";

type MuleState = "parked" | "piloted" | "dying" | "charging" | "wrecked";

export class Mule implements Target {
  readonly faction = "player" as const;
  readonly sprite: Physics.Arcade.Sprite;
  private readonly gun: GameObjects.Image;
  private readonly fsm: StateMachine<Mule, MuleState>;
  private readonly box = new Geom.Rectangle();
  private gunAngle = 0;
  private facing: 1 | -1 = 1;
  private vulcanTimer = 0;
  private reenter = 0;
  private onGround = false;

  constructor(private readonly ctx: GameContext, private readonly player: Player, x: number, y: number) {
    const scene = ctx.scene;
    this.sprite = scene.physics.add.sprite(x, y, TEX.atlas, "mule_idle_0").setOrigin(0.5, 1).setDepth(DEPTH.vehicle);
    (this.sprite.body as Physics.Arcade.Body).setSize(30, 34).setOffset(17, 22);
    this.gun = scene.add.image(x, y, TEX.atlas, "mule_gun_0").setOrigin(4 / 24, 0.5).setDepth(DEPTH.vehicle + 1);
    scene.physics.add.collider(this.sprite, ctx.terrain.solids);
    scene.physics.add.collider(this.sprite, ctx.terrain.platforms);
    ctx.combat.add(this);
    this.fsm = new StateMachine<Mule, MuleState>(this, {
      parked: { update: (m, dt) => m.tickParked(dt) },
      piloted: {
        enter: (m) => {
          m.player.enterVehicle();
          m.ctx.state.piloting = true;
          m.ctx.events.emit("sound", "weapon");
          m.ctx.events.emit("banner", { text: "MULE!", seconds: 1 });
        },
        update: (m, dt) => m.tickPiloted(dt),
      },
      dying: {
        update: (m, dt, t) => {
          m.tickPiloted(dt);
          m.sprite.setTint(Math.floor(t * 12) % 2 ? 0xff6655 : 0xffffff);
          if (t > MULE.dyingTime) {
            if (m.ctx.state.piloting) {
              m.ejectPilot();
              m.player.die();
            }
            m.blowUp(MULE.chargeDamage / 2);
            return "wrecked";
          }
        },
      },
      charging: {
        enter: (m) => m.sprite.play("mule_walk"),
        update: (m, _dt, t) => {
          m.body.setVelocityX(m.facing * MULE.chargeSpeed);
          m.syncGun();
          m.box.setTo(m.sprite.x - 18, m.sprite.y - 40, 36, 40);
          if (t > MULE.chargeTime || m.ctx.combat.firstOverlap("player", m.box)) {
            m.blowUp(MULE.chargeDamage);
            return "wrecked";
          }
        },
      },
      wrecked: {
        enter: (m) => {
          m.ctx.combat.remove(m);
          m.sprite.disableBody(true, true);
          m.gun.setVisible(false);
          m.ctx.state.muleArmour = 0;
        },
      },
    }, "parked");
    ctx.state.muleShells = MULE.shells;
  }

  get body(): Physics.Arcade.Body {
    return this.sprite.body as Physics.Arcade.Body;
  }

  get piloted(): boolean {
    return this.fsm.is("piloted", "dying");
  }

  get x(): number {
    return this.sprite.x;
  }

  isHittable(): boolean {
    return this.fsm.is("piloted");
  }

  bounds(out: Geom.Rectangle): Geom.Rectangle {
    return out.setTo(this.sprite.x - 16, this.sprite.y - 40, 32, 40);
  }

  hit(_hit: Hit): HitResult {
    if (!this.fsm.is("piloted")) return MISS;
    this.ctx.state.muleArmour -= 1;
    this.ctx.fx.flash(this.sprite, 0.1);
    this.ctx.events.emit("sound", "clank");
    if (this.ctx.state.muleArmour <= 0) this.fsm.change("dying");
    return ABSORBED;
  }

  refuel(): number {
    if (this.ctx.state.muleArmour >= MULE.armour) return SCORE.spareItem;
    this.ctx.state.muleArmour += 1;
    return 0;
  }

  tick(dt: number): void {
    if (this.reenter > 0) this.reenter -= dt;
    this.onGround = this.body.blocked.down || this.body.touching.down;
    this.fsm.update(dt);
  }

  private tickParked(_dt: number): MuleState | void {
    this.body.setVelocityX(0);
    this.sprite.setFrame("mule_idle_0");
    this.syncGun();
    if (!this.player.onFoot || this.reenter > 0 || this.ctx.state.piloting) return;
    this.box.setTo(this.sprite.x - 14, this.sprite.y - 44, 28, 44);
    const p = this.player.bounds(new Geom.Rectangle());
    if (Geom.Intersects.RectangleToRectangle(p, this.box)) {
      this.ctx.state.muleArmour = Math.max(1, this.ctx.state.muleArmour || MULE.armour);
      this.fsm.change("piloted");
    }
  }

  private tickPiloted(dt: number): void {
    const inp = this.ctx.input;
    const axis = inp.axisX;
    if (axis !== 0) this.facing = axis;
    this.body.setVelocityX(axis * MULE.speed);
    const minX = this.ctx.camera.left + 18;
    const maxX = this.ctx.camera.right - 18;
    if (this.sprite.x < minX) this.sprite.x = minX;
    if (this.sprite.x > maxX) this.sprite.x = maxX;
    const wantsExit = inp.pressed(Action.Exit) || (inp.held(Action.Up) && inp.pressed(Action.Jump));
    if (wantsExit) {
      const charge = inp.held(Action.Fire) || inp.pressed(Action.Fire);
      this.ejectPilot();
      if (charge || this.fsm.is("dying")) this.fsm.change("charging");
      else this.fsm.change("parked");
      return;
    }
    if (inp.pressed(Action.Jump) && this.onGround) this.body.setVelocityY(-MULE.jumpSpeed);
    const crouch = this.onGround && inp.held(Action.Down);
    const moving = axis !== 0;
    if (crouch) {
      this.sprite.stop();
      this.sprite.setFrame("mule_crouch_0");
    } else if (moving) {
      if (!this.sprite.anims.isPlaying) this.sprite.play("mule_walk");
    } else {
      this.sprite.stop();
      this.sprite.setFrame("mule_idle_0");
    }
    this.sprite.setFlipX(this.facing < 0);
    const up = inp.held(Action.Up);
    let target = this.facing > 0 ? 0 : -Math.PI;
    if (up) target = axis === 0 ? -Math.PI / 2 : axis > 0 ? -Math.PI / 4 : (-3 * Math.PI) / 4;
    const step = MULE.aimTurnRate * dt;
    this.gunAngle += Math.max(-step, Math.min(step, target - this.gunAngle));
    this.syncGun();
    this.vulcanTimer -= dt;
    if (inp.held(Action.Fire) && this.vulcanTimer <= 0) {
      this.vulcanTimer = MULE.vulcanGap;
      const mx = this.gun.x + Math.cos(this.gunAngle) * 18;
      const my = this.gun.y + Math.sin(this.gunAngle) * 18;
      const j = this.ctx.rng.range(-0.03, 0.03);
      this.ctx.projectiles.fire("vulcan", mx, my, Math.cos(this.gunAngle + j) * MULE.vulcanSpeed, Math.sin(this.gunAngle + j) * MULE.vulcanSpeed, 1);
      this.ctx.fx.play("flash", mx, my, { scale: 0.8 });
      this.ctx.events.emit("sound", "vulcan");
    }
    if (inp.pressed(Action.Bomb) && this.ctx.state.muleShells > 0) {
      this.ctx.state.muleShells -= 1;
      this.ctx.projectiles.fire("shell", this.sprite.x + this.facing * 20, this.sprite.y - 26, this.facing * MULE.shellSpeedX, -MULE.shellSpeedY, MULE.shellDamage);
      this.ctx.camera.shake(2, 0.1);
      this.ctx.events.emit("sound", "cannon");
    }
    this.player.legs.setPosition(this.sprite.x, this.sprite.y);
  }

  private syncGun(): void {
    const frame = this.sprite.frame.name;
    const pivot = this.ctx.anchor(frame, "pivot");
    const px = pivot.x || 29;
    const py = pivot.y || 11;
    const ox = (px - 32) * (this.sprite.flipX ? -1 : 1);
    this.gun.setPosition(this.sprite.x + ox, this.sprite.y - 56 + py).setRotation(this.gunAngle).setVisible(this.sprite.visible);
  }

  forceEject(): void {
    if (!this.piloted) return;
    this.ejectPilot();
    this.fsm.change("parked");
  }

  private ejectPilot(): void {
    this.ctx.state.piloting = false;
    this.reenter = MULE.reenterDelay;
    this.player.exitVehicle(this.sprite.x, this.sprite.y - 40);
  }

  private blowUp(damage: number): void {
    this.ctx.events.emit("explode", { x: this.sprite.x, y: this.sprite.y - 12, radius: MULE.chargeRadius, damage, from: "player", big: true });
    this.ctx.fx.debris(this.sprite.x, this.sprite.y - 20, 10);
  }
}
