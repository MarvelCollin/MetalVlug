import { ACTION } from "./actions.js";
import { drawDebugBorder } from "../../helper/debug.js";
import Drawer from "../../helper/drawer.js";

class Collision {
  constructor(entity) {
    this.entity = entity;
  }

  checkCollision(x, y, obstacle) {
    return (
      x < obstacle.x + obstacle.width &&
      x + this.entity.width > obstacle.x &&
      y < obstacle.y + obstacle.height * 2&&
      y > obstacle.y - obstacle.height
    );
  }

  handleCollision(obstacles) {
    let nextY = this.entity.y + this.entity.velocityY;
    let verticalCollision = false;

    for (const obstacle of obstacles) {
      if (this.checkCollision(this.entity.x, nextY, obstacle)) {
        switch (obstacle.type) {
          case "normal":
            if (this.entity.velocityY > 0) {
              this.entity.y = obstacle.y - this.entity.height;
              this.entity.velocityY = 0;
              this.entity.grounded = true;
              verticalCollision = true;
            } else if (this.entity.velocityY < 0 && !obstacle.passable) {
              this.entity.y = obstacle.y + obstacle.height;
              this.entity.velocityY = 0;
              verticalCollision = true;
            }
            break;
          case "wall":
            this.entity.velocityX = 0;
            verticalCollision = true;
            break;
          case "stair":
            const isTouchingLeftEdge = this.entity.x <= obstacle.x + 10;
            const isTouchingRightEdge = this.entity.x + this.entity.width >= obstacle.x + obstacle.width - 10;
            const isBelowObstacle = this.entity.y + this.entity.height <= obstacle.y;
            if ((isTouchingLeftEdge || isTouchingRightEdge) && isBelowObstacle) {
              this.entity.y -= this.entity.jumpSpeed; 
              this.entity.velocityY = this.entity.jumpForce;
              this.entity.grounded = false;
            } else {
              if (this.entity.velocityY > 0) {
                this.entity.y = obstacle.y - this.entity.height;
                this.entity.velocityY = 0;
                this.entity.grounded = true;
                verticalCollision = true;
              }
            }
            break;
          default:
            break;
        }
        if (verticalCollision) break;
      }
    }

    if (!verticalCollision) {
      this.entity.y = nextY;
      this.entity.grounded = false;
    }
  }

  isIntersecting(obstacle) {
    const bottomY = this.entity.y + this.entity.height - 10;
    return this.checkCollision(this.entity.x, bottomY, obstacle);
  }

  drawDebug(ctx, obstacles) {}
}

export default Collision;
