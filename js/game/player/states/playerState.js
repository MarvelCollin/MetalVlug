import Drawer from '../../helper/drawer.js';
import { DIRECTION } from '../../entities/components/actions.js';

class PlayerState {
    constructor(player) {
        this.player = player;
    }

    enter() {
        // To be implemented by subclasses
    }

    handleInput() {
        // To be implemented by subclasses
    }

    update() {
        // To be implemented by subclasses
    }

    draw() {
        if (this.player.currentSprite && this.player.currentSprite.images) {
            const flip = this.player.lastDirection === DIRECTION.LEFT;
            Drawer.drawToCanvas(
                this.player.currentSprite.images,
                this.player.x,
                this.player.y,
                this.player.currentSprite.delay,
                flip,
                this.player.scale,
                this.player.currentSprite.type,
                30
            );
        }
    }
}

export default PlayerState;
