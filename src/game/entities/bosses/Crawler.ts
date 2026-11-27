import { Geom, type GameObjects } from "phaser";
import { StateMachine } from "../../../core/fsm/StateMachine";
import { Cooldown } from "../../../core/time/Cooldown";
import { DEPTH } from "../../../config/display";
import { CRAWLER, PHYSICS, SCORE } from "../../../config/tuning";
import { TEX } from "../../assets/keys";
import type { GameContext } from "../../context/GameContext";
import type { EnemyFactory } from "../enemies/EnemyFactory";
import type { Boss } from "./Boss";
import { BossPart } from "./BossPart";

type CrawlerState = "waiting" | "rolling" | "phase1" | "phase2" | "dying" | "dead";
type RamStep = "idle" | "rev" | "charge" | "hold" | "back";

const HULL_W = 176;
const HULL_H = 72;
const HULL_LIFT = 6;

export class Crawler implements Boss {
  readonly name = "RAILBREAKER";
  private readonly hull: GameObjects.Image;
  private readonly tread: GameObjects.Sprite;
  private readonly turret: BossPart;
  private readonly engine: BossPart;
  private readonly fsm: StateMachine<Crawler, CrawlerState>;
  private readonly cannonCd = new Cooldown(CRAWLER.cannonGap);
  private readonly mgCd = new Cooldown(CRAWLER.mgGap);
  private readonly ramCd = new Cooldown(CRAWLER.ramGap);
  private readonly troopCd = new Cooldown(CRAWLER.troopGap);
  private readonly crush = new Geom.Rectangle();
  private x: number;
  private aim = 0;
  private aimTime = 0;
  private mgLeft = 0;
  private mgTimer = 0;
  private ram: RamStep = "idle";
  private ramTime = 0;
  private patrolT = 0;
  private escapee: GameObjects.Sprite | null = null;

  constructor(private readonly ctx: GameContext, private readonly enemies: EnemyFactory, private readonly home: number, private readonly groundY: number) {
    const scene = ctx.scene;
    this.x = home + 280;
    this.tread = scene.add.sprite(this.x, groundY, TEX.atlas, "crawler_tread_0").setOrigin(0.5, 1).setDepth(DEPTH.boss);
    this.hull = scene.add.image(this.x, groundY - HULL_LIFT, TEX.atlas, "crawler_hull_0").setOrigin(0.5, 1).setDepth(DEPTH.boss + 1);
    this.turret = new BossPart(ctx, scene.add.sprite(0, 0, TEX.atlas, "crawler_turret_0").setOrigin(0.5, 1).setDepth(DEPTH.boss + 2), CRAWLER.turretHp, 44, 22, () => this.breakTurret());
    this.engine = new BossPart(ctx, scene.add.sprite(0, 0, TEX.atlas, "crawler_engine_closed_0").setOrigin(0.5, 1).setDepth(DEPTH.boss + 2), CRAWLER.engineHp, 30, 20, () => this.fsm.change("dying"));
    this.engine.armoured = true;
    this.setVisible(false);
    this.fsm = new StateMachine<Crawler, CrawlerState>(this, {
      waiting: {},
      rolling: {
        enter: (c) => {
          c.setVisible(true);
          c.tread.play("crawler_tread");
          c.ctx.events.emit("sound", "alarm");
        },
        update: (c, dt) => {
          c.x = Math.max(c.home, c.x - CRAWLER.rollInSpeed * dt);
          c.ctx.camera.shake(1, 0.05);
          return c.x <= c.home ? "phase1" : undefined;
        },
        exit: (c) => c.tread.stop(),
      },
      phase1: {
        enter: (c) => {
          c.cannonCd.trigger(1.2);
          c.mgCd.trigger(2.2);
        },
        update: (c, dt) => c.tickPhase1(dt),
      },
      phase2: {
        enter: (c) => {
          c.engine.armoured = false;
          c.engine.view.play("crawler_engine_open");
          c.ramCd.trigger(1.6);
          c.troopCd.trigger(2.5);
          c.ctx.events.emit("sound", "alarm");
          c.ctx.camera.shake(3, 0.4);
        },
        update: (c, dt) => c.tickPhase2(dt),
      },
      dying: {
        enter: (c) => {
          c.ram = "idle";
          c.tread.stop();
          c.engine.view.stop();
          c.engine.view.setFrame("crawler_engine_broken_0");
          c.hull.setFrame("crawler_hull_2");
          c.ctx.events.emit("score", { points: SCORE.core, x: c.engine.view.x, y: c.engine.view.y - 10 });
          c.ctx.events.emit("hitStop", { seconds: 0.15 });
          c.escapee = c.ctx.scene.add.sprite(c.x + 10, c.groundY - 60, TEX.atlas, "grunt_alert_1").setOrigin(0.5, 1).setDepth(DEPTH.boss + 3);
        },
        update: (c, dt, t) => {
          const e = c.escapee;
          if (e) {
            if (t < 0.5) e.y -= 60 * dt;
            else {
              if (!e.anims.isPlaying) e.play("grunt_run");
              e.y = Math.min(c.groundY, e.y + 220 * dt);
              e.x += 120 * dt;
            }
          }
          if (c.ctx.rng.chance(dt * 10)) {
            c.ctx.fx.explosion(c.x + c.ctx.rng.range(-80, 80), c.groundY - c.ctx.rng.range(10, 60), c.ctx.rng.chance(0.5));
            c.ctx.events.emit("sound", "boom");
            c.ctx.camera.shake(3, 0.15);
          }
          if (t > 2.6) {
            c.ctx.fx.explosion(c.x, c.groundY - 30, true);
            c.ctx.events.emit("sound", "bigboom");
            c.setVisible(false);
            c.escapee?.setVisible(false);
            return "dead";
          }
        },
      },
      dead: { enter: (c) => c.ctx.events.emit("bossDefeated", undefined) },
    }, "waiting");
  }

