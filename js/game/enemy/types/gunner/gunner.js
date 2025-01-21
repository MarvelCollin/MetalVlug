import { enemyType } from "../enemyType.js";
import { EnemyAbstract } from "../enemyAbstract.js";
import Assets from "../../../helper/assets.js";
import RocketGunner from "./rocketGunner.js";
import { DIRECTION } from "../../../entities/components/actions.js";

export class Gunner extends EnemyAbstract {
  constructor() {
    super(enemyType.GUNNER);
    this.stats = {
      health: 150,
      speed: 1,
      detectionRange: 800,
      attackRange: 600,
      scale: 4,
    };

    this.burstCount = 0;
    this.maxBurst = 1; 
    this.burstDelay = 200; 
    this.lastBurstTime = 0;
    this.idleTime = 1000; 
    this.isIdling = false;
    this.idleStartTime = 0;

    this.shootPattern = 0;
    this.patternSwitchTime = 10;
    this.lastPatternSwitch = Date.now();

    this.bullets = [];
    this.bulletSprite = null;
    this.loadBulletSprite();
  }

  async loadBulletSprite() {
    try {
      this.bulletSprite = await Assets.getEnemyGunnerBullet();
    } catch (error) {
      console.error("Failed to load gunner bullet sprite:", error);
    }
  }

  attack(enemy) {
    const now = Date.now();
    const distance = enemy.getDistanceToPlayer(enemy.target);

    if (this.isIdling) {
      if (now - this.idleStartTime >= this.idleTime) {
        this.setIsIdling(false);
        this.setBurstCount(0);
        this.setLastBurstTime(0);
        enemy.lastAttackTime = 0;
        enemy.setSprite(enemy.sprites.idle);
      }
      return;
    }

    if (now - this.lastPatternSwitch >= this.patternSwitchTime) {
      this.shootPattern = (this.shootPattern + 1) % 2;
      this.lastPatternSwitch = now;
    }

    if (distance <= enemy.attackRange && this.bulletSprite) {
      if (
        this.getBurstCount() < this.maxBurst &&
        now - this.getLastBurstTime() >= this.burstDelay
      ) {
        const direction = enemy.lastDirection === DIRECTION.LEFT ? -1 : 1;
        const bulletX = enemy.x + (direction === 1 ? enemy.width : 0);
        const bulletY = enemy.y - enemy.height / 2;

        const bullet = new RocketGunner(
          bulletX,
          bulletY,
          direction,
          this.bulletSprite,
          enemy.damageAmount,
          15,
          enemy.target,
          this.shootPattern === 1
        );

        this.bullets.push(bullet);
        enemy.currentSprite = enemy.sprites.attack;
        this.setBurstCount(this.getBurstCount() + 1);
        this.setLastBurstTime(now);

        this.setIsIdling(true);
        this.idleStartTime = now;
      }
    }
  }

  updateBehavior(enemy) {
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update();

      if (bullet.hasHitTarget(enemy.target)) {
        enemy.target.takeDamage(bullet.damage);
        bullet.active = false;
        return false;
      }

      if (bullet.x < 0 || bullet.x > 5000) {
        return false;
      }

      return bullet.active;
    });

    if (enemy.grounded) {
      const distanceToPlayer = enemy.getDistanceToPlayer(enemy.target);

      if (enemy.health <= 0) {
        enemy.setState(enemy.dieState);
      } else if (distanceToPlayer <= enemy.attackRange) {
        if (!this.isIdling) {
          enemy.setState(enemy.attackState);
          enemy.setSprite(enemy.sprites.attack);
          this.attack(enemy);
        } else {
          enemy.setState(enemy.idleState);
          enemy.setSprite(enemy.sprites.idle);
        }
      } else {
        this.setIsIdling(false);
        this.setBurstCount(0);

        if (distanceToPlayer <= enemy.detectionRange) {
          enemy.setState(enemy.moveState);
          enemy.setSprite(enemy.sprites.move);
          enemy.moveTowardsPlayer(enemy.target);
        } else {
          enemy.setSprite(enemy.sprites.idle);
          enemy.setState(enemy.idleState);
          enemy.velocityX = 0;
        }
      }
    }
  }

  draw(enemy) {
    if (this.bullets?.length > 0) {
      this.bullets.forEach((bullet) => {
        if (bullet?.draw) {
          bullet.draw();
        }
      });
    }
  }

  getBurstCount() {
    return this.burstCount;
  }
  getMaxBurst() {
    return this.maxBurst;
  }
  getBurstDelay() {
    return this.burstDelay;
  }
  getLastBurstTime() {
    return this.lastBurstTime;
  }
  getIsIdling() {
    return this.isIdling;
  }

  setBurstCount(value) {
    this.burstCount = value;
  }
  setLastBurstTime(value) {
    this.lastBurstTime = value;
  }
  setIsIdling(value) {
    this.isIdling = value;
  }
}
