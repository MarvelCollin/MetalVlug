import { DIRECTION } from "./components/actions.js";
import { ctx, canvas, scaleX, scaleY } from "../ctx.js";
import { defaultObstacles } from "../world/obstacle.js";
import Collision from "./components/collision.js";
import Renderer from "./components/renderer.js";
import StateManager from "./components/stateManager.js";
import Drawer from "../helper/drawer.js";

class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = this.height = height;
    this.velocityX = 0;
    this.velocityY = 0;

    this.direction = DIRECTION.RIGHT;
    this.speed = 8;
    this.grounded = true;
    this.lastUpdateTime = Date.now();
    this.currentSprite = null;
    this.scaleX = 5.5;
    this.scaleY = 5.5;

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
    this.velocityY = 0;
  }

  update(
    obstacles = defaultObstacles,
    leftPercentage = 0.2, 
    rightPercentage = 0.2 
  ) {
    this.collision.handleCollision(obstacles, leftPercentage, rightPercentage);
    this.stateManager.update();

    const wasGrounded = this.grounded;
    this.grounded = obstacles.some(obstacle => 
      this.collision.checkCollision(this.x, this.y, obstacle) 
    );
    console.log(this.grounded);

    if (this.grounded && !wasGrounded) {
      this.currentJumpHeight = 0;
    }
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

  async setSprite(sprite) {
    try {
        this.currentSprite = await Drawer.loadImage(() => sprite);
    } catch (error) {
        console.error("Failed to load sprite:", error);
    }
  }
}

export default Entity;
