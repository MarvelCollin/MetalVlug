import { enemyType, enemyTypeToSprite } from "../enemyType.js";

export class ShieldSoldier {
    constructor() {
        this.type = enemyType.SHIELD;
        this.stats = {
            health: 200,
            speed: 7,
            detectionRange: 600,
            attackRange: 200,
            scale: 1
        };
        this.sprites = enemyTypeToSprite[this.type];
        this.isDefending = false;
    }

    attack(enemy) {
        const now = Date.now();
        if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
            const distance = enemy.getDistanceToPlayer(enemy.target);
            if (distance <= enemy.attackRange) {
                if (Math.random() < 0.3) { 
                    enemy.currentSprite = enemy.sprites.melee;
                    enemy.damageAmount = 20;
                } else {
                    enemy.currentSprite = enemy.sprites.attack;
                    enemy.damageAmount = 10;
                }
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
                this.isDefending = false;
                enemy.setState(enemy.attackState);
                this.attack(enemy);
                enemy.velocityX = 0;
            } else if (distanceToPlayer <= 400) {
                this.isDefending = true;
                enemy.currentSprite = enemy.sprites.defend;
                enemy.velocityX = 0;
            } else if (distanceToPlayer <= enemy.detectionRange) {
                this.isDefending = false;
                enemy.setState(enemy.moveState);
                enemy.moveTowardsPlayer(enemy.target);
            } else {
                this.isDefending = false;
                enemy.setState(enemy.idleState);
                enemy.velocityX = 0;
            }
        }
    }

    takeDamage(enemy, amount) {
        if (this.isDefending) {
            return amount * 1; 
        }
        return amount;
    }
}
