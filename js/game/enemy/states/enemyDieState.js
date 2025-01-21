import Assets from '../../helper/assets.js';

class EnemyDieState {
    constructor(enemy) {
        this.enemy = enemy;
    }

    enter() {
    }

    update() {
        if (this.enemy.currentFrame >= this.enemy.currentSprite.images.length - 1) {
            this.enemy.active = false; 
        }
    }

    exit() {
    }

    draw() {
    }
}

export default EnemyDieState;
[]