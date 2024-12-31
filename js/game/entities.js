import { Direction } from './player/components/direction.js';

class Entities {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Add common properties
        this.direction = null;
        this.speed = 10;
        this.initialY = y;
        this.grounded = true;
        this.lastUpdateTime = Date.now();
    }

    setDirection(direction) {
        this.direction = direction;
        this.velocityX = direction === Direction.LEFT ? -this.speed : 
                        direction === Direction.RIGHT ? this.speed : 0;
    }

    resetVelocity() {
        this.velocityX = 0;
        this.velocityY = 0;
    }

    checkCollision(obstacle) {
        return (
            this.x < obstacle.x + obstacle.width &&
            this.x + this.width > obstacle.x &&
            this.y < obstacle.y + obstacle.height &&
            this.y + this.height > obstacle.y
        );
    }

    isColliding(obstacles) {
        return obstacles.some(obstacle => this.checkCollision(obstacle));
    }

    update(obstacles) {
        const nextX = this.x + this.velocityX;
        const nextY = this.y + this.velocityY;

        const testPosition = {
            x: nextX,
            y: nextY,
            width: this.width,
            height: this.height
        };

        const wouldCollide = obstacles.some(obstacle => 
            this.checkCollision.call(testPosition, obstacle)
        );

        if (!wouldCollide) {
            this.x = nextX;
            this.y = nextY;
        }

        return !wouldCollide;
    }

    getPosition() {
        return { x: this.x, y: this.y, direction: this.direction };
    }
}

export default Entities;
