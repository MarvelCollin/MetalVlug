
import { Direction } from '../../player/components/direction.js';

class Movement {
    constructor(entity) {
        this.entity = entity;
    }

    setDirection(direction) {
        this.entity.direction = direction;
        this.entity.velocityX = direction === Direction.LEFT ? -this.entity.speed : 
                                direction === Direction.RIGHT ? this.entity.speed : 0;
    }

    update() {
        if (this.entity.state?.canMove) {
            this.entity.x += this.entity.velocityX;
        }

        if (!this.entity.grounded) {
            this.entity.velocityY = Math.min(this.entity.velocityY + this.entity.gravity, this.entity.terminalVelocity);
        }
    }
}

export default Movement;