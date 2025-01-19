import Assets from '../../helper/assets.js';

class EnemyIdleState {
    constructor(enemy) {
        this.enemy = enemy;
    }

    enter() {
        this.enemy.setSprite(Assets.getSoldierNormalIdle());
        this.enemy.velocityX = 0;
    }

    update() {
        // Add idle behavior if needed
    }

    exit() {
        // Cleanup if needed
    }

    draw() {
        // Drawing handled by entity renderer
    }
}

export default EnemyIdleState;
