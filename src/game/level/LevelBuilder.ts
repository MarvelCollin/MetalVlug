import type { GameObjects, Scene } from "phaser";
import { DEPTH, VIEW_H, VIEW_W } from "../../config/display";
import { TEX } from "../assets/keys";
import type { BlockDef, LevelData, TileKey } from "./LevelData";
import { Terrain } from "./Terrain";

const TILE_H: Record<TileKey, number> = { dock: 16, fill: 16, brick: 16, plank: 7, roof: 9, rail: 16, crate: 24 };

export interface Parallax {
  far: GameObjects.TileSprite;
  mid: GameObjects.TileSprite;
}

export class LevelBuilder {
  constructor(private readonly scene: Scene, private readonly data: LevelData) {}

  backdrop(): Parallax {
    this.scene.add.image(0, 0, TEX.sky).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.sky);
    const far = this.scene.add.tileSprite(0, 0, VIEW_W, VIEW_H, TEX.far).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.far);
    const mid = this.scene.add.tileSprite(0, 0, VIEW_W, VIEW_H, TEX.mid).setOrigin(0).setScrollFactor(0).setDepth(DEPTH.mid);
    return { far, mid };
  }

  terrain(): Terrain {
    for (const b of this.data.blocks) this.drawBlock(b);
    return new Terrain(this.scene, this.data.blocks.map(({ x, y, w, h, kind }) => ({ x, y, w, h, kind })));
  }

  private drawBlock(b: BlockDef): void {
    const depth = b.kind === "decor" ? DEPTH.terrain - 2 : DEPTH.terrain;
    const top = TILE_H[b.tile];
    const frame = `${b.tile}_0`;
    if (b.fill && b.h > top) {
      this.scene.add.tileSprite(b.x, b.y, b.w, top, TEX.atlas, frame).setOrigin(0).setDepth(depth);
      this.scene.add.tileSprite(b.x, b.y + top, b.w, b.h - top, TEX.atlas, `${b.fill}_0`).setOrigin(0).setDepth(depth);
      return;
    }
    this.scene.add.tileSprite(b.x, b.y, b.w, b.h, TEX.atlas, frame).setOrigin(0).setDepth(depth);
  }
}
