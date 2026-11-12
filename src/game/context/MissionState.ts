import { MISSION, PLAYER, SCORE } from "../../config/tuning";
import { Loadout } from "../../domain/weapons/Loadout";
import { ScoreKeeper } from "../../domain/scoring/ScoreKeeper";
import { Lives } from "../../domain/mission/Lives";
import { MissionClock } from "../../domain/mission/MissionClock";

export class MissionState {
  readonly loadout = new Loadout(PLAYER.startBombs);
  readonly score = new ScoreKeeper(SCORE.tinkerBonus);
  readonly lives = new Lives(PLAYER.lives);
  readonly clock = new MissionClock(MISSION.clockUnits, MISSION.secondsPerUnit, MISSION.alarmAt);
  muleArmour = 0;
  muleShells = 0;
  piloting = false;
  continueCount = -1;
  phase: "intro" | "play" | "gameover" | "complete" = "intro";
}
