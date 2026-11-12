import { Geom } from "phaser";
import { MISS, type Faction, type Hit, type HitResult } from "../../domain/combat/Damage";

export interface Target {
  readonly faction: Faction;
  isHittable(): boolean;
  bounds(out: Geom.Rectangle): Geom.Rectangle;
  hit(hit: Hit): HitResult;
}

export class CombatSystem {
  private readonly targets = new Set<Target>();
  private readonly box = new Geom.Rectangle();
  private readonly circle = new Geom.Circle();

  add(t: Target): void {
    this.targets.add(t);
  }

  remove(t: Target): void {
    this.targets.delete(t);
  }

  firstOverlap(attacker: Faction, rect: Geom.Rectangle): Target | null {
    for (const t of this.targets) {
      if (t.faction === attacker || !t.isHittable()) continue;
      if (Geom.Intersects.RectangleToRectangle(rect, t.bounds(this.box))) return t;
    }
    return null;
  }

  strikeFirst(rect: Geom.Rectangle, hit: Hit): HitResult {
    const t = this.firstOverlap(hit.from, rect);
    return t ? t.hit(hit) : MISS;
  }

  strikeAll(rect: Geom.Rectangle, hit: Hit, filter?: (t: Target) => boolean): number {
    let n = 0;
    for (const t of [...this.targets]) {
      if (t.faction === hit.from || !t.isHittable() || (filter && !filter(t))) continue;
      if (Geom.Intersects.RectangleToRectangle(rect, t.bounds(this.box)) && t.hit(hit).absorbed) n++;
    }
    return n;
  }

  strikeArea(x: number, y: number, radius: number, hit: Hit): number {
    this.circle.setTo(x, y, radius);
    let n = 0;
    for (const t of [...this.targets]) {
      if (t.faction === hit.from || !t.isHittable()) continue;
      if (Geom.Intersects.CircleToRectangle(this.circle, t.bounds(this.box)) && t.hit(hit).absorbed) n++;
    }
    return n;
  }

  anyInRect(attacker: Faction, rect: Geom.Rectangle, filter?: (t: Target) => boolean): boolean {
    for (const t of this.targets) {
      if (t.faction === attacker || !t.isHittable() || (filter && !filter(t))) continue;
      if (Geom.Intersects.RectangleToRectangle(rect, t.bounds(this.box))) return true;
    }
    return false;
  }

  clear(): void {
    this.targets.clear();
  }
}