  get left(): number {
    return this.x - HULL_W / 2 + 6;
  }

  get present(): boolean {
    return !this.fsm.is("waiting", "dead");
  }

  get state(): CrawlerState {
    return this.fsm.current;
  }

  get ramming(): RamStep {
    return this.ram;
  }

  start(): void {
    if (this.fsm.is("waiting")) this.fsm.change("rolling");
  }

  tick(dt: number): void {
    for (const cd of [this.cannonCd, this.mgCd, this.ramCd, this.troopCd]) cd.tick(dt);
    this.fsm.update(dt);
    this.layout();
  }

  private get hullLeft(): number {
    return Math.round(this.x - HULL_W / 2);
  }

  private get hullTop(): number {
    return this.groundY - HULL_LIFT - HULL_H;
  }

  private setVisible(v: boolean): void {
    for (const o of [this.hull, this.tread, this.turret.view, this.engine.view]) o.setVisible(v);
  }

  private layout(): void {
    const hx = Math.round(this.x);
    this.hull.x = hx;
    this.tread.x = hx;
    const t = this.ctx.anchor("crawler_hull_0", "turret");
    const e = this.ctx.anchor("crawler_hull_0", "engine");
    this.turret.view.setPosition(this.hullLeft + t.x + 8, this.hullTop + t.y + 4);
    this.engine.view.setPosition(this.hullLeft + e.x, this.hullTop + e.y + 10);
    if (!this.turret.broken) this.turret.view.setFrame(`crawler_turret_${this.aim}`);
  }

  private muzzle(name: "muzzle" | "mg"): { x: number; y: number } {
    const a = this.ctx.anchor(`crawler_turret_${this.aim}`, name);
    const v = this.turret.view;
    return { x: v.x - 48 + a.x, y: v.y - 44 + a.y };
  }

  private patrol(dt: number): void {
    this.patrolT += dt;
    const target = this.home - CRAWLER.patrol * (0.5 - 0.5 * Math.cos(this.patrolT * 0.5));
    const before = this.x;
    this.x += Math.max(-20 * dt, Math.min(20 * dt, target - this.x));
    if (Math.abs(this.x - before) > 0.01) {
      if (!this.tread.anims.isPlaying) this.tread.play("crawler_tread");
    } else this.tread.stop();
  }

  private tickPhase1(dt: number): CrawlerState | void {
    if (this.turret.broken) return "phase2";
    this.patrol(dt);
    const p = this.ctx.player;
    if (this.aimTime > 0) {
      this.aimTime -= dt;
      this.aim = this.aimTime > CRAWLER.cannonWindup * 0.66 ? 1 : 2;
      if (Math.floor(this.aimTime * 16) % 2 === 0) this.ctx.fx.flash(this.turret.view, 0.03);
      if (this.aimTime <= 0) this.fireCannon();
    } else if (this.cannonCd.ready && p.alive) {
      this.aimTime = CRAWLER.cannonWindup;
      this.ctx.events.emit("sound", "charge");
    } else if (this.aim > 0 && this.aimTime <= 0) this.aim = 0;
    if (this.mgLeft > 0) {
      this.mgTimer -= dt;
      if (this.mgTimer <= 0) {
        this.mgTimer = CRAWLER.mgSpacing;
        this.mgLeft--;
        const m = this.muzzle("mg");
        const ang = Math.max(-0.35, Math.min(0.35, Math.atan2(p.centerY - m.y, m.x - p.x)));
        this.ctx.projectiles.fire("enemyBullet", m.x, m.y, -Math.cos(ang) * CRAWLER.mgSpeed, Math.sin(ang) * CRAWLER.mgSpeed, 1);
        this.ctx.fx.play("flash", m.x, m.y);
        this.ctx.events.emit("sound", "enemyShot");
      }
    } else if (this.mgCd.ready && p.alive && this.aimTime <= 0) {
      this.mgCd.trigger();
      this.mgLeft = CRAWLER.mgShots;
      this.mgTimer = 0;
    }
  }

