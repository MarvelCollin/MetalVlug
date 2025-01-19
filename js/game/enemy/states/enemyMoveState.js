import Assets from '../../helper/assets.js';
import { DIRECTION } from '../../entities/components/actions.js';

class EnemyMoveState {
    constructor(enemy) {
        this.enemy = enemy;
        this.moveSpeed = 2;
        this.currentFrame = 0;
        this.frameDelay = 100;
        this.lastFrameTime = 0;
    }

    enter() {
        this.enemy.setSprite(Assets.getSoldierNormalRun());
        this.currentFrame = 0;
        this.lastFrameTime = Date.now();
    }

    update() {
        const now = Date.now();
        if (now - this.lastFrameTime > this.frameDelay) {
            this.currentFrame++;
            this.lastFrameTime = now;
        }

        if (this.enemy.currentSprite && this.enemy.currentSprite.images) {
            if (this.currentFrame >= this.enemy.currentSprite.images.length) {
                this.currentFrame = 0;
            }
        }

        // Handle ground movement
        if (this.enemy.grounded) {
            this.enemy.velocityX = this.enemy.lastDirection === DIRECTION.LEFT ? 
                -this.enemy.speed : this.enemy.speed;
        }
    }

    exit() {
        this.enemy.velocityX = 0;
        this.currentFrame = 0;
    }

    draw() {
        // Drawing is handled by entity renderer
    }
}

export default EnemyMoveState;
