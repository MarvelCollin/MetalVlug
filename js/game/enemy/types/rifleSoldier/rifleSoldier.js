import { enemyType, enemyTypeToSprite } from "../enemyType.js";

export class RifleSoldier {
    constructor() {
        this.type = enemyType.RIFLE;
        this.stats = {
            health: 80,
            speed: 8,
            detectionRange: 900,
            attackRange: 700,
            scale: 4
        };
        this.sprites = enemyTypeToSprite[this.type];
        this.optimalRange = 500;
    }

    attack(enemy) {
        const now = Date.now();
        if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
            const distance = enemy.getDistanceToPlayer(enemy.target);
            if (distance <= enemy.attackRange) {
                enemy.currentSprite = enemy.sprites.attack;
                enemy.damageAmount = 15;
                enemy.target.takeDamage(enemy.damageAmount);
                enemy.lastAttackTime = now;
            }
        }
    }

    updateBehavior(enemy) {
        if (enemy.grounded) {
            const distanceToPlayer = enemy.getDistanceToPlayer(enemy.target);
            
            if (enemy.health <= 0) {
                enemy.setState(enemy.dieState);
            } else if (distanceToPlayer <= enemy.attackRange) {
                if (distanceToPlayer < 300) {
                    enemy.setState(enemy.moveState);
                    const direction = enemy.target.x < enemy.x ? 1 : -1;
                    enemy.velocityX = enemy.speed * direction;
                    enemy.lastDirection = direction > 0 ? 'RIGHT' : 'LEFT';
                } else {
                    enemy.setState(enemy.attackState);
                    this.attack(enemy);
                    enemy.velocityX = 0;
                }
            } else if (distanceToPlayer <= enemy.detectionRange) {
                enemy.setState(enemy.moveState);
                if (Math.abs(distanceToPlayer - this.optimalRange) > 50) {
                    enemy.moveTowardsPlayer(enemy.target);
                } else {
                    enemy.velocityX = 0;
                }
            } else {
                enemy.setState(enemy.idleState);
                enemy.velocityX = 0;
            }
        }
    }
}
