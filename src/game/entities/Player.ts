import { GameObjects, Geom, type Physics } from "phaser";
import { StateMachine } from "../../core/fsm/StateMachine";
import { Cooldown } from "../../core/time/Cooldown";
import { Action } from "../../domain/input/Actions";
import { KILLED, MISS, type Hit, type HitResult } from "../../domain/combat/Damage";
import { DEPTH } from "../../config/display";
import { BOMB, PLAYER } from "../../config/tuning";
import { TEX } from "../assets/keys";
import type { GameContext, PlayerLocator } from "../context/GameContext";
import type { Target } from "../systems/CombatSystem";
import type { CharacterDef } from "../../domain/characters/Characters";

type Life = "alive" | "dying" | "down" | "piloting";
type Aim = "fwd" | "up" | "down";

export class Player implements Target, PlayerLocator {
  readonly faction = "player" as const;
  readonly legs: Physics.Arcade.Sprite;
  readonly torso: GameObjects.Sprite;
  private readonly beam: GameObjects.TileSprite;
  private readonly beamRect = new Geom.Rectangle();
  private beaming = false;
  private beamTick = 0;
  facing: 1 | -1 = 1;
  private readonly life: StateMachine<Player, Life>;
  private readonly fireCd = new Cooldown(0.1);
  private readonly knifeRect = new Geom.Rectangle();
  private invuln = 0;
  private action: "none" | "knife" | "throw" = "none";
  private actionTime = 0;
  private aimAngle = 0;
  private crouching = false;
  private jumpCut = true;
  private recoil = 0;
  private burstLeft = 0;
  private burstTimer = 0;
  private onGround = false;
  private fallSpeed = 0;

  constructor(private readonly ctx: GameContext, x: number, y: number, readonly char: CharacterDef) {
    const scene = ctx.scene;
    this.legs = scene.physics.add.sprite(x, y, TEX.atlas, `${char.id}_legs_stand_0`).setOrigin(0.5, 1).setDepth(DEPTH.player);
    this.torso = scene.add.sprite(x, y, TEX.atlas, `${char.id}_pistol_fwd_0`).setOrigin(0.5, 1).setDepth(DEPTH.player + 1);
    this.beam = scene.add.tileSprite(0, 0, 8, 7, TEX.atlas, "beam_h_0").setDepth(DEPTH.player + 2).setVisible(false);
    this.setBody(false);
    scene.physics.add.collider(this.legs, ctx.terrain.solids);
    scene.physics.add.collider(this.legs, ctx.terrain.platforms);
    this.life = new StateMachine<Player, Life>(this, {
      alive: { update: (p, dt) => p.tickAlive(dt) },
      dying: {
        enter: (p) => {
          p.torso.setVisible(false);
          p.legs.setVelocityX(0);
          p.legs.play(`${p.char.id}_die`);
        },
        update: (_p, _dt, t) => (t > PLAYER.respawnDelay ? "down" : undefined),
      },
      down: { enter: (p) => p.legs.setVisible(false) },
      piloting: {
        enter: (p) => {
          p.legs.setVisible(false);
          p.torso.setVisible(false);
          (p.legs.body as Physics.Arcade.Body).enable = false;
        },
        exit: (p) => {
          (p.legs.body as Physics.Arcade.Body).enable = true;
        },
      },
    }, "alive");
    this.invuln = PLAYER.respawnInvulnerable;
  }

  get x(): number {
    return this.legs.x;
  }

  get y(): number {
    return this.legs.y;
  }

  get centerY(): number {
    return this.legs.y - (this.crouching ? 12 : 18);
  }

  get alive(): boolean {
    return this.life.is("alive", "piloting");
  }

  get onFoot(): boolean {
    return this.life.is("alive");
  }

  get state(): Life {
    return this.life.current;
  }

  get isDown(): boolean {
    return this.life.is("down");
  }

  get grounded(): boolean {
    return this.onGround;
  }

  get invulnerable(): boolean {
    return this.invuln > 0;
  }

  isHittable(): boolean {
    return this.life.is("alive") && this.invuln <= 0;
  }

  bounds(out: Geom.Rectangle): Geom.Rectangle {
    const h = this.crouching ? PLAYER.body.crouchH : PLAYER.body.h;
    return out.setTo(this.legs.x - 6, this.legs.y - h, 12, h);
  }

  hit(_hit: Hit): HitResult {
    if (!this.isHittable()) return MISS;
    this.die();
    return KILLED;
  }

  die(): void {
    if (!this.life.is("alive")) return;
    this.life.change("dying");
    this.ctx.events.emit("sound", "die");
    this.ctx.events.emit("playerDied", { x: this.x, y: this.y });
  }

