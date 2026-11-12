import type { Scene } from "phaser";
import type { EventBus } from "../../core/events/EventBus";
import type { Rng } from "../../core/random/Rng";
import type { InputFrame } from "../../domain/input/Actions";
import type { AnchorTable, Point } from "../assets/keys";
import type { GameEvents } from "./GameEvents";
import type { MissionState } from "./MissionState";
import type { Terrain } from "../level/Terrain";
import type { CameraDirector } from "../systems/CameraDirector";
import type { CombatSystem } from "../systems/CombatSystem";
import type { ProjectileSystem } from "../systems/ProjectileSystem";
import type { EffectsSystem } from "../systems/EffectsSystem";
import type { PickupSystem } from "../systems/PickupSystem";

export interface PlayerLocator {
  readonly x: number;
  readonly y: number;
  readonly alive: boolean;
  readonly centerY: number;
}

export interface GameContext {
  readonly scene: Scene;
  readonly events: EventBus<GameEvents>;
  readonly input: InputFrame;
  readonly rng: Rng;
  readonly state: MissionState;
  readonly terrain: Terrain;
  readonly camera: CameraDirector;
  readonly combat: CombatSystem;
  readonly projectiles: ProjectileSystem;
  readonly fx: EffectsSystem;
  readonly pickups: PickupSystem;
  readonly player: PlayerLocator;
  anchor(frame: string, name: string): Point;
  anchorValue(frame: string, name: string): Point | number | undefined;
}

export function anchorLookup(table: AnchorTable): (frame: string, name: string) => Point {
  const zero = { x: 0, y: 0 };
  return (frame, name) => {
    const v = table[frame]?.[name];
    return typeof v === "object" ? v : zero;
  };
}
