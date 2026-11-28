import { MISSION, SCORE } from "../../config/tuning";
import type { CharacterDef } from "../../domain/characters/Characters";
import { Loadout } from "../../domain/weapons/Loadout";
import { ScoreKeeper, type Tally } from "../../domain/scoring/ScoreKeeper";
import { Lives } from "../../domain/mission/Lives";
import { MissionClock } from "../../domain/mission/MissionClock";

export interface MissionRules {
  character: CharacterDef;
  lives: number;
  clock: boolean;
  easy: boolean;
  carry?: { score: number; lives: number };
}

export class MissionState {
  readonly loadout: Loadout;
  readonly score = new ScoreKeeper(SCORE.tinkerBonus);
  readonly lives: Lives;
  readonly clock = new MissionClock(MISSION.clockUnits, MISSION.secondsPerUnit, MISSION.alarmAt);
  readonly clockEnabled: boolean;
  readonly easy: boolean;
  muleArmour = 0;
  muleShells = 0;
  piloting = false;
  continueCount = -1;
  phase: "intro" | "play" | "gameover" | "complete" = "intro";
  tally: Tally | null = null;
  tallyDone = false;

  constructor(rules: MissionRules) {
    this.loadout = new Loadout(rules.character.startBombs);
    this.lives = new Lives(rules.lives + (rules.easy ? 2 : 0));
    this.clockEnabled = rules.clock;
    this.easy = rules.easy;
    if (!rules.clock) this.clock.pause();
    if (rules.carry) {
      this.score.add(rules.carry.score);
      this.lives.restore(rules.carry.lives);
    }
  }
}
