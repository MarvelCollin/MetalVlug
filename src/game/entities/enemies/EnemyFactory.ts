import type { GameContext } from "../../context/GameContext";
import { Enemy, type EnemySpawn } from "./Enemy";
import type { EnemyType } from "./EnemyDefs";
import type { EnemyBehaviour } from "./behaviours/EnemyBehaviour";
import { GruntBehaviour } from "./behaviours/GruntBehaviour";
import { LobberBehaviour } from "./behaviours/LobberBehaviour";
import { RusherBehaviour } from "./behaviours/RusherBehaviour";
import { DummyBehaviour } from "./behaviours/DummyBehaviour";

export class EnemyFactory {
  private readonly all: Enemy[] = [];
  private readonly behaviours: Record<EnemyType, EnemyBehaviour> = {
    grunt: new GruntBehaviour(),
    lobber: new LobberBehaviour(),
    rusher: new RusherBehaviour(),
    dummy: new DummyBehaviour(),
  };

  constructor(private readonly ctx: GameContext) {}

  spawn(s: EnemySpawn): Enemy {
    let e = this.all.find((x) => !x.active);
    if (!e) {
      e = new Enemy(this.ctx, this.behaviours);
      this.all.push(e);
      this.ctx.combat.add(e);
    }
    e.spawn(s);
    return e;
  }

  tick(dt: number): void {
    for (const e of this.all) e.tick(dt);
  }

  aliveInGroup(group: number): number {
    let n = 0;
    for (const e of this.all) if (e.alive && e.group === group) n++;
    return n;
  }

  aliveCount(): number {
    let n = 0;
    for (const e of this.all) if (e.alive) n++;
    return n;
  }

  get list(): readonly Enemy[] {
    return this.all;
  }
}
