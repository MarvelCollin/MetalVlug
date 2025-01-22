import Assets from "../../helper/assets.js";

export const enemyType = {
  NORMAL: "normal",
  RIFLE: "rifle",
  BAZOOKA: "bazooka",
  SHIELD: "shield",
  GUNNER: "gunner",
};

export const enemyTypeToSprite = {
  [enemyType.NORMAL]: {
    idle: () => Assets.getEnemySoldierNormalIdle(),
    walk: () => Assets.getEnemySoldierNormalRun(),
    die: () => Assets.getEnemySoldierNormalDie(),
    attack: () => Assets.getEnemySoldierNormalMeleeStab(),
  },
  [enemyType.RIFLE]: {
    idle: () => Assets.getEnemySoldierRifleIdle(),
    walk: () => Assets.getEnemySoldierRifleMove(),
    die: () => Assets.getEnemySoldierRifleDie(),
    attack: () => Assets.getEnemySoldierRifleShoot(),
    bullet: () => Assets.getEnemySoldierRifleBullet(),
  },
  [enemyType.BAZOOKA]: {
    idle: () => Assets.getEnemySoldierBazookaMove(),
    walk: () => Assets.getEnemySoldierBazookaMove(),
    die: () => Assets.getEnemySoldierBazookaDie(),
    attack: () => Assets.getEnemySoldierBazookaMove(),
    bullet: () => Assets.getEnemySoldierBazookaBullet(),
    explode: () => Assets.getEnemySoldierBazookaExplode(),
  },
  [enemyType.SHIELD]: {
    idle: () => Assets.getEnemySoldierShieldIdle(),
    walk: () => Assets.getEnemySoldierShieldMove(),
    die: () => Assets.getEnemySoldierShieldDie(),
    melee: () => Assets.getEnemySoldierShieldMelee(),
    defend: () => Assets.getEnemySoldierShieldDefend(),
    attack: () => Assets.getEnemySoldierShieldShoot(),
    shield: () => Assets.getEnemySoldierShieldShield(),
  },
  [enemyType.GUNNER]: {
    idle: () => Assets.getEnemyGunnerIdle(),
    walk: () => Assets.getEnemyGunnerMove(),
    die: () => Assets.getEnemyGunnerDie(),
    attack: () => Assets.getEnemyGunnerShootHorizontal(),
    bullet: () => Assets.getEnemyGunnerBullet(),
  },
};
