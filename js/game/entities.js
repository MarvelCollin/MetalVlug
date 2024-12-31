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
        // Check if the entity's next position collides with the obstacle
        return (
            nextX < obstacle.x + obstacle.width &&
            nextX + this.width > obstacle.x &&
            nextY < obstacle.y + obstacle.height &&
            nextY + this.height > obstacle.y
        );
    }

    update(obstacles = defaultObstacles) {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        if (!this.grounded) {
            this.velocityY = Math.min(this.velocityY + this.gravity, this.terminalVelocity);
        }

        let nextY = this.y + this.velocityY;
        let verticalCollision = false;

        // Check for vertical collisions
        for (const obstacle of obstacles) {
            if (this.checkCollision(this.x, nextY, obstacle)) {
                if (this.velocityY > 0) {  
                    // If falling, stop at the top of the obstacle
                    this.y = obstacle.y - this.height;
                    this.velocityY = 0;
                    this.grounded = true;
                } else if (this.velocityY < 0) { 
                    // If jumping, stop at the bottom of the obstacle
                    this.y = obstacle.y + obstacle.height;
                    this.velocityY = 0;
                }
                verticalCollision = true;
                break;
            }
        }

        if (!verticalCollision) {
            this.y = nextY;
            this.grounded = false;
        }

        if (this.state?.canMove && !(this.state.constructor.name === 'PlayerSpawnState')) {
            this.velocityX = this.direction === Direction.LEFT ? -this.speed : 
                            this.direction === Direction.RIGHT ? this.speed : 0;
            
            let nextX = this.x + this.velocityX;
            let horizontalCollision = false;

            // Check for horizontal collisions
            for (const obstacle of obstacles) {
                if (this.checkCollision(nextX, this.y, obstacle)) {
                    if (this.velocityX > 0) {  
                        // If moving right, stop at the left side of the obstacle
                        this.x = obstacle.x - this.width;
                    } else if (this.velocityX < 0) { 
                        // If moving left, stop at the right side of the obstacle
                        this.x = obstacle.x + obstacle.width;
                    }
                    this.velocityX = 0;
                    horizontalCollision = true;
                    break;
                }
            }

            if (!horizontalCollision) {
                this.x = nextX;
            }
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
