import Assets from '../../helper/assets.js';

class EnemyDieState {
    constructor(enemy) {
        this.enemy = enemy;
    }

    enter() {
        this.enemy.setSprite(Assets.getSoldierNormalDie());
    }

    update() {
        // Handle death animation completion
        if (this.enemy.currentFrame >= this.enemy.currentSprite.images.length - 1) {
            this.enemy.active = false; // Mark for removal
        }
    }

    exit() {
        // Cleanup if needed
    }

    draw() {
        // Drawing handled by entity renderer
    }
}

export default EnemyDieState;
