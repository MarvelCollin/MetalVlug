import { debugConfig } from "../helper/debug.js";
import { canvas } from "../ctx.js";

export class Obstacle {
  constructor(
    x,
    y,
    width,
    height,
    type = "normal",
    targetX = x,
    targetY = y,
    passable = true
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.passable = passable;

    this.startX = x;
    this.startY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 2;
    this.movingToTarget = true;
  }

  update() {
    if (this.startX !== this.targetX || this.startY !== this.targetY) {
      const targetPos = this.movingToTarget
        ? { x: this.targetX, y: this.targetY }
        : { x: this.startX, y: this.startY };

      const dx = targetPos.x - this.x;
      const dy = targetPos.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.speed) {
        this.movingToTarget = !this.movingToTarget;
      } else {
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        this.x += normalizedDx * this.speed;
        this.y += normalizedDy * this.speed;
      }
    }
  }

  draw(ctx) {
    if (debugConfig.collisionDetail) {
      switch (this.type) {
        case "normal":
          ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
          break;
        case "wall":
          ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          break;
        case "stair":
          ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
          break;
        case "reverseStair":
          ctx.fillStyle = "rgba(255, 0, 255, 0.5)"; 
          break;
        default:
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          break;  
      }
      ctx.fillRect(this.x, this.y , this.width, this.height);
    }
  }
}
