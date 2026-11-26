import { Geom, type GameObjects } from "phaser";
import { StateMachine } from "../../../core/fsm/StateMachine";
import { Cooldown } from "../../../core/time/Cooldown";
import { ABSORBED, KILLED, MISS, type Hit, type HitResult } from "../../../domain/combat/Damage";
import { DEPTH } from "../../../config/display";
import { PHYSICS, SCORE, WARDEN } from "../../../config/tuning";
import { TEX } from "../../assets/keys";
import type { GameContext } from "../../context/GameContext";
import type { Target } from "../../systems/CombatSystem";
import type { EnemyFactory } from "../enemies/EnemyFactory";

class BossPart implements Target {
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

type WardenState = "waiting" | "rolling" | "phase1" | "phase2" | "dying" | "dead";

export class Warden {
  private readonly hull: GameObjects.Image;
  private readonly wheels: GameObjects.Sprite[];
  private readonly turrets: BossPart[];
  private readonly core: BossPart;
  private readonly fsm: StateMachine<Warden, WardenState>;
  private readonly shellCd = new Cooldown(WARDEN.shellGap);
  private readonly mortarCd = new Cooldown(WARDEN.mortarGap);
  private readonly spreadCd = new Cooldown(WARDEN.spreadGap);
  private readonly rusherCd = new Cooldown(WARDEN.rusherGap);
  private turn = 0;
  private charge = 0;
  private volley = 0;
  private followUp = 0;
  private x: number;

  constructor(private readonly ctx: GameContext, private readonly enemies: EnemyFactory, private readonly stopX: number, private readonly groundY: number) {
    const scene = ctx.scene;
    this.x = stopX + 260;
    this.hull = scene.add.image(this.x, groundY - 10, TEX.atlas, "warden_hull_0").setOrigin(0.5, 1).setDepth(DEPTH.boss);
    this.wheels = [-62, -10, 42].map((o) => scene.add.sprite(this.x + o, groundY, TEX.atlas, "warden_wheel_0").setOrigin(0.5, 1).setDepth(DEPTH.boss + 1));
    const makeTurret = () => scene.add.sprite(0, 0, TEX.atlas, "warden_turret_0").setOrigin(0.5, 1).setDepth(DEPTH.boss + 2);
    this.turrets = [0, 1].map(() => new BossPart(ctx, makeTurret(), WARDEN.turretHp, 32, 22, (p) => this.breakTurret(p)));
    this.core = new BossPart(ctx, scene.add.sprite(0, 0, TEX.atlas, "warden_core_closed_0").setOrigin(0.5, 0.5).setDepth(DEPTH.boss + 2), WARDEN.coreHp, 30, 30, () => this.fsm.change("dying"));
    this.core.armoured = true;
    this.setVisible(false);
    this.fsm = new StateMachine<Warden, WardenState>(this, {
      waiting: {},
      rolling: {
        enter: (w) => {
          w.setVisible(true);
          w.wheels.forEach((s) => s.play("warden_wheel"));
          w.ctx.events.emit("sound", "alarm");
        },
        update: (w, dt) => {
          w.x = Math.max(w.stopX, w.x - WARDEN.rollInSpeed * dt);
          w.ctx.camera.shake(1, 0.05);
          return w.x <= w.stopX ? "phase1" : undefined;
        },
        exit: (w) => w.wheels.forEach((s) => s.stop()),
      },
      phase1: { update: (w) => w.tickPhase1() },
      phase2: {
        enter: (w) => {
          w.volley = 0;
          w.followUp = 0;
          w.charge = 0;
          w.core.armoured = false;
          w.core.view.play("warden_core_open");
          w.ctx.events.emit("sound", "alarm");
          w.ctx.camera.shake(3, 0.4);
        },
        update: (w, dt) => w.tickPhase2(dt),
      },
      dying: {
        enter: (w) => {
          w.core.view.stop();
          w.core.view.setFrame("warden_core_broken_0");
          w.ctx.events.emit("hitStop", { seconds: 0.15 });
          w.hull.setFrame("warden_hull_2");
          w.ctx.events.emit("score", { points: SCORE.core, x: w.core.view.x, y: w.core.view.y });
        },
        update: (w, dt, t) => {
          if (w.ctx.rng.chance(dt * 10)) {
            w.ctx.fx.explosion(w.x + w.ctx.rng.range(-90, 90), w.groundY - w.ctx.rng.range(10, 100), w.ctx.rng.chance(0.5));
            w.ctx.events.emit("sound", "boom");
            w.ctx.camera.shake(3, 0.15);
          }
          if (t > 2.6) {
            w.ctx.fx.explosion(w.x, w.groundY - 40, true);
            w.ctx.events.emit("sound", "bigboom");
            w.setVisible(false);
            return "dead";
          }
        },
      },
      dead: { enter: (w) => w.ctx.events.emit("bossDefeated", undefined) },
    }, "waiting");
  }

  get left(): number {
    return this.x - 92;
  }

  get present(): boolean {
    return !this.fsm.is("waiting", "dead");
  }

  get state(): WardenState {
    return this.fsm.current;
  }

  start(): void {
    if (this.fsm.is("waiting")) this.fsm.change("rolling");
  }

  tick(dt: number): void {
    for (const cd of [this.shellCd, this.mortarCd, this.spreadCd, this.rusherCd]) cd.tick(dt);
    this.fsm.update(dt);
    this.layout();
  }

