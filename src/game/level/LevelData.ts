import type { BlockKind } from "./Terrain";
import type { EnemyType, IdlePose } from "../entities/enemies/EnemyDefs";
import type { PickupType } from "../systems/PickupSystem";
import type { PropType } from "../entities/props/Prop";

export type TileKey = "dock" | "fill" | "brick" | "plank" | "roof" | "rail" | "crate";

export interface BlockDef {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BlockKind;
  tile: TileKey;
  fill?: TileKey;
}

export interface PropDef {
  type: PropType;
  x: number;
  y?: number;
  drop?: PickupType;
}

export interface HostageDef {
  x: number;
  y?: number;
  drop: PickupType;
}

export interface SpawnDef {
  type: EnemyType;
  x?: number;
  y?: number;
  side?: "left" | "right";
  delay?: number;
  idle?: IdlePose;
  hold?: boolean;
}

export interface TriggerDef {
  at: number;
  lock?: boolean;
  spawns: SpawnDef[];
}

export interface LevelData {
  name: string;
  title: string;
  length: number;
  groundY: number;
  playerStart: number;
  blocks: BlockDef[];
  props: PropDef[];
  hostages: HostageDef[];
  mule: { x: number };
  triggers: TriggerDef[];
  boss: { lockAt: number; stopX: number };
}
