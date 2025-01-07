import { Direction } from '../player/components/direction.js';
import { ctx, canvas, scaleX, scaleY } from "../ctx.js";
import { defaultObstacles } from "../world/obstacle.js";
import Movement from './components/movement.js';
import Collision from './components/collision.js';
import Renderer from './components/renderer.js';
import StateManager from './components/stateManager.js';

class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.direction = null;
        this.speed = 10;
        this.initialY = 0;
        this.grounded = true;
        this.lastUpdateTime = Date.now();

        this.scaleX = 5.5;
        this.scaleY = 5.5;

        this.gravity = 0.6;            
        this.terminalVelocity = 10;     
        this.jumpForce = -15;

        this.movement = new Movement(this);
        this.collision = new Collision(this);
        this.renderer = new Renderer(this, ctx);
        this.stateManager = new StateManager(this);
    }

    setDirection(direction) {
        this.movement.setDirection(direction);
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
        this.movement.update();
        this.collision.handleCollision(obstacles, leftPercentage, rightPercentage);
        this.stateManager.update();
    }

    draw() {
        this.renderer.draw();
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

export default Entity;