  respawn(x: number): void {
    this.legs.setPosition(x, 0).setVelocity(0, 0).setVisible(true).setAlpha(1);
    this.torso.setVisible(true);
    this.crouching = false;
    this.setBody(false);
    this.action = "none";
    this.aimAngle = 0;
    this.facing = 1;
    this.invuln = PLAYER.respawnInvulnerable;
    this.life.change("alive");
    this.ctx.events.emit("playerSpawned", undefined);
  }

  debugShield(seconds: number): void {
    this.invuln = seconds;
  }

  enterVehicle(): void {
    this.life.change("piloting");
  }

  exitVehicle(x: number, y: number): void {
    this.life.change("alive");
    this.legs.setPosition(x, y).setVisible(true).setVelocity(0, -PLAYER.jumpSpeed * 0.9);
    this.torso.setVisible(true);
    this.invuln = PLAYER.exitInvulnerable;
    this.crouching = false;
    this.setBody(false);
  }

  tick(dt: number): void {
    this.beaming = false;
    if (this.invuln > 0) this.invuln -= dt;
    this.fireCd.tick(dt);
    if (this.recoil > 0) this.recoil -= dt;
    this.life.update(dt);
  }

  private setBody(crouch: boolean): void {
    const h = crouch ? PLAYER.body.crouchH : PLAYER.body.h;
    (this.legs.body as Physics.Arcade.Body).setSize(PLAYER.body.w, h).setOffset((48 - PLAYER.body.w) / 2, 48 - h);
  }

  private tickAlive(dt: number): void {
    const inp = this.ctx.input;
    const body = this.legs.body as Physics.Arcade.Body;
    const wasGround = this.onGround;
    this.onGround = body.blocked.down || body.touching.down;
    if (this.onGround && !wasGround && this.fallSpeed > 160) this.ctx.fx.play("dust", this.legs.x, this.legs.y - 4, { depth: DEPTH.player - 1 });
    this.fallSpeed = body.velocity.y;
    const wantCrouch = this.onGround && inp.held(Action.Down);
    if (wantCrouch !== this.crouching) {
      this.crouching = wantCrouch;
      this.setBody(wantCrouch);
    }
    const axis = inp.axisX;
    if (axis !== 0 && this.action !== "knife") this.facing = axis;
    const speed = this.crouching ? PLAYER.crawlSpeed : this.char.runSpeed;
    body.setVelocityX(this.action === "knife" ? 0 : axis * speed);
    const minX = this.ctx.camera.left + 8;
    const maxX = this.ctx.camera.right - 8;
    if (this.legs.x < minX) { this.legs.x = minX; if (body.velocity.x < 0) body.setVelocityX(0); }
    if (this.legs.x > maxX) { this.legs.x = maxX; if (body.velocity.x > 0) body.setVelocityX(0); }
    if (inp.pressed(Action.Jump) && this.onGround) {
      body.setVelocityY(-PLAYER.jumpSpeed);
      this.jumpCut = false;
      this.onGround = false;
      this.ctx.events.emit("sound", "jump");
    }
    if (!this.jumpCut && body.velocity.y < 0 && !inp.held(Action.Jump)) {
      body.setVelocityY(body.velocity.y * PLAYER.shortHopCut);
      this.jumpCut = true;
    }
    if (body.velocity.y >= 0) this.jumpCut = true;
    const aim: Aim = inp.held(Action.Up) ? "up" : !this.onGround && inp.held(Action.Down) ? "down" : "fwd";
    const target = aim === "up" ? -Math.PI / 2 : aim === "down" ? Math.PI / 2 : 0;
    const weapon = this.ctx.state.loadout.weapon;
    if (weapon.diagonal && (inp.held(Action.Fire) || this.burstLeft > 0)) {
      const step = 9 * dt;
      this.aimAngle += Math.max(-step, Math.min(step, target - this.aimAngle));
    } else this.aimAngle = target;
    if (this.action !== "none") {
      this.actionTime -= dt;
      if (this.actionTime <= 0) this.action = "none";
    }
    if (inp.pressed(Action.Fire) && this.action === "none" && this.tryKnife()) return;
    if (weapon.mode === "beam") {
      if (inp.held(Action.Fire) && this.action === "none") this.fireBeam(dt);
      else this.beamTick = 0;
    }
    if (inp.pressed(Action.Fire) && this.action === "none" && this.fireCd.ready) {
      this.fireCd.trigger(weapon.cooldown);
      this.burstLeft = weapon.burst;
      this.burstTimer = 0;
    }
    if (this.burstLeft > 0) {
      this.burstTimer -= dt;
      if (this.burstTimer <= 0) {
        this.shoot();
        this.burstLeft = this.ctx.state.loadout.weapon.id === weapon.id ? this.burstLeft - 1 : 0;
        this.burstTimer = weapon.burstGap;
      }
    }
    if (inp.pressed(Action.Bomb) && this.action === "none") this.throwBomb();
  }

