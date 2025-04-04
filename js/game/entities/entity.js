import { DIRECTION, ACTION } from "./components/actions.js";
import { ctx, canvas } from "../ctx.js";
import { Obstacle } from "../world/obstacle.js";
import { gameObstacles } from "../world/obstacles/gameObstacles.js";
import { baseObstacles } from "../world/obstacles/baseObstacles.js";
import Collision from "./components/collision.js";
import Renderer from "./components/renderer.js";
import StateManager from "./components/stateManager.js";
import Drawer from "../helper/drawer.js";
import { debugConfig } from "../helper/debug.js";

class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = this.height = height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.lastDirection = DIRECTION.RIGHT;

    this.speed = 8;
    this.grounded = true;
    this.lastUpdateTime = Date.now();
    this.currentSprite = null;
    this.actions = new Set();

    this.jumpSpeed = 18;
    this.gravity = 7;
    this.terminalVelocity = 30;
    this.jumpForce = -12;

    this.maxJumpHeight = 350;
    this.currentJumpHeight = 0;

    this.collision = new Collision(this);
    this.renderer = new Renderer(this, ctx);
    this.stateManager = new StateManager(this);
  }

  resetVelocity() {
    this.velocityX = 0;
  }

  update() {
    const obstacles = window.location.pathname.includes('base.html') ? 
        baseObstacles : gameObstacles;

    this.collision.handleCollision(obstacles);

    if(debugConfig.actionPlayer) {  
      console.log("Player actions: ", this.actions);  
    }
    
    this.stateManager.update();
    const wasGrounded = this.grounded;
    let checker = obstacles.some(obstacle => 
      this.collision.checkCollision(this.x, this.y, obstacle) 
    );

    if(checker && !this.actions.has(ACTION.JUMP)){
      this.grounded = true;
    }

    if (this.grounded && !wasGrounded) {
      this.currentJumpHeight = 0;
    }
  }

  draw(obstacles = gameObstacles) {
    this.renderer.draw();
    this.collision.drawDebug(ctx, obstacles);
  }

  getPosition() {
    return { x: this.x, y: this.y, direction: this.direction };
  }

  async setSprite(sprite) {
    try {
        this.currentSprite = await Drawer.loadImage(() => sprite);
    } catch (error) {
        console.error("Failed to load sprite:", error);
    }
  }

  isIntersectingWithObstacles(obstacles) {
    return obstacles.some(obstacle => this.collision.isIntersecting(obstacle));
  }
}

export default Entity;
