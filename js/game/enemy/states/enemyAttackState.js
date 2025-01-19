import Assets from '../../helper/assets.js';

class EnemyAttackState {
    constructor(enemy) {
        this.enemy = enemy;
        this.attackCooldown = 1000;
        this.lastAttackTime = 0;
        this.damageAmount = 100;
        this.attackRange = 100;
    }

    enter() {
        this.enemy.setSprite(Assets.getSoldierNormalMeleeMelee());
        this.enemy.velocityX = 0;
    }

    update() {
        const now = Date.now();
        if (now - this.lastAttackTime >= this.attackCooldown) {
            const dx = this.enemy.target.x - this.enemy.x;
            const dy = this.enemy.target.y - this.enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= this.enemy.attackRange) {
                this.enemy.target.takeDamage(this.damageAmount);
                this.lastAttackTime = now;
            }
        }
    }

    exit() {}

    draw() {}
}

export default EnemyAttackState;
