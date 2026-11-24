export const PHYSICS = {
  gravity: 900,
} as const;

export const CAMERA = {
  ease: 4,
  minSpeed: 30,
  maxSpeed: 150,
  accel: 260,
} as const;

export const PLAYER = {
  runSpeed: 90,
  crawlSpeed: 40,
  jumpSpeed: 300,
  shortHopCut: 0.45,
  body: { w: 12, h: 30, crouchH: 20 },
  respawnDelay: 1.1,
  respawnInvulnerable: 2,
  exitInvulnerable: 1,
  knifeReach: 24,
  knifeHeight: 26,
  knifeTime: 0.28,
  throwTime: 0.22,
  maxBombsOnScreen: 2,
  startBombs: 10,
  lives: 3,
} as const;

export const BOMB = {
  throwX: 150,
  throwY: 230,
  bounce: 0.45,
  radius: 30,
  damage: 6,
} as const;

export const MISSION = {
  clockUnits: 60,
  secondsPerUnit: 4,
  alarmAt: 10,
  continueCount: 9,
  continueStepSeconds: 1,
} as const;

export const SCORE = {
  shotKill: 100,
  knifeKill: 300,
  crate: 50,
  ration: 100,
  gem: 500,
  turret: 2000,
  core: 10000,
  tinkerBonus: 10000,
  spareItem: 1000,
} as const;

export const ENEMY = {
  noticeRange: 170,
  alertTime: 0.45,
  despawnBehind: 96,
  hopSpeed: 290,
  paraFall: 52,
  grunt: { hp: 1, speed: 60, keepMin: 80, keepMax: 150, aimTime: 0.5, fireGap: [1.6, 2.6], bulletSpeed: 110, maxAngle: 0.6 },
  lobber: { hp: 1, speed: 50, keepMin: 110, keepMax: 170, windup: 0.5, throwGap: [2.4, 3.2], flightTime: 0.9 },
  rusher: { hp: 2, speed: 110, reach: 20, windup: 0.45, active: 0.12, recover: 0.5 },
  bazooka: { hp: 1, speed: 45, keepMin: 130, keepMax: 220, aimTime: 0.75, recover: 0.55, fireGap: [2.8, 3.8], rocketSpeed: 105, rocketLift: 3 },
  shield: { hp: 4, speed: 32, keepMin: 56, keepMax: 120, peekTime: 0.5, exposed: 0.45, fireGap: [2.2, 3.2], bulletSpeed: 115, maxAngle: 0.5, coverHeight: 33 },
} as const;

export const MULE = {
  armour: 3,
  speed: 80,
  jumpSpeed: 250,
  shells: 10,
  vulcanGap: 0.07,
  vulcanSpeed: 380,
  aimTurnRate: 9,
  forwardTilt: 0.16,
  shellSpeedX: 220,
  shellSpeedY: 140,
  shellRadius: 32,
  shellDamage: 10,
  dyingTime: 1.5,
  chargeSpeed: 170,
  chargeTime: 1.4,
  chargeRadius: 44,
  chargeDamage: 20,
  reenterDelay: 0.8,
} as const;

export const WARDEN = {
  turretHp: 30,
  coreHp: 60,
  rollInSpeed: 60,
  shellGap: 2.2,
  mortarGap: 3.4,
  spreadGap: 1.3,
  chargeTime: 0.55,
  skimSpeed: 120,
  skimHeight: 6,
  skimPair: 0.2,
  rusherGap: 5,
  shellSpeed: 95,
  mortarRadius: 24,
} as const;