  private setVisible(v: boolean): void {
    this.hull.setVisible(v);
    this.wheels.forEach((s) => s.setVisible(v));
    this.turrets.forEach((t) => t.view.setVisible(v));
    this.core.view.setVisible(v);
  }

  private layout(): void {
    const top = this.hull.y - 120;
    const left = this.x - 96;
    this.hull.x = this.x;
    [-62, -10, 42].forEach((o, i) => { this.wheels[i]!.x = this.x + o; });
    const a = this.ctx.anchor("warden_hull_0", "turretA");
    const b = this.ctx.anchor("warden_hull_0", "turretB");
    const c = this.ctx.anchor("warden_hull_0", "core");
    this.turrets[0]!.view.setPosition(left + a.x, top + a.y);
    this.turrets[1]!.view.setPosition(left + b.x, top + b.y);
    this.core.view.setPosition(left + c.x, top + c.y);
  }

  private tickPhase1(): WardenState | void {
    const live = this.turrets.filter((t) => !t.broken);
    if (live.length === 0) return "phase2";
    if (this.shellCd.ready && this.ctx.player.alive) {
      this.shellCd.trigger();
      const t = live[this.turn++ % live.length]!;
      const mx = t.view.x - 16;
      const my = t.view.y - 11;
      const p = this.ctx.player;
      const ang = Math.atan2(p.centerY - my, p.x - mx);
      this.ctx.projectiles.fire("enemyBullet", mx, my, Math.cos(ang) * WARDEN.shellSpeed, Math.sin(ang) * WARDEN.shellSpeed, 1);
      this.ctx.fx.play("flash", mx, my);
      this.ctx.events.emit("sound", "enemyShot");
    }
    if (this.mortarCd.ready && this.ctx.player.alive) {
      this.mortarCd.trigger();
      this.lobMortar();
    }
  }

  private tickPhase2(dt: number): void {
    if (this.followUp > 0) {
      this.followUp -= dt;
      if (this.followUp <= 0) this.skim();
    }
    if (this.charge > 0) {
      this.charge -= dt;
      if (Math.floor(this.charge * 12) % 2 === 0) this.ctx.fx.flash(this.core.view, 0.04);
      if (this.charge <= 0) this.fireVolley();
    } else if (this.spreadCd.ready && this.ctx.player.alive) {
      this.charge = WARDEN.chargeTime;
      this.ctx.events.emit("sound", "charge");
    }
    if (this.mortarCd.ready && this.ctx.player.alive) {
      this.mortarCd.trigger(WARDEN.mortarGap * 1.3);
      this.lobMortar();
    }
    if (this.rusherCd.ready) {
      this.rusherCd.trigger();
      const e = this.enemies.spawn({ type: "rusher", x: this.left - 4, y: this.hull.y - 60, idle: "none", hold: false, group: -2, facing: -1 });
      e.body.setVelocity(-60, -180);
    }
  }

  private fireVolley(): void {
    this.spreadCd.trigger();
    const skim = this.volley++ % 2 === 1;
    if (skim) {
      this.skim();
      if (this.core.hp <= WARDEN.coreHp / 2) this.followUp = WARDEN.skimPair;
    } else {
      const { x, y } = this.core.view;
      for (const off of [-0.04, 0.16, 0.38]) this.ctx.projectiles.fire("enemyBullet", x - 12, y, -Math.cos(off) * WARDEN.shellSpeed, -Math.sin(off) * WARDEN.shellSpeed, 1);
      this.ctx.fx.play("flash", x - 12, y);
      this.ctx.events.emit("sound", "enemyShot");
    }
  }

  private skim(): void {
    const y = this.groundY - WARDEN.skimHeight;
    this.ctx.projectiles.fire("enemyBullet", this.left - 2, y, -WARDEN.skimSpeed, 0, 1);
    this.ctx.fx.play("flash", this.left - 2, y);
    this.ctx.events.emit("sound", "enemyShot");
  }

  private lobMortar(): void {
    const s = this.ctx.anchor("warden_hull_0", "stack");
    const sx = this.x - 96 + s.x;
    const sy = this.hull.y - 120 + s.y;
    const p = this.ctx.player;
    const tt = 1.4;
    const g = PHYSICS.gravity * 0.6;
    const vx = (p.x + this.ctx.rng.range(-20, 20) - sx) / tt;
    const vy = (p.y - sy - 0.5 * g * tt * tt) / tt;
    this.ctx.projectiles.fire("mortar", sx, sy, vx, vy, 1);
    this.ctx.fx.play("smoke", sx, sy - 6);
    this.ctx.events.emit("sound", "cannon");
  }

  private breakTurret(part: BossPart): void {
    part.view.setFrame("warden_turret_1");
    this.ctx.fx.explosion(part.view.x, part.view.y, true);
    this.ctx.events.emit("sound", "boom");
    this.ctx.events.emit("score", { points: SCORE.turret, x: part.view.x, y: part.view.y });
    this.ctx.camera.shake(3, 0.25);
    this.ctx.events.emit("hitStop", { seconds: 0.1 });
    const broken = this.turrets.filter((t) => t.broken).length;
    this.hull.setFrame(`warden_hull_${Math.min(2, broken)}`);
  }
}
