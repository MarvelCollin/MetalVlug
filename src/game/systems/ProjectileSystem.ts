import { GameObjects, Geom, type Scene } from "phaser";
import { ObjectPool } from "../../core/pool/ObjectPool";
import type { EventBus } from "../../core/events/EventBus";
import type { DamageKind, Faction } from "../../domain/combat/Damage";
import { DEPTH, VIEW_H } from "../../config/display";
import { BOMB, PHYSICS } from "../../config/tuning";
import { TEX } from "../assets/keys";
import type { GameEvents } from "../context/GameEvents";
import type { Terrain } from "../level/Terrain";
import type { CameraDirector } from "./CameraDirector";
import type { CombatSystem } from "./CombatSystem";
import type { EffectsSystem } from "./EffectsSystem";

export type ProjectileKind = "bullet" | "heavy" | "vulcan" | "enemyBullet" | "rocket" | "enemyRocket" | "flame" | "bomb" | "enemyBomb" | "shell" | "mortar";

interface Spec {
  frame: string;
  anim?: string;
  faction: Faction;
  gravity: number;
  radius: number;
  bounces: number;
  accel: number;
  maxSpeed: number;
  w: number;
  h: number;
  kind: DamageKind;
  big: boolean;
  orient: boolean;
  life: number;
  pierce?: boolean;
}

const SPECS: Record<ProjectileKind, Spec> = {
  bullet: { frame: "bullet_p", faction: "player", gravity: 0, radius: 0, bounces: 0, accel: 0, maxSpeed: 0, w: 6, h: 4, kind: "bullet", big: false, orient: true, life: 1.4 },
  heavy: { frame: "bullet_r", faction: "player", gravity: 0, radius: 0, bounces: 0, accel: 0, maxSpeed: 0, w: 8, h: 4, kind: "bullet", big: false, orient: true, life: 1.4 },
  vulcan: { frame: "bullet_v", faction: "player", gravity: 0, radius: 0, bounces: 0, accel: 0, maxSpeed: 0, w: 8, h: 4, kind: "bullet", big: false, orient: true, life: 1.4 },
  rocket: { frame: "rocket", faction: "player", gravity: 0, radius: 26, bounces: 0, accel: 600, maxSpeed: 380, w: 10, h: 6, kind: "blast", big: false, orient: true, life: 2 },
  flame: { frame: "flame_0", anim: "flame", faction: "player", gravity: 0, radius: 0, bounces: 0, accel: 0, maxSpeed: 0, w: 14, h: 10, kind: "fire", big: false, orient: false, life: 0.85, pierce: true },
  enemyRocket: { frame: "rocket", faction: "enemy", gravity: 0, radius: 16, bounces: 0, accel: 0, maxSpeed: 0, w: 10, h: 6, kind: "blast", big: false, orient: true, life: 5 },
  bomb: { frame: "bomb_0", anim: "bomb", faction: "player", gravity: PHYSICS.gravity, radius: BOMB.radius, bounces: 1, accel: 0, maxSpeed: 0, w: 7, h: 7, kind: "blast", big: true, orient: false, life: 4 },
  shell: { frame: "shell_0", faction: "player", gravity: PHYSICS.gravity * 0.5, radius: 32, bounces: 0, accel: 0, maxSpeed: 0, w: 8, h: 6, kind: "blast", big: true, orient: false, life: 3 },
  enemyBullet: { frame: "bullet_e_0", anim: "bullet_e", faction: "enemy", gravity: 0, radius: 0, bounces: 0, accel: 0, maxSpeed: 0, w: 5, h: 5, kind: "bullet", big: false, orient: false, life: 5 },
  enemyBomb: { frame: "bomb_0", anim: "bomb", faction: "enemy", gravity: PHYSICS.gravity, radius: 22, bounces: 0, accel: 0, maxSpeed: 0, w: 7, h: 7, kind: "blast", big: false, orient: false, life: 5 },
  mortar: { frame: "mortar_0", faction: "enemy", gravity: PHYSICS.gravity * 0.6, radius: 24, bounces: 0, accel: 0, maxSpeed: 0, w: 8, h: 8, kind: "blast", big: true, orient: false, life: 6 },
};

export class Projectile extends GameObjects.Sprite {
  type2: ProjectileKind = "bullet";
  vx = 0;
  vy = 0;
  damage = 1;
  life = 0;
  bounces = 0;
  readonly hits = new Set<object>();
}

export class ProjectileSystem {
  private readonly pool: ObjectPool<Projectile>;
  private readonly rect = new Geom.Rectangle();

