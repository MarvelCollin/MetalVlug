import { Animations, GameObjects, TintModes, type Scene } from "phaser";
import { ObjectPool } from "../../core/pool/ObjectPool";
import type { Rng } from "../../core/random/Rng";
import { DEPTH } from "../../config/display";
import { DATA, FONT, TEX, type FxMetaTable } from "../assets/keys";
import type { Terrain } from "../level/Terrain";

class Particle extends GameObjects.Sprite {
  vx = 0;
  vy = 0;
  life = 0;
  spin = 0;
  bounces = 0;
  grav = 700;
  fade = 0.3;
}

export class EffectsSystem {
  private readonly shots: ObjectPool<GameObjects.Sprite>;
  private readonly bits: ObjectPool<Particle>;
  private readonly flashing = new Map<GameObjects.Sprite, number>();
  private readonly fxMeta: FxMetaTable;
  private readonly popups: Array<{ text: GameObjects.BitmapText; life: number }> = [];
  private readonly queued: Array<{ at: number; x: number; y: number }> = [];
  private readonly scorches: Array<{ img: GameObjects.Image; life: number }> = [];
  private clock = 0;

  constructor(
    private readonly scene: Scene,
    private readonly terrain: Terrain,
    private readonly rng: Rng,
    private readonly flashesOn: () => boolean = () => true,
  ) {
    this.fxMeta = scene.cache.json.get(DATA.fxMeta) as FxMetaTable;
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

  play(anim: string, x: number, y: number, opts: { depth?: number; flipX?: boolean; flipY?: boolean; originY?: number } = {}): void {
    const s = this.shots.acquire();
    if (!s) return;
    s.setActive(true).setVisible(true).setPosition(Math.round(x), Math.round(y)).setFlipX(!!opts.flipX).setFlipY(!!opts.flipY).setRotation(0)
      .setScale(1).setDepth(opts.depth ?? DEPTH.fx).setOrigin(0.5, opts.originY ?? 0.5).setAlpha(1);
    s.play(anim);
  }

  baked(key: string, x: number, y: number, flipX = false, depth: number = DEPTH.fx): void {
    const m = this.fxMeta[key];
    const s = this.shots.acquire();
    if (!m || !s) return;
    s.setActive(true).setVisible(true).setPosition(Math.round(x), Math.round(y)).setFlipX(flipX).setFlipY(false).setRotation(0).setScale(1)
      .setDepth(depth).setAlpha(1);
    s.play(key);
    s.setOrigin(flipX ? 1 - m.originX : m.originX, m.originY);
  }

  popup(text: string, x: number, y: number): void {
    let slot = this.popups.find((p) => p.life <= 0);
    if (!slot) {
      if (this.popups.length >= 16) return;
      slot = { text: this.scene.add.bitmapText(0, 0, FONT, "").setDepth(DEPTH.fx + 5).setTint(0xffe08a), life: 0 };
      this.popups.push(slot);
    }
    slot.text.setText(text).setVisible(true).setAlpha(1);
    slot.text.setPosition(Math.round(x - slot.text.width / 2), Math.round(y - 20));
    slot.life = 0.9;
  }

  explosion(x: number, y: number, big: boolean): void {
    const floor = this.terrain.groundBelow(x, y - 2);
    const onGround = floor - y < 24;
    this.baked(big ? "fx_blast" : "fx_blast_s", x, onGround ? floor : y + (big ? 30 : 18));
    this.debris(x, y - 4, big ? 6 : 3);
  }

  spark(x: number, y: number, dir = 0): void {
    this.baked("fx_spark", x, y, dir < 0);
  }

  wallHit(x: number, y: number): void {
    this.baked("fx_wall", x, y);
  }

  thud(x: number, y: number): void {
    this.baked("fx_thud", x, y);
  }

  debris(x: number, y: number, count: number, frames = ["debris_0", "debris_1", "debris_2"]): void {
    for (let i = 0; i < count; i++) {
      const p = this.bits.acquire();
      if (!p) return;
      p.setActive(true).setVisible(true).setPosition(x, y).setFrame(this.rng.pick(frames)).setAlpha(1).setRotation(0).setFlipX(this.rng.chance(0.5)).setDepth(DEPTH.fx);
      p.grav = 700;
      p.fade = 0.3;
      p.vx = this.rng.range(-110, 110);
      p.vy = this.rng.range(-260, -120);
      p.life = this.rng.range(0.8, 1.4);
      p.spin = this.rng.range(-12, 12);
      p.bounces = 1;
    }
  }

  footDust(x: number, y: number, dir: number): void {
    this.play("dust_step", x - dir * 4, y, { flipX: dir < 0, originY: 1, depth: DEPTH.player - 1 });
  }

  wisp(x: number, y: number): void {
    this.play("smoke_wisp", x, y, { originY: 1, depth: DEPTH.player + 3 });
  }

  sparkles(x: number, y: number, count: number, spread = 10): void {
    for (let i = 0; i < count; i++) this.queued.push({ at: this.clock + i * 0.07, x: x + this.rng.range(-spread, spread), y: y + this.rng.range(-spread, spread * 0.6) });
  }

  embers(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.particle(x + this.rng.range(-8, 8), y + this.rng.range(-6, 4), this.rng.chance(0.5) ? "ember_0" : "ember_1");
      if (!p) return;
      p.vx = this.rng.range(-55, 55);
      p.vy = this.rng.range(-170, -70);
      p.grav = 140;
      p.life = this.rng.range(0.6, 1.2);
      p.bounces = 0;
      p.fade = 0.5;
    }
  }

