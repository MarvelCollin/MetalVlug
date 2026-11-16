import { ENEMY } from "../../../config/tuning";

export type EnemyType = "grunt" | "lobber" | "rusher" | "dummy";
export type IdlePose = "idle" | "read" | "none";

export interface EnemyDef {
  readonly type: EnemyType;
  readonly hp: number;
  readonly speed: number;
  readonly idleAnims: Partial<Record<IdlePose, string>>;
  readonly runAnim: string;
  readonly standFrame: string;
  readonly dieAnim: string;
}

export const ENEMIES: Readonly<Record<EnemyType, EnemyDef>> = {
  grunt: { type: "grunt", hp: ENEMY.grunt.hp, speed: ENEMY.grunt.speed, idleAnims: { idle: "grunt_idle", read: "grunt_read" }, runAnim: "grunt_run", standFrame: "grunt_aim_0", dieAnim: "grunt_die" },
  lobber: { type: "lobber", hp: ENEMY.lobber.hp, speed: ENEMY.lobber.speed, idleAnims: { idle: "lobber_idle" }, runAnim: "lobber_run", standFrame: "lobber_throw_2", dieAnim: "lobber_die" },
  rusher: { type: "rusher", hp: ENEMY.rusher.hp, speed: ENEMY.rusher.speed, idleAnims: { idle: "rusher_idle" }, runAnim: "rusher_run", standFrame: "rusher_idle_0", dieAnim: "rusher_die" },
  dummy: { type: "dummy", hp: 3, speed: 0, idleAnims: {}, runAnim: "dummy_idle", standFrame: "dummy_idle_0", dieAnim: "dummy_broken" },
};
