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

    this.jumpSpeed = 6;
    this.gravity = 7;
    this.terminalVelocity = 15;
    this.jumpForce = -10;

    this.collision = new Collision(this);
    this.renderer = new Renderer(this, ctx);
    this.stateManager = new StateManager(this);
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

  update(
    obstacles = defaultObstacles,
    leftPercentage = 0.5,
    rightPercentage = 0.3
  ) {
    this.collision.handleCollision(obstacles, leftPercentage, rightPercentage);
    this.stateManager.update();

    this.grounded = obstacles.some(obstacle => 
      this.checkCollision(this.x, this.y , obstacle)
    );
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
    this.currentSprite = await Drawer.loadImage(() => sprite);
  }
}

export default Entity;
