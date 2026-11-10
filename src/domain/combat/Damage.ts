export type DamageKind = "bullet" | "knife" | "blast" | "fire";
export type Faction = "player" | "enemy";

export interface Hit {
  amount: number;
  kind: DamageKind;
  from: Faction;
  x: number;
  y: number;
}

export interface HitResult {
  absorbed: boolean;
  killed: boolean;
}

export const MISS: HitResult = { absorbed: false, killed: false };
export const ABSORBED: HitResult = { absorbed: true, killed: false };
export const KILLED: HitResult = { absorbed: true, killed: true };
