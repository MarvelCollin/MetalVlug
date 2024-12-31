import { Direction } from './player/components/direction.js';
import { ctx, canvas, scaleX, scaleY } from "./ctx.js";

class Entities {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.direction = null;
        this.speed = 10;
        this.initialY = y;
        this.grounded = true;
        this.lastUpdateTime = Date.now();

        this.scaleX = 5.5;
        this.scaleY = 5.5;
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
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        if (this.state && this.state.canMove && !(this.state.constructor.name === 'PlayerSpawnState')) {
            this.velocityX = this.direction === Direction.LEFT ? -this.speed : 
                            this.direction === Direction.RIGHT ? this.speed : 0;
        }

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

        if (this.state) {
            this.state.update(deltaTime);
        }

        return !wouldCollide;
    }

    draw() {
        if (this.state) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scaleX, this.scaleY);
            ctx.translate(-this.x, -this.y);
            this.state.draw();
            ctx.restore();
        }
    }

    getScaleX() {
        return scaleX;
    }

    getScaleY() {
        return scaleY;
    }

    getPosition() {
        return { x: this.x, y: this.y, direction: this.direction };
    }
}

export default Entities;