  private tryKnife(): boolean {
    const r = this.knifeRect;
    const reach = this.char.knifeReach;
    const x0 = this.facing > 0 ? this.legs.x - 4 : this.legs.x - reach;
    r.setTo(x0, this.legs.y - PLAYER.knifeHeight - 4, reach + 4, PLAYER.knifeHeight + 4);
    const melee = (t: Target) => (t as Target & { meleeable?: boolean }).meleeable === true;
    if (!this.ctx.combat.anyInRect("player", r, melee)) return false;
    this.action = "knife";
    this.actionTime = PLAYER.knifeTime;
    this.ctx.combat.strikeAll(r, { amount: 4, kind: "knife", from: "player", x: this.legs.x + this.facing * 14, y: this.legs.y - 18 }, melee);
    this.ctx.fx.thud(this.legs.x + this.facing * 16, this.legs.y - 14);
    this.ctx.events.emit("sound", "knife");
    return true;
  }

  private aimKey(): Aim {
    if (this.aimAngle < -Math.PI / 4) return "up";
    if (this.aimAngle > Math.PI / 4) return "down";
    return "fwd";
  }

  private torsoFrame(recoil: boolean): string {
    return `${this.char.id}_${this.ctx.state.loadout.weapon.torso}_${this.aimKey()}_${recoil ? 1 : 0}`;
  }

  private muzzle(): { x: number; y: number } {
    const a = this.ctx.anchor(this.torsoFrame(false), "muzzle");
    const drop = Number(this.ctx.anchorValue(this.legs.frame.name, "drop")) || 0;
    return { x: this.legs.x + (a.x - 24) * this.facing, y: this.legs.y - 48 + a.y + drop };
  }

  private shoot(): void {
    const loadout = this.ctx.state.loadout;
    const w = loadout.weapon;
    this.recoil = 0.06;
    const m = this.muzzle();
    const dx = Math.cos(this.aimAngle) * this.facing;
    const dy = Math.sin(this.aimAngle);
    const fx = this.ctx.fx;
    fx.play("flash", m.x, m.y, { flipX: this.facing < 0, depth: DEPTH.player + 2 });
    if (w.mode === "bullet") {
      this.ctx.projectiles.fire("bullet", m.x, m.y, dx * w.speed, dy * w.speed, w.damage);
      fx.casing(this.legs.x + this.facing * 4, this.legs.y - 24, this.facing);
      this.ctx.events.emit("sound", "shot");
    } else if (w.mode === "stream") {
      const j = this.ctx.rng.range(-0.04, 0.04);
      this.ctx.projectiles.fire("heavy", m.x, m.y + this.ctx.rng.range(-1.5, 1.5), Math.cos(this.aimAngle + j) * this.facing * w.speed, Math.sin(this.aimAngle + j) * w.speed, w.damage);
      fx.casing(this.legs.x, this.legs.y - 24, this.facing);
      this.ctx.events.emit("sound", "rivet");
    } else if (w.mode === "blast") {
      const aim = this.aimKey();
      if (aim === "fwd") fx.play("blast", m.x, m.y, { flipX: this.facing < 0, originY: 0.5 });
      else fx.play("blast_up", m.x, m.y, { originY: aim === "up" ? 1 : 0, flipY: aim === "down" });
      const r = this.knifeRect;
      if (aim === "fwd") r.setTo(this.facing > 0 ? m.x : m.x - w.range, m.y - 22, w.range, 44);
      else r.setTo(m.x - 22, aim === "up" ? m.y - w.range : m.y, 44, w.range);
      this.ctx.combat.strikeAll(r, { amount: w.damage, kind: "blast", from: "player", x: m.x, y: m.y });
      this.ctx.camera.shake(2, 0.08);
      this.ctx.events.emit("sound", "scatter");
    } else if (w.mode === "flame") {
      this.ctx.projectiles.fire("flame", m.x + dx * 6, m.y + dy * 6, dx * w.speed, dy * w.speed, w.damage);
      this.ctx.events.emit("sound", "flame");
    } else if (w.mode === "rocket") {
      this.ctx.projectiles.fire("rocket", m.x, m.y, dx * 90, dy * 90, w.damage);
      this.ctx.events.emit("sound", "rocket");
    }
    loadout.consumeShot();
  }

