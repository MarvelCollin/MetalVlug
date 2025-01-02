import { Direction } from './player/components/direction.js';
import { ctx, canvas, scaleX, scaleY } from "./ctx.js";
import { defaultObstacles } from "./world/obstacle.js";

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

        this.gravity = 0.6;            
        this.terminalVelocity = 10;     
        this.jumpForce = -15;
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

    checkCollision(nextX, nextY, obstacle) {
        return (
            nextX < obstacle.x + obstacle.width &&
            nextX + this.width > obstacle.x &&
            nextY < obstacle.y + obstacle.height &&
            nextY + this.height > obstacle.y
        );
    }

    update(obstacles = defaultObstacles, leftPercentage = 0.5, rightPercentage = 0.3) {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        if (this.state?.canMove) {
            this.x += this.velocityX;
        }

        if (!this.grounded) {
            this.velocityY = Math.min(this.velocityY + this.gravity, this.terminalVelocity);
        }

        let nextY = this.y + this.velocityY;
        let verticalCollision = false;

        for (const obstacle of obstacles) {
            const middleX = this.x + this.width / 2;
            if (this.checkCollision(middleX, nextY - this.height * leftPercentage, obstacle) ||
                this.checkCollision(middleX, nextY + this.height * rightPercentage, obstacle)) {
                
                if (this.velocityY > 0) {
                    this.y = obstacle.y - this.height;
                    this.velocityY = 0;
                    this.grounded = true;
                    verticalCollision = true;
                } 
                else if (this.velocityY < 0 && !obstacle.passable) {
                    this.y = obstacle.y + obstacle.height;
                    this.velocityY = 0;
                    verticalCollision = true;
                }
                if (verticalCollision) break;
            }
        }

        if (!verticalCollision) {
            this.y = nextY;
            this.grounded = false;
        }

        if (this.state) {
            this.state.update(deltaTime);
        }
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
