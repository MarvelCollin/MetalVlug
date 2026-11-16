import type { MissionScene } from "../scenes/MissionScene";

export interface DebugApi {
  scene: MissionScene;
  hold(mask: number): void;
  warp(x: number): void;
  shield(seconds: number): void;
  snapshot(): Record<string, unknown>;
}

declare global {
  interface Window {
    __mv?: DebugApi;
  }
}

export function installDebugBridge(scene: MissionScene): void {
  if (!import.meta.env.DEV) return;
  window.__mv = {
    scene,
    hold: (mask) => scene.inputSys.inject(mask),
    warp: (x) => {
      scene.spawner.skipTo(x - 160);
      scene.ctx.camera.snapTo(Math.max(0, x - 160));
      scene.player.legs.setPosition(x, 120).setVelocity(0, 0);
    },
    shield: (seconds) => scene.player.debugShield(seconds),
    snapshot: () => {
      const s = scene.state;
      return {
        phase: s.phase,
        x: Math.round(scene.player.x),
        y: Math.round(scene.player.y),
        playerState: scene.player.state,
        weapon: s.loadout.weapon.id,
        ammo: s.loadout.ammo,
        bombs: s.loadout.bombs,
        score: s.score.score,
        tinkers: s.score.tinkers,
        lives: s.lives.remaining,
        timer: s.clock.display,
        piloting: s.piloting,
        muleArmour: s.muleArmour,
        muleShells: s.muleShells,
        enemiesAlive: scene.enemies.aliveCount(),
        camLeft: Math.round(scene.ctx.camera.left),
        locked: scene.ctx.camera.locked,
        boss: scene.warden?.state ?? "none",
        level: scene.level.name,
      };
    },
  };
}
