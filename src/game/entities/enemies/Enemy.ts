import { GameObjects, Geom, type Physics } from "phaser";
import { StateMachine } from "../../../core/fsm/StateMachine";
import { Cooldown } from "../../../core/time/Cooldown";
import { ABSORBED, KILLED, MISS, type Hit, type HitResult } from "../../../domain/combat/Damage";
import { DEPTH } from "../../../config/display";
import { ENEMY } from "../../../config/tuning";
import { TEX } from "../../assets/keys";
import type { GameContext } from "../../context/GameContext";
import type { Target } from "../../systems/CombatSystem";
import { ENEMIES, type EnemyDef, type EnemyType, type IdlePose } from "./EnemyDefs";
import type { EnemyBehaviour } from "./behaviours/EnemyBehaviour";

export type EnemyState = "idle" | "alert" | "engage" | "attack" | "dying" | "gone";

export interface EnemySpawn {
  type: EnemyType;
  x: number;
  y: number;
  idle: IdlePose;
  hold: boolean;
  group: number;
  facing: 1 | -1;
}

export class Enemy implements Target {
  readonly faction = "enemy" as const;
  readonly meleeable = true;
  readonly sprite: Physics.Arcade.Sprite;
  readonly mark: GameObjects.Image;
  readonly fsm: StateMachine<Enemy, EnemyState>;
  readonly cooldown = new Cooldown(1);
  def: EnemyDef = ENEMIES.grunt;
  hp = 1;
  facing: 1 | -1 = -1;
  hold = false;
  group = -1;
  idlePose: IdlePose = "none";
  active = false;
  fired = false;
  private blastSpin = 0;

  constructor(readonly ctx: GameContext, private readonly behaviours: Record<EnemyType, EnemyBehaviour>) {
    const scene = ctx.scene;
    this.sprite = scene.physics.add.sprite(0, 0, TEX.atlas, "grunt_run_0").setOrigin(0.5, 1).setDepth(DEPTH.enemies);
    (this.sprite.body as Physics.Arcade.Body).setSize(14, 30).setOffset(17, 18);
    this.mark = scene.add.image(0, 0, TEX.atlas, "excl_0").setDepth(DEPTH.fx).setVisible(false);
    scene.physics.add.collider(this.sprite, ctx.terrain.solids);
    scene.physics.add.collider(this.sprite, ctx.terrain.platforms);
    this.sprite.disableBody(true, true);
    this.fsm = new StateMachine<Enemy, EnemyState>(this, {
      idle: {
        enter: (e) => { const a = e.def.idleAnims[e.idlePose]; if (a) e.sprite.play(a); },
        update: (e) => (Math.abs(e.ctx.player.x - e.sprite.x) < ENEMY.noticeRange && e.ctx.player.alive ? "alert" : undefined),
      },
      alert: {
        enter: (e) => {
          e.mark.setVisible(true);
          if (e.def.type === "grunt") e.sprite.play("grunt_alert");
          e.ctx.events.emit("sound", "scream");
        },
        update: (e, _dt, t) => {
          e.mark.setPosition(e.sprite.x, e.sprite.y - 50 - Math.min(4, t * 20));
          return t > ENEMY.alertTime ? "engage" : undefined;
        },
        exit: (e) => e.mark.setVisible(false),
      },
      engage: { update: (e, dt) => e.behaviour.engage(e, dt) },
      attack: {
        enter: (e) => { e.fired = false; e.body.setVelocityX(0); },
        update: (e, dt, t) => e.behaviour.attack(e, dt, t),
      },
      dying: {
        update: (e, dt, t) => {
          if (e.blastSpin) e.sprite.rotation += e.blastSpin * dt;
          if (t > 1.2) e.sprite.setAlpha(Math.max(0, 1 - (t - 1.2) * 3));
          return t > 1.55 ? "gone" : undefined;
        },
      },
      gone: { enter: (e) => e.retire() },
    }, "gone");
  }

  get behaviour(): EnemyBehaviour {
    return this.behaviours[this.def.type];
  }

