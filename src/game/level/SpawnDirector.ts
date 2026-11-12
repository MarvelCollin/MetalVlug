import type { GameContext } from "../context/GameContext";
import type { EnemyFactory } from "../entities/enemies/EnemyFactory";
import type { LevelData, SpawnDef } from "./LevelData";

interface Pending {
  at: number;
  def: SpawnDef;
  group: number;
}

export class SpawnDirector {
  private next = 0;
  private time = 0;
  private readonly pending: Pending[] = [];
  private lockedGroup: number | null = null;

  constructor(private readonly ctx: GameContext, private readonly data: LevelData, private readonly enemies: EnemyFactory) {}

  get lockGroup(): number | null {
    return this.lockedGroup;
  }

  skipTo(scroll: number): void {
    while (this.next < this.data.triggers.length && this.data.triggers[this.next]!.at <= scroll) this.next++;
    this.pending.length = 0;
    this.lockedGroup = null;
    this.ctx.camera.unlock();
  }

  update(dt: number): void {
    this.time += dt;
    const cam = this.ctx.camera;
    while (this.next < this.data.triggers.length && cam.left >= this.data.triggers[this.next]!.at) {
      const t = this.data.triggers[this.next]!;
      const group = this.next;
      if (t.lock) {
        cam.lock(t.at);
        this.lockedGroup = group;
      }
      for (const def of t.spawns) this.pending.push({ at: this.time + (def.delay ?? 0), def, group });
      this.next++;
    }
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const p = this.pending[i]!;
      if (p.at > this.time) continue;
      this.pending.splice(i, 1);
      this.spawn(p);
    }
    if (this.lockedGroup !== null && !this.pending.some((p) => p.group === this.lockedGroup) && this.enemies.aliveInGroup(this.lockedGroup) === 0) {
      this.lockedGroup = null;
      cam.unlock();
      this.ctx.events.emit("waveCleared", undefined);
    }
  }

  private spawn(p: Pending): void {
    const d = p.def;
    const cam = this.ctx.camera;
    const placed = d.x !== undefined;
    const x = d.x ?? (d.side === "left" ? cam.left - 16 : cam.right + 16);
    this.enemies.spawn({
      type: d.type,
      x,
      y: d.y ?? this.data.groundY,
      idle: d.idle ?? (placed ? "idle" : "none"),
      hold: d.hold ?? false,
      group: p.group,
      facing: d.side === "left" ? 1 : -1,
    });
  }
}
