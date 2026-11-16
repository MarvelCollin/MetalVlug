import type { Scene } from "phaser";
import { DATA, TEX, type FxMetaTable } from "./keys";

interface AnimSpec {
  key: string;
  prefix: string;
  frames: number;
  rate: number;
  repeat?: number;
  yoyo?: boolean;
}

const SPECS: AnimSpec[] = [
  { key: "pip_legs_run", prefix: "pip_legs_run_", frames: 8, rate: 16, repeat: -1 },
  { key: "pip_legs_crawl", prefix: "pip_legs_crawl_", frames: 6, rate: 10, repeat: -1 },
  { key: "pip_die", prefix: "pip_die_", frames: 6, rate: 10 },
  { key: "pip_knife", prefix: "pip_knife_", frames: 3, rate: 14 },
  { key: "pip_throw", prefix: "pip_throw_", frames: 3, rate: 16 },
  { key: "grunt_idle", prefix: "grunt_idle_", frames: 2, rate: 2, repeat: -1 },
  { key: "grunt_read", prefix: "grunt_read_", frames: 2, rate: 1.5, repeat: -1 },
  { key: "grunt_alert", prefix: "grunt_alert_", frames: 2, rate: 8, repeat: -1 },
  { key: "grunt_run", prefix: "grunt_run_", frames: 8, rate: 14, repeat: -1 },
  { key: "grunt_die", prefix: "grunt_die_", frames: 6, rate: 12 },
  { key: "lobber_idle", prefix: "lobber_idle_", frames: 2, rate: 3, repeat: -1 },
  { key: "lobber_run", prefix: "lobber_run_", frames: 8, rate: 12, repeat: -1 },
  { key: "lobber_throw", prefix: "lobber_throw_", frames: 3, rate: 8 },
  { key: "lobber_die", prefix: "lobber_die_", frames: 6, rate: 12 },
  { key: "rusher_idle", prefix: "rusher_idle_", frames: 2, rate: 3, repeat: -1 },
  { key: "rusher_run", prefix: "rusher_run_", frames: 8, rate: 18, repeat: -1 },
  { key: "rusher_die", prefix: "rusher_die_", frames: 6, rate: 12 },
  { key: "tinker_sit", prefix: "tinker_sit_", frames: 2, rate: 2, repeat: -1 },
  { key: "tinker_cheer", prefix: "tinker_cheer_", frames: 2, rate: 8, repeat: -1 },
  { key: "tinker_give", prefix: "tinker_give_", frames: 2, rate: 6, repeat: -1 },
  { key: "tinker_run", prefix: "tinker_run_", frames: 8, rate: 16, repeat: -1 },
  { key: "mule_walk", prefix: "mule_walk_", frames: 6, rate: 12, repeat: -1 },
  { key: "warden_wheel", prefix: "warden_wheel_", frames: 4, rate: 12, repeat: -1 },
  { key: "warden_core_open", prefix: "warden_core_open_", frames: 2, rate: 8, repeat: -1 },
  { key: "boom", prefix: "boom_", frames: 8, rate: 20 },
  { key: "boom_s", prefix: "boom_s_", frames: 6, rate: 22 },
  { key: "spark", prefix: "spark_", frames: 4, rate: 30 },
  { key: "smoke", prefix: "smoke_", frames: 4, rate: 8 },
  { key: "blast", prefix: "blast_", frames: 3, rate: 24 },
  { key: "blast_up", prefix: "blast_up_", frames: 3, rate: 24 },
  { key: "flash", prefix: "flash_", frames: 2, rate: 30 },
  { key: "dust", prefix: "dust_", frames: 4, rate: 14 },
  { key: "bullet_e", prefix: "bullet_e_", frames: 2, rate: 12, repeat: -1 },
  { key: "bomb", prefix: "bomb_", frames: 4, rate: 16, repeat: -1 },
  { key: "gem", prefix: "gem_", frames: 4, rate: 8, repeat: -1 },
  { key: "go", prefix: "go_", frames: 2, rate: 4, repeat: -1 },
  { key: "dummy_hit", prefix: "dummy_hit_", frames: 2, rate: 14, repeat: 1 },
  { key: "flag", prefix: "flag_", frames: 3, rate: 6, repeat: -1 },
];

export function registerAnimations(scene: Scene): void {
  const fx = scene.cache.json.get(DATA.fxMeta) as FxMetaTable;
  for (const [key, m] of Object.entries(fx)) {
    if (scene.anims.exists(key)) continue;
    scene.anims.create({ key, frames: scene.anims.generateFrameNames(TEX.fx, { prefix: `${key}_`, start: 0, end: m.frames - 1 }), frameRate: m.fps });
  }
  for (const s of SPECS) {
    if (scene.anims.exists(s.key)) continue;
    scene.anims.create({
      key: s.key,
      frames: scene.anims.generateFrameNames(TEX.atlas, { prefix: s.prefix, start: 0, end: s.frames - 1 }),
      frameRate: s.rate,
      repeat: s.repeat ?? 0,
      yoyo: s.yoyo ?? false,
    });
  }
}