  private fireCannon(): void {
    this.cannonCd.trigger();
    const m = this.muzzle("muzzle");
    const p = this.ctx.player;
    const tt = CRAWLER.shellFlight;
    const g = PHYSICS.gravity * 0.6;
    const vx = (p.x + this.ctx.rng.range(-16, 16) - m.x) / tt;
    const vy = (p.y - m.y - 0.5 * g * tt * tt) / tt;
    this.ctx.projectiles.fire("mortar", m.x, m.y, vx, vy, 1);
    this.ctx.fx.play("smoke", m.x, m.y);
    this.ctx.fx.play("flash", m.x, m.y);
    this.ctx.camera.shake(2, 0.12);
    this.ctx.events.emit("sound", "cannon");
  }

  private tickPhase2(dt: number): void {
    const p = this.ctx.player;
    if (this.ram === "idle") {
      this.patrol(dt);
      if (this.ramCd.ready && p.alive) {
        this.ram = "rev";
        this.ramTime = 0;
        this.ctx.events.emit("sound", "charge");
      }
    } else this.tickRam(dt);
    if (this.troopCd.ready && this.ram === "idle") {
      this.troopCd.trigger();
      const h = this.ctx.anchor("crawler_hull_0", "hatch");
      const type = this.ctx.rng.chance(0.4) ? "shield" : "grunt";
      const e = this.enemies.spawn({ type, x: this.hullLeft + h.x, y: this.hullTop + h.y, idle: "none", hold: false, group: -2, facing: -1 });
      e.body.setVelocity(-70, -200);
    }
  }

  private tickRam(dt: number): void {
    this.ramTime += dt;
    const stopAt = this.ctx.camera.left + CRAWLER.ramClearance + HULL_W / 2;
    if (this.ram === "rev") {
      if (!this.tread.anims.isPlaying) this.tread.play("crawler_tread");
      if (Math.floor(this.ramTime * 10) % 2 === 0) this.ctx.fx.play("smoke", this.hullLeft + 156, this.hullTop + 4);
      this.ctx.camera.shake(1, 0.05);
      this.x = this.home + Math.sin(this.ramTime * 60) * 0.6;
      if (this.ramTime >= CRAWLER.ramWindup) this.setRam("charge");
    } else if (this.ram === "charge") {
      this.x = Math.max(stopAt, this.x - CRAWLER.ramSpeed * dt);
      this.crush.setTo(this.hullLeft + 4, this.groundY - 44, 20, 44);
      this.ctx.combat.strikeFirst(this.crush, { amount: 1, kind: "blast", from: "enemy", x: this.hullLeft, y: this.groundY - 20 });
      if (this.x <= stopAt) {
        this.ctx.camera.shake(3, 0.2);
        this.ctx.events.emit("sound", "boom");
        this.setRam("hold");
      }
    } else if (this.ram === "hold") {
      this.tread.stop();
      if (this.ramTime > CRAWLER.ramHold) this.setRam("back");
    } else {
      if (!this.tread.anims.isPlaying) this.tread.play("crawler_tread");
      this.x = Math.min(this.home, this.x + CRAWLER.retreatSpeed * dt);
      if (this.x >= this.home) {
        this.ramCd.trigger();
        this.setRam("idle");
      }
    }
  }

  private setRam(step: RamStep): void {
    this.ram = step;
    this.ramTime = 0;
  }

  private breakTurret(): void {
    this.turret.view.setFrame("crawler_turret_broken_0");
    this.aim = 0;
    this.aimTime = 0;
    this.mgLeft = 0;
    this.hull.setFrame("crawler_hull_1");
    this.ctx.fx.explosion(this.turret.view.x, this.turret.view.y - 10, true);
    this.ctx.events.emit("sound", "bigboom");
    this.ctx.events.emit("score", { points: SCORE.turret, x: this.turret.view.x, y: this.turret.view.y - 20 });
    this.ctx.events.emit("hitStop", { seconds: 0.1 });
    this.ctx.camera.shake(4, 0.3);
  }
}