  private fireBeam(dt: number): void {
    const w = this.ctx.state.loadout.weapon;
    const aim = this.aimKey();
    const dx = aim === "fwd" ? this.facing : 0;
    const dy = aim === "up" ? -1 : aim === "down" ? 1 : 0;
    const tip = this.muzzle();
    const m = { x: tip.x - dx * 4, y: tip.y - dy * 4 };
    let len = 4;
    while (len < w.range && !this.ctx.terrain.solidAt(m.x + dx * len, m.y + dy * len) && this.ctx.camera.visible(m.x + dx * len, 8)) len += 4;
    this.beaming = true;
    this.recoil = 0.05;
    const flicker = Math.floor(this.ctx.scene.time.now / 50) % 2;
    if (dx !== 0) {
      this.beam.setFrame(`beam_h_${flicker}`).setOrigin(dx > 0 ? 0 : 1, 0.5).setSize(len, 7).setPosition(Math.round(m.x), Math.round(m.y));
      this.beam.tilePositionX += dt * 240 * dx;
      this.beamRect.setTo(dx > 0 ? m.x : m.x - len, m.y - 3, len, 6);
    } else {
      this.beam.setFrame(`beam_v_${flicker}`).setOrigin(0.5, dy < 0 ? 1 : 0).setSize(7, len).setPosition(Math.round(m.x), Math.round(m.y));
      this.beam.tilePositionY += dt * 240 * dy;
      this.beamRect.setTo(m.x - 3, dy < 0 ? m.y - len : m.y, 6, len);
    }
    this.beamTick -= dt;
    if (this.beamTick > 0) return;
    this.beamTick = w.cooldown;
    this.ctx.combat.forEachOverlap("player", this.beamRect, (t) => t.hit({ amount: w.damage, kind: "beam", from: "player", x: m.x, y: m.y }));
    if (len < w.range) this.ctx.fx.spark(m.x + dx * len, m.y + dy * len, -dx);
    this.ctx.events.emit("sound", "laser");
    this.ctx.state.loadout.consumeShot();
  }

  private throwBomb(): void {
    if (this.ctx.projectiles.count("bomb") >= PLAYER.maxBombsOnScreen) return;
    if (!this.ctx.state.loadout.useBomb()) return;
    this.action = "throw";
    this.actionTime = PLAYER.throwTime;
    const body = this.legs.body as Physics.Arcade.Body;
    const b = this.ctx.projectiles.fire("bomb", this.legs.x + this.facing * 4, this.legs.y - 34, this.facing * BOMB.throwX * this.char.throwBoost + body.velocity.x * 0.3, -BOMB.throwY * Math.sqrt(this.char.throwBoost), BOMB.damage);
    if (b) b.bounces = this.char.bombBounces;
    this.ctx.events.emit("sound", "throw");
  }

  syncVisuals(): void {
    const st = this.life.current;
    this.beam.setVisible(this.beaming && st === "alive");
    if (st === "piloting" || st === "down") return;
    const flip = this.facing < 0;
    this.legs.setFlipX(flip);
    if (st === "dying") return;
    const body = this.legs.body as Physics.Arcade.Body;
    const moving = Math.abs(body.velocity.x) > 1;
    let legKey: string;
    const c = this.char.id;
    if (!this.onGround) legKey = body.velocity.y < 0 ? `${c}_legs_jump_0` : `${c}_legs_fall_0`;
    else if (this.crouching) legKey = moving ? "crawl" : `${c}_legs_crouch_0`;
    else legKey = moving ? "run" : `${c}_legs_stand_0`;
    if (legKey === "run" || legKey === "crawl") {
      const anim = `${this.char.id}_legs_${legKey}`;
      if (this.legs.anims.currentAnim?.key !== anim || !this.legs.anims.isPlaying) this.legs.play(anim, true);
    } else {
      this.legs.stop();
      this.legs.setFrame(legKey);
    }
    const drop = Number(this.ctx.anchorValue(this.legs.frame.name, "drop")) || 0;
    let frame: string;
    if (this.action === "knife") frame = `${this.char.id}_knife_${Math.min(2, Math.floor((1 - this.actionTime / PLAYER.knifeTime) * 3))}`;
    else if (this.action === "throw") frame = `${this.char.id}_throw_${Math.min(2, Math.floor((1 - this.actionTime / PLAYER.throwTime) * 3))}`;
    else frame = this.torsoFrame(this.recoil > 0);
    const idleBob = !moving && this.onGround && !this.crouching ? Math.floor(this.ctx.scene.time.now / 500) % 2 : 0;
    this.torso.setFrame(frame).setFlipX(flip).setPosition(this.legs.x, this.legs.y + drop + idleBob).setVisible(true);
    const blink = this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0;
    this.legs.setAlpha(blink ? 0.3 : 1);
    this.torso.setAlpha(blink ? 0.3 : 1);
  }
}
