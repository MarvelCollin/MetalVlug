import type { SoundId } from "../context/GameEvents";

export interface SampleSpec {
  readonly files: readonly string[];
  readonly gain: number;
  readonly jitter?: number;
}

const set = (name: string, count: number): string[] => Array.from({ length: count }, (_, i) => `${name}_${i}.mp3`);

export const SFX: Partial<Record<SoundId, SampleSpec>> = {
  shot: { files: set("shot", 3), gain: 0.45, jitter: 0.05 },
  rivet: { files: set("rivet", 2), gain: 0.4, jitter: 0.06 },
  vulcan: { files: set("vulcan", 2), gain: 0.32, jitter: 0.08 },
  enemyShot: { files: set("enemyshot", 2), gain: 0.38, jitter: 0.05 },
  scatter: { files: set("scatter", 1), gain: 0.6, jitter: 0.04 },
  cannon: { files: set("cannon", 1), gain: 0.7, jitter: 0.04 },
  rocket: { files: set("rocket", 1), gain: 0.5, jitter: 0.06 },
  flame: { files: set("flame", 2), gain: 0.45, jitter: 0.06 },
  laser: { files: set("laser", 2), gain: 0.28, jitter: 0.04 },
  charge: { files: set("charge", 1), gain: 0.5 },
  boom: { files: set("boom", 5), gain: 0.65, jitter: 0.06 },
  bigboom: { files: set("bigboom", 2), gain: 0.8, jitter: 0.04 },
  knife: { files: set("knife", 2), gain: 0.6, jitter: 0.06 },
  hit: { files: set("hit", 3), gain: 0.35, jitter: 0.08 },
  clank: { files: set("clank", 3), gain: 0.42, jitter: 0.08 },
  jump: { files: set("jump", 2), gain: 0.25, jitter: 0.08 },
  throw: { files: set("throw", 1), gain: 0.35, jitter: 0.08 },
  pickup: { files: set("pickup", 1), gain: 0.5 },
  weapon: { files: set("weapon", 1), gain: 0.55 },
  rescue: { files: set("rescue", 1), gain: 0.55 },
  die: { files: set("die", 1), gain: 0.6 },
  enemyDie: { files: set("enemydie", 8), gain: 0.42, jitter: 0.06 },
  scream: { files: set("scream", 4), gain: 0.4, jitter: 0.06 },
  alarm: { files: set("alarm", 1), gain: 0.45 },
  go: { files: set("go", 1), gain: 0.7 },
  mission: { files: set("mission", 1), gain: 0.55 },
  complete: { files: set("rescue", 1), gain: 0.55 },
};

export type VoiceId = "ready" | "go" | "missionCompleted" | "objectiveAchieved" | "gameOver" | "powerUp" | "lookOut" | "targetDestroyed";

export const VOICES: Readonly<Record<VoiceId, string>> = {
  ready: "voice_ready.mp3",
  go: "voice_go.mp3",
  missionCompleted: "voice_mission_completed.mp3",
  objectiveAchieved: "voice_objective_achieved.mp3",
  gameOver: "voice_game_over.mp3",
  powerUp: "voice_power_up.mp3",
  lookOut: "voice_war_look_out.mp3",
  targetDestroyed: "voice_war_target_destroyed.mp3",
};

export const VOICE_GAIN = 0.9;
