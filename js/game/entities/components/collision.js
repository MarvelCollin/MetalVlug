import { ACTION } from "./actions.js";
import { drawDebugBorder } from "../../helper/debug.js";

class Collision {
  constructor(entity) {
    this.entity = entity;
  }

  checkCollision(nextX, nextY, obstacle) {
    if (this.entity.actions.has(ACTION.JUMP) && this.entity.velocityY < 0) {
      console.log("Ignoring collision while jumping upwards");
      return false;
    }

    let result =
      nextX < obstacle.x + obstacle.width &&
      nextX + this.entity.width > obstacle.x &&
      nextY < obstacle.y + obstacle.height &&
      nextY + this.entity.height > obstacle.y;

    console.log(
      `Checking collision: nextX=${nextX}, nextY=${nextY}, obstacleX=${obstacle.x}, obstacleY=${obstacle.y}, result=${result}`
    );
    return result;
  }

  handleCollision(obstacles, leftPercentage, rightPercentage) {
    let nextY = this.entity.y + this.entity.velocityY;
    let verticalCollision = false;

    for (const obstacle of obstacles) {
      const middleX = this.entity.x + this.entity.width / 2;
      const bottomY = this.entity.y + this.entity.height - 10; // Adjust the bottomY to be higher
      if (
        this.checkCollision(
          middleX,
          bottomY - this.entity.height * leftPercentage,
          obstacle
        ) ||
        this.checkCollision(
          middleX,
          bottomY + this.entity.height * rightPercentage,
          obstacle
        )
      ) {
        if (this.entity.velocityY > 0) {
          console.log("Collision detected while moving downwards");
          this.entity.y = obstacle.y - this.entity.height;
          this.entity.velocityY = 0;
          this.entity.grounded = true;
          verticalCollision = true;
        } else if (this.entity.velocityY < 0 && !obstacle.passable) {
          console.log("Collision detected while moving upwards");
          this.entity.y = obstacle.y + obstacle.height;
          this.entity.velocityY = 0;
          verticalCollision = true;
        }
        if (verticalCollision) break;
      }
    }

    if (!verticalCollision) {
      console.log("No vertical collision detected");
      this.entity.y = nextY;
      this.entity.grounded = false;
    }
  }

  isIntersecting(obstacle) {
    const bottomY = this.entity.y + this.entity.height - 10; // Adjust the bottomY to be higher
    return this.checkCollision(this.entity.x, bottomY, obstacle);
  }

  drawDebug(ctx, obstacles) {
    const bottomY = this.entity.y + this.entity.height - 10; // Adjust the bottomY to be higher
    drawDebugBorder(ctx, this.entity.x, bottomY, this.entity.width, 1);

    obstacles.forEach(obstacle => {
      const isIntersecting = this.isIntersecting(obstacle);
      ctx.fillStyle = isIntersecting ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  }
}

export default Collision;
