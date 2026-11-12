import type { GameObjects, Physics, Scene } from "phaser";

export type BlockKind = "solid" | "oneWay" | "decor";

export interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BlockKind;
}

export class Terrain {
  readonly solids: Physics.Arcade.StaticGroup;
  readonly platforms: Physics.Arcade.StaticGroup;
  private readonly blocks: Block[];

  constructor(scene: Scene, blocks: Block[]) {
    this.blocks = blocks.filter((b) => b.kind !== "decor");
    this.solids = scene.physics.add.staticGroup();
    this.platforms = scene.physics.add.staticGroup();
    for (const b of this.blocks) {
      const zone: GameObjects.Zone = scene.add.zone(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h);
      scene.physics.add.existing(zone, true);
      const body = zone.body as Physics.Arcade.StaticBody;
      if (b.kind === "oneWay") {
        body.checkCollision.down = false;
        body.checkCollision.left = false;
        body.checkCollision.right = false;
        this.platforms.add(zone);
      } else {
        this.solids.add(zone);
      }
    }
  }

  surfaceCrossed(x: number, yPrev: number, yNow: number): number | null {
    let best: number | null = null;
    for (const b of this.blocks) {
      if (x < b.x || x > b.x + b.w) continue;
      if (yPrev <= b.y && yNow >= b.y && (best === null || b.y < best)) best = b.y;
    }
    return best;
  }

  solidAt(x: number, y: number): boolean {
    for (const b of this.blocks) if (b.kind === "solid" && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return true;
    return false;
  }

  groundBelow(x: number, y: number): number {
    let best = Infinity;
    for (const b of this.blocks) if (x >= b.x && x <= b.x + b.w && b.y >= y - 1 && b.y < best) best = b.y;
    return best;
  }
}
