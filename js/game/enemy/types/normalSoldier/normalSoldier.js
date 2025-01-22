import { enemyType } from "../enemyType.js";
import { EnemyAbstract } from "../enemyAbstract.js";

export class NormalSoldier extends EnemyAbstract {
    constructor() {
        super(enemyType.NORMAL);
        this.stats = {
            health: 100,
            speed: 10,
            detectionRange: 700,
            attackRange: 150,
            scale: 1
        };
    }

    attack(enemy) {
        const now = Date.now();
        if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
            const distance = enemy.getDistanceToPlayer(enemy.target);
            if (distance <= enemy.attackRange) {
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
                enemy.setState(enemy.attackState);
                this.attack(enemy);
                enemy.velocityX = 0;
            } else if (distanceToPlayer <= enemy.detectionRange) {
                enemy.setState(enemy.moveState);
                enemy.moveTowardsPlayer(enemy.target);
            } else {
                enemy.setState(enemy.idleState);
                enemy.velocityX = 0;
            }
        }
    }
}