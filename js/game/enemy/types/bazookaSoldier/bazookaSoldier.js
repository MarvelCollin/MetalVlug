import { enemyType, enemyTypeToSprite } from "../enemyType.js";

export class BazookaSoldier {
    constructor() {
        this.type = enemyType.BAZOOKA;
        this.stats = {
            health: 120,
            speed: 6,
            detectionRange: 1000,
            attackRange: 800,
            scale: 4
        };
        this.sprites = enemyTypeToSprite[this.type];
        this.preferredDistance = 600;
    }

    attack(enemy) {
        const now = Date.now();
        if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
            const distance = enemy.getDistanceToPlayer(enemy.target);
            if (distance <= enemy.attackRange && distance >= 300) {
                enemy.currentSprite = enemy.sprites.attack;
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
            } else if (distanceToPlayer <= enemy.attackRange && distanceToPlayer >= 300) {
                enemy.setState(enemy.attackState);
                this.attack(enemy);
                enemy.velocityX = 0;
            } else if (distanceToPlayer <= enemy.detectionRange) {
                enemy.setState(enemy.moveState);
                if (distanceToPlayer < this.preferredDistance) {
                    const direction = enemy.target.x < enemy.x ? 1 : -1;
                    enemy.velocityX = enemy.speed * direction;
                    enemy.lastDirection = direction > 0 ? 'RIGHT' : 'LEFT';
                } else {
                    enemy.moveTowardsPlayer(enemy.target);
                }
            } else {
                enemy.setState(enemy.idleState);
                enemy.velocityX = 0;
            }
        }
    }
}