  drops(x: number, y: number): void {
    for (let i = 0; i < 2; i++) {
      const p = this.particle(x + i, y, "drop_0");
      if (!p) return;
      p.vx = this.rng.range(-10, 18);
      p.vy = this.rng.range(-40, -10);
      p.grav = 520;
      p.life = 0.55;
      p.bounces = 0;
    }
  }

  helmet(x: number, y: number, frame: string, dir: number): void {
    const p = this.particle(x, y, frame);
    if (!p) return;
    p.vx = dir * this.rng.range(45, 95);
    p.vy = this.rng.range(-260, -190);
    p.spin = 14;
    p.bounces = 2;
    p.life = 2.2;
    p.setDepth(DEPTH.enemies + 2);
  }

  scorch(x: number, floor: number): void {
    let slot = this.scorches.find((s) => s.life <= 0);
    if (!slot) {
      if (this.scorches.length >= 10) slot = this.scorches.reduce((a, b) => (a.life < b.life ? a : b));
      else {
        slot = { img: this.scene.add.image(0, 0, TEX.atlas, "scorch_0").setDepth(DEPTH.terrain + 1).setOrigin(0.5, 0.5), life: 0 };
        this.scorches.push(slot);
      }
    }
    slot.img.setPosition(Math.round(x), Math.round(floor + 1)).setVisible(true).setAlpha(0.9).setFlipX(this.rng.chance(0.5));
    slot.life = 6;
  }

  private particle(x: number, y: number, frame: string): Particle | null {
    const p = this.bits.acquire();
    if (!p) return null;
    p.setActive(true).setVisible(true).setPosition(x, y).setFrame(frame).setAlpha(1).setRotation(0).setFlipX(false).setDepth(DEPTH.fx);
    p.spin = 0;
    p.grav = 700;
    p.fade = 0.3;
    return p;
  }

  casing(x: number, y: number, dir: number): void {
    const p = this.bits.acquire();
    if (!p) return;
    p.setActive(true).setVisible(true).setPosition(x, y).setFrame("casing_0").setAlpha(1).setDepth(DEPTH.fx);
    p.grav = 700;
    p.fade = 0.3;
    p.vx = -dir * this.rng.range(30, 70);
    p.vy = this.rng.range(-130, -80);
    p.life = 0.7;
    p.spin = 18;
    p.bounces = 2;
  }

  flash(target: GameObjects.Sprite, seconds = 0.06): void {
    if (!this.flashesOn()) return;
    target.setTint(0xffffff).setTintMode(TintModes.FILL);
    this.flashing.set(target, seconds);
  }

  update(dt: number): void {
    this.clock += dt;
    for (let i = this.queued.length - 1; i >= 0; i--) {
      const q = this.queued[i]!;
      if (q.at > this.clock) continue;
      this.queued.splice(i, 1);
      this.play("sparkle", q.x, q.y, { depth: DEPTH.fx + 2 });
    }
    for (const s of this.scorches) {
      if (s.life <= 0) continue;
      s.life -= dt;
      s.img.setAlpha(Math.max(0, Math.min(0.9, s.life / 2)));
      if (s.life <= 0) s.img.setVisible(false);
    }
    for (const p of this.popups) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life > 0.6) p.text.y -= 30 * dt;
      p.text.y = Math.round(p.text.y * 2) / 2;
      if (p.life < 0.25) p.text.setAlpha(Math.floor(p.life * 30) % 2 ? 1 : 0);
      if (p.life <= 0) p.text.setVisible(false);
    }
    for (const [s, t] of this.flashing) {
      const left = t - dt;
      if (left <= 0) {
        s.clearTint().setTintMode(TintModes.MULTIPLY);
        this.flashing.delete(s);
      } else this.flashing.set(s, left);
    }
    this.bits.forEachActive((p) => {
      const prevY = p.y;
      p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.spin && Math.floor(p.life * 12) !== Math.floor((p.life + dt) * 12)) p.flipX = !p.flipX;
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
      if (p.life < p.fade) p.setAlpha(Math.max(0, p.life / p.fade));
      if (p.life <= 0) this.bits.release(p);
    });
  }
}
