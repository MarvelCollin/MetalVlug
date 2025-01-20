import Assets from '../../helper/assets.js';

class EnemyIdleState {
    constructor(enemy) {
        this.enemy = enemy;
    }

    enter() {
        this.enemy.setSprite(Assets.getEnemySoldierNormalIdle());
        this.enemy.velocityX = 0;
    }

    update() {
    }

    exit() {
    }

    draw() {
    }
}

export default EnemyIdleState;