  get body(): Physics.Arcade.Body {
    return this.sprite.body as Physics.Arcade.Body;
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get alive(): boolean {
    return this.active && !this.fsm.is("dying", "gone");
  }

  spawn(s: EnemySpawn): void {
    this.def = ENEMIES[s.type];
    this.hp = this.def.hp;
    this.hold = s.hold;
    this.group = s.group;
    this.idlePose = s.idle;
    this.facing = s.facing;
    this.active = true;
    this.blastSpin = 0;
    this.cooldown.trigger(this.ctx.rng.range(0.4, 1.2));
    this.sprite.enableBody(true, s.x, s.y, true, true).setAlpha(1).setRotation(0).setFlipX(this.facing < 0).setDepth(DEPTH.enemies);
    this.body.checkCollision.none = false;
    this.body.setAllowGravity(true);
    this.sprite.setFrame(this.def.standFrame);
    this.fsm.change(s.idle === "none" ? "engage" : "idle");
  }

  isHittable(): boolean {
    return this.alive;
  }

  bounds(out: Geom.Rectangle): Geom.Rectangle {
    const low = this.fsm.is("idle") || /_(aim|fire|idle|read)_/.test(this.sprite.frame.name);
    const h = low ? 26 : 32;
    return out.setTo(this.sprite.x - 8, this.sprite.y - h, 16, h);
  }

  hit(hit: Hit): HitResult {
    if (!this.alive) return MISS;
    this.hp -= hit.amount;
    this.ctx.fx.flash(this.sprite);
    if (this.hp > 0) {
      this.ctx.events.emit("sound", "hit");
      if (this.fsm.is("idle", "alert")) this.fsm.change("engage");
      return ABSORBED;
    }
    this.kill(hit);
    return KILLED;
  }

  private kill(hit: Hit): void {
    this.mark.setVisible(false);
    this.fsm.change("dying");
    this.ctx.events.emit("enemyKilled", { x: this.x, y: this.y, knife: hit.kind === "knife" });
    this.ctx.events.emit("sound", "enemyDie");
    if (hit.kind === "blast") {
      const away = Math.sign(this.x - hit.x) || 1;
      this.sprite.setFrame(`${this.def.type}_die_0`);
      this.body.setVelocity(away * 90, -230);
      this.blastSpin = away * 9;
      this.body.checkCollision.none = true;
    } else {
      this.body.setVelocityX(0);
      this.sprite.play(this.def.dieAnim);
    }
  }

  faceTarget(): void {
    this.facing = this.ctx.player.x < this.x ? -1 : 1;
    this.sprite.setFlipX(this.facing < 0);
  }

  move(dir: number, speed = this.def.speed): void {
    if (this.hold) dir = 0;
    const cam = this.ctx.camera;
    if (dir < 0 && this.x < cam.left + 12) dir = 0;
    if (dir > 0 && this.x > cam.right - 12 && this.ctx.player.x < this.x) dir = 0;
    this.body.setVelocityX(dir * speed);
    const blocked = (dir < 0 && this.body.blocked.left) || (dir > 0 && this.body.blocked.right);
    if (blocked && this.body.blocked.down) this.body.setVelocityY(-ENEMY.hopSpeed);
    if (dir !== 0) {
      this.facing = dir > 0 ? 1 : -1;
      this.sprite.setFlipX(this.facing < 0);
      if (this.sprite.anims.currentAnim?.key !== this.def.runAnim || !this.sprite.anims.isPlaying) this.sprite.play(this.def.runAnim);
    } else {
      this.sprite.stop();
      this.sprite.setFrame(this.def.standFrame);
      this.faceTarget();
    }
  }

  tick(dt: number): void {
    if (!this.active) return;
    this.cooldown.tick(dt);
    this.fsm.update(dt);
    if (this.active && this.fsm.current !== "dying" && this.x < this.ctx.camera.left - ENEMY.despawnBehind) this.fsm.change("gone");
  }

  private retire(): void {
    this.active = false;
    this.mark.setVisible(false);
    this.sprite.stop();
    this.sprite.disableBody(true, true);
  }
}
