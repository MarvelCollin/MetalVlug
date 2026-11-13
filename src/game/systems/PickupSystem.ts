import { Geom, type Physics, type Scene } from "phaser";
import { ObjectPool } from "../../core/pool/ObjectPool";
import { DEPTH } from "../../config/display";
import { TEX } from "../assets/keys";
import type { Terrain } from "../level/Terrain";

export type PickupType = "rivet" | "scatter" | "thumper" | "bombs" | "ammo" | "fuel" | "gem" | "ration";

const FRAME: Record<PickupType, { frame: string; anim?: string }> = {
  rivet: { frame: "pick_R_0" },
  scatter: { frame: "pick_S_0" },
  thumper: { frame: "pick_T_0" },
  bombs: { frame: "pick_B_0" },
  ammo: { frame: "pick_A_0" },
  fuel: { frame: "fuel_0" },
  gem: { frame: "gem_0", anim: "gem" },
  ration: { frame: "ration_0" },
};

type PickupSprite = Physics.Arcade.Sprite & { kind: PickupType; age: number };

export class PickupSystem {
  private readonly group: Physics.Arcade.Group;
  private readonly pool: ObjectPool<PickupSprite>;
  private readonly rect = new Geom.Rectangle();

  constructor(scene: Scene, terrain: Terrain) {
    this.group = scene.physics.add.group();
    scene.physics.add.collider(this.group, terrain.solids);
    scene.physics.add.collider(this.group, terrain.platforms);
    this.pool = new ObjectPool(
      () => {
        const s = scene.physics.add.sprite(0, 0, TEX.atlas, "pick_R_0") as PickupSprite;
        s.setDepth(DEPTH.props + 2).setOrigin(0.5, 1).setActive(false).setVisible(false);
        this.group.add(s);
        s.setBounce(0.3).setDragX(200);
        (s.body as Physics.Arcade.Body).setSize(12, 12).setOffset((s.width - 12) / 2, s.height - 12);
        s.disableBody(true, true);
        return s;
      },
      (s) => s.disableBody(true, true),
      40,
    );
  }

  spawn(kind: PickupType, x: number, y: number, tossX = 30): void {
    const s = this.pool.acquire();
    if (!s) return;
    const f = FRAME[kind];
    s.kind = kind;
    s.age = 0;
    s.enableBody(true, x, y, true, true);
    s.setFrame(f.frame);
    (s.body as Physics.Arcade.Body).setSize(12, 12).setOffset((s.width - 12) / 2, s.height - 12);
    if (f.anim) s.play(f.anim);
    else s.stop();
    s.setVelocity(tossX, -180).setDragX(tossX === 30 ? 200 : 60);
  }

  collect(player: Geom.Rectangle, onCollect: (kind: PickupType, x: number, y: number) => void): void {
    this.pool.forEachActive((s) => {
      s.age += 1;
      if (s.age < 12) return;
      this.rect.setTo(s.x - 8, s.y - 14, 16, 14);
      if (Geom.Intersects.RectangleToRectangle(player, this.rect)) {
        onCollect(s.kind, s.x, s.y);
        this.pool.release(s);
      }
    });
  }

  cull(left: number): void {
    this.pool.forEachActive((s) => { if (s.x < left - 120) this.pool.release(s); });
  }

  get active(): number {
    return this.pool.activeCount;
  }
}
