import { MISSION, PLAYER, SCORE } from "../../config/tuning";
import { Loadout } from "../../domain/weapons/Loadout";
import { ScoreKeeper } from "../../domain/scoring/ScoreKeeper";
import { Lives } from "../../domain/mission/Lives";
import { MissionClock } from "../../domain/mission/MissionClock";

export interface MissionRules {
  lives: number;
  clock: boolean;
  easy: boolean;
}

export class MissionState {
  readonly loadout = new Loadout(PLAYER.startBombs);
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

  constructor(rules: MissionRules) {
    this.lives = new Lives(rules.lives + (rules.easy ? 2 : 0));
    this.clockEnabled = rules.clock;
    this.easy = rules.easy;
    if (!rules.clock) this.clock.pause();
  }
}
