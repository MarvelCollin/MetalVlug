import Assets from '../../helper/assets.js';

class EnemyAttackState {
    constructor(enemy) {
        this.enemy = enemy;
        this.attackCooldown = 1000;
        this.lastAttackTime = 0;
        this.damageAmount = 10;
    }

    enter() {
        this.enemy.velocityX = 0;
    }

    update() {
        if (this.enemy.behavior && this.enemy.behavior.attack) {
            this.enemy.behavior.attack(this.enemy);
        }
    }

    exit() {}

    draw() {}
}

export default EnemyAttackState;
