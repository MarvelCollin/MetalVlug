import { Animations, GameObjects, TintModes, type Scene } from "phaser";
import { ObjectPool } from "../../core/pool/ObjectPool";
import type { Rng } from "../../core/random/Rng";
import { DEPTH } from "../../config/display";
import { TEX } from "../assets/keys";
import type { Terrain } from "../level/Terrain";

class Particle extends GameObjects.Sprite {
  vx = 0;
  vy = 0;
  life = 0;
  spin = 0;
  bounces = 0;
}

export class EffectsSystem {
  private readonly shots: ObjectPool<GameObjects.Sprite>;
  private readonly bits: ObjectPool<Particle>;
  private readonly flashing = new Map<GameObjects.Sprite, number>();

  constructor(
    scene: Scene,
    private readonly terrain: Terrain,
    private readonly rng: Rng,
  ) {
    this.shots = new ObjectPool(
      () => {
        const s = scene.add.sprite(0, 0, TEX.atlas, "boom_0").setDepth(DEPTH.fx).setActive(false).setVisible(false);
        s.on(Animations.Events.ANIMATION_COMPLETE, () => this.shots.release(s));
        return s;
      },
      (s) => s.setVisible(false).setActive(false),
      160,
    );
    this.bits = new ObjectPool(
      () => {
        const p = new Particle(scene, 0, 0, TEX.atlas, "debris_0").setDepth(DEPTH.fx).setActive(false).setVisible(false);
        scene.add.existing(p);
        return p;
      },
      (p) => p.setVisible(false).setActive(false),
      240,
    );
  }

  play(anim: string, x: number, y: number, opts: { depth?: number; flipX?: boolean; rotation?: number; scale?: number; originY?: number } = {}): void {
    const s = this.shots.acquire();
    if (!s) return;
    s.setActive(true).setVisible(true).setPosition(x, y).setFlipX(!!opts.flipX).setRotation(opts.rotation ?? 0)
      .setScale(opts.scale ?? 1).setDepth(opts.depth ?? DEPTH.fx).setOrigin(0.5, opts.originY ?? 0.5).setAlpha(1);
    s.play(anim);
  }

  explosion(x: number, y: number, big: boolean): void {
    this.play(big ? "boom" : "boom_s", x, y - (big ? 14 : 6));
    if (big) {
      this.play("boom_s", x + this.rng.range(-14, 14), y - this.rng.range(10, 26));
      this.play("smoke", x + this.rng.range(-8, 8), y - 30);
    }
    this.debris(x, y - 4, big ? 8 : 4);
  }

  spark(x: number, y: number): void {
    this.play("spark", x, y);
  }

  debris(x: number, y: number, count: number, frames = ["debris_0", "debris_1", "debris_2"]): void {
    for (let i = 0; i < count; i++) {
      const p = this.bits.acquire();
      if (!p) return;
      p.setActive(true).setVisible(true).setPosition(x, y).setFrame(this.rng.pick(frames)).setAlpha(1).setRotation(0);
      p.vx = this.rng.range(-110, 110);
      p.vy = this.rng.range(-260, -120);
      p.life = this.rng.range(0.8, 1.4);
      p.spin = this.rng.range(-12, 12);
      p.bounces = 1;
    }
  }

  casing(x: number, y: number, dir: number): void {
    const p = this.bits.acquire();
    if (!p) return;
    p.setActive(true).setVisible(true).setPosition(x, y).setFrame("casing_0").setAlpha(1);
    p.vx = -dir * this.rng.range(30, 70);
    p.vy = this.rng.range(-130, -80);
    p.life = 0.7;
    p.spin = 18;
    p.bounces = 2;
  }

  flash(target: GameObjects.Sprite, seconds = 0.06): void {
    target.setTint(0xffffff).setTintMode(TintModes.FILL);
    this.flashing.set(target, seconds);
  }

  update(dt: number): void {
    for (const [s, t] of this.flashing) {
      const left = t - dt;
      if (left <= 0) {
        s.clearTint().setTintMode(TintModes.MULTIPLY);
        this.flashing.delete(s);
      } else this.flashing.set(s, left);
    }
    this.bits.forEachActive((p) => {
      const prevY = p.y;
      p.vy += 700 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;
      p.life -= dt;
      const floor = this.terrain.surfaceCrossed(p.x, prevY, p.y);
      if (floor !== null && p.vy > 0) {
        if (p.bounces-- > 0) {
          p.y = floor;
          p.vy *= -0.4;
          p.vx *= 0.6;
        } else {
          p.y = floor;
          p.vy = 0;
          p.vx = 0;
          p.spin = 0;
        }
      }
      if (p.life < 0.3) p.setAlpha(Math.max(0, p.life / 0.3));
      if (p.life <= 0) this.bits.release(p);
    });
  }
}
