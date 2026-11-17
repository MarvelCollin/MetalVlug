import type { BlockKind } from "./Terrain";
import type { EnemyType, IdlePose } from "../entities/enemies/EnemyDefs";
import type { PickupType } from "../systems/PickupSystem";
import type { PropType } from "../entities/props/Prop";

import type { Theme } from "../assets/keys";
import type { TrackId } from "../audio/tracks";

export type TileKey = "dock" | "fill" | "brick" | "plank" | "roof" | "rail" | "crate" | "grass" | "dirt" | "sandbag";

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
  entry?: "walk" | "para";
}

export interface TriggerDef {
  at: number;
  lock?: boolean;
  spawns: SpawnDef[];
}

export interface TipDef {
  x: number;
  text: string;
}

export interface LevelData {
  name: string;
  label: string;
  title: string;
  theme: Theme;
  music: TrackId;
  clock: boolean;
  lives: number;
  tips: TipDef[];
  goalX?: number;
  length: number;
  groundY: number;
  playerStart: number;
  blocks: BlockDef[];
  props: PropDef[];
  hostages: HostageDef[];
  mule?: { x: number };
  triggers: TriggerDef[];
  boss?: { lockAt: number; stopX: number };
}