  constructor(
    scene: Scene,
    private readonly terrain: Terrain,
    private readonly combat: CombatSystem,
    private readonly fx: EffectsSystem,
    private readonly camera: CameraDirector,
    private readonly events: EventBus<GameEvents>,
  ) {
    this.pool = new ObjectPool(
      () => {
        const p = new Projectile(scene, 0, 0, TEX.atlas, "bullet_p_0").setDepth(DEPTH.projectiles).setActive(false).setVisible(false);
        scene.add.existing(p);
        return p;
      },
      (p) => { p.setActive(false).setVisible(false); p.stop(); },
      400,
    );
  }

  fire(kind: ProjectileKind, x: number, y: number, vx: number, vy: number, damage: number): Projectile | null {
    const p = this.pool.acquire();
    if (!p) return null;
    const s = SPECS[kind];
    p.type2 = kind;
    p.vx = vx;
    p.vy = vy;
    p.damage = damage;
    p.life = s.life;
    p.bounces = s.bounces;
    p.hits.clear();
    p.setActive(true).setVisible(true).setPosition(x, y).setRotation(0).setFlipX(false).setFlipY(false).setAlpha(1);
    if (s.orient) this.orient(p, s);
    else p.setFrame(s.frame);
    if (kind === "flame") {
      const vertical = Math.abs(vy) > Math.abs(vx);
      p.play(vertical ? "flame_up" : "flame").setFlipX(!vertical && vx < 0).setFlipY(vertical && vy > 0);
    } else if (s.anim) p.play(s.anim);
    return p;
  }

  count(kind: ProjectileKind): number {
    let n = 0;
    this.pool.forEachActive((p) => { if (p.type2 === kind) n++; });
    return n;
  }

  clear(): void {
    this.pool.releaseAll();
  }

  update(dt: number): void {
    this.pool.forEachActive((p) => this.step(p, dt));
  }

  private step(p: Projectile, dt: number): void {
    const s = SPECS[p.type2];
    if (s.accel) {
      const sp = Math.hypot(p.vx, p.vy);
      const next = Math.min(s.maxSpeed, sp + s.accel * dt);
      if (sp > 0) {
        p.vx *= next / sp;
        p.vy *= next / sp;
      }
    }
    const prevY = p.y;
    p.vy += s.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (s.orient) this.orient(p, s);
    if (p.life <= 0 || p.y > VIEW_H + 24 || !this.camera.visible(p.x, 48)) {
      this.pool.release(p);
      return;
    }
    if (s.gravity > 0 && p.vy > 0) {
      const floor = this.terrain.surfaceCrossed(p.x, prevY, p.y);
      if (floor !== null) {
        if (p.bounces > 0) {
          p.bounces--;
          p.y = floor - 1;
          p.vy *= -BOMB.bounce;
          p.vx *= 0.7;
        } else {
          p.y = floor;
          this.detonate(p);
          return;
        }
      }
    } else if (this.terrain.solidAt(p.x, p.y)) {
      if (s.pierce) {
        this.fx.play("smoke", p.x, p.y);
        this.pool.release(p);
      } else if (s.radius > 0) this.detonate(p);
      else {
        this.fx.wallHit(p.x, p.y);
        this.pool.release(p);
      }
      return;
    }
    this.rect.setTo(p.x - s.w / 2, p.y - s.h / 2, s.w, s.h);
    if (s.radius > 0) {
      if (this.combat.firstOverlap(s.faction, this.rect)) this.detonate(p);
      return;
    }
    if (s.pierce) {
      if (p.life < 0.2) p.setAlpha(Math.floor(p.life * 30) % 2 ? 1 : 0.4);
      this.combat.forEachOverlap(s.faction, this.rect, (t) => {
        if (p.hits.has(t)) return;
        p.hits.add(t);
        t.hit({ amount: p.damage, kind: s.kind, from: s.faction, x: p.x, y: p.y });
      });
      return;
    }
    const res = this.combat.strikeFirst(this.rect, { amount: p.damage, kind: s.kind, from: s.faction, x: p.x, y: p.y });
    if (res.absorbed) {
      this.fx.spark(p.x, p.y, -Math.sign(p.vx));
      this.pool.release(p);
    }
  }

  private orient(p: Projectile, s: Spec): void {
    const steps = 16;
    const a = Math.atan2(p.vy, p.vx);
    const i = ((Math.round((a / (Math.PI * 2)) * steps) % steps) + steps) % steps;
    const base = p.type2 === "rocket" || p.type2 === "enemyRocket" ? (Math.floor(p.life * 20) % 2) * steps : 0;
    p.setFrame(`${s.frame}_${base + i}`);
  }

  private detonate(p: Projectile): void {
    const s = SPECS[p.type2];
    this.events.emit("explode", { x: p.x, y: p.y, radius: s.radius, damage: p.damage, from: s.faction, big: s.big });
    this.pool.release(p);
  }
}
