export type CharacterId = "pip" | "juno";

export interface CharacterDef {
  readonly id: CharacterId;
  readonly name: string;
  readonly role: string;
  readonly perk: readonly [string, string];
  readonly startBombs: number;
  readonly runSpeed: number;
  readonly knifeReach: number;
  readonly throwBoost: number;
  readonly bombBounces: number;
}

export const CHARACTERS: Readonly<Record<CharacterId, CharacterDef>> = {
  pip: { id: "pip", name: "PIP", role: "COURIER", perk: ["LONG KNIFE", "QUICK FEET"], startBombs: 10, runSpeed: 90, knifeReach: 30, throwBoost: 1, bombBounces: 1 },
  juno: { id: "juno", name: "JUNO", role: "DEMOLITIONS", perk: ["15 BOMBS", "LONG THROWS"], startBombs: 15, runSpeed: 84, knifeReach: 24, throwBoost: 1.25, bombBounces: 2 },
};

export const CHARACTER_ORDER: readonly CharacterId[] = ["pip", "juno"];
