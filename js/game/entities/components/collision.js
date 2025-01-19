import { ACTION } from "./actions.js";
import { debugConfig } from "../../helper/debug.js";
import Drawer from "../../helper/drawer.js";

class Collision {
  constructor(entity) {
    this.entity = entity;
  }

  checkCollision(x, y, obstacle) {
    return (
      x < obstacle.x + obstacle.width &&
      x + this.entity.width > obstacle.x &&
      y < obstacle.y + obstacle.height &&
      y > obstacle.y
    );
  }

  isOnStairs(obstacle) {
    const entityBottom = this.entity.y;
    const obstacleTop = obstacle.y - obstacle.height;
    return Math.abs(entityBottom - obstacleTop) < 20;
  }

  calculateStairHeight(obstacle, playerX) {
    const progressX = playerX - obstacle.x;
    const slope = obstacle.height / obstacle.width;
    
    if (obstacle.type === "reverseStair") {
      return obstacle.y + (progressX * slope);
    } else {
      return obstacle.y + obstacle.height - (progressX * slope);
    }
  }

  handleCollision(obstacles) {
    let nextY = this.entity.y + this.entity.velocityY;
    let verticalCollision = false;
    let checker = false;

    for (const obstacle of obstacles) {
      if (this.checkCollision(this.entity.x, nextY, obstacle)) {
        switch (obstacle.type) {
          case "normal":
            checker = true;
            if (this.entity.velocityY > 0) {
              this.entity.y = obstacle.y - this.entity.height;
              this.entity.velocityY = 0;
              if (!this.entity.actions.has(ACTION.JUMP)) {
                this.entity.grounded = true;
              }
              verticalCollision = true;
            } else if (this.entity.velocityY < 0 && !obstacle.passable) {
              this.entity.y = obstacle.y + obstacle.height;
              this.entity.velocityY = 0;
              verticalCollision = true;
            }
            break;
          case "wall":
            checker = true;
            this.entity.velocityX = 0;
            verticalCollision = true;
            break;
          case "stair":
          case "reverseStair":
            const targetY = this.calculateStairHeight(obstacle, this.entity.x);
            if (this.entity.y > targetY - this.entity.height && !this.entity.actions.has(ACTION.JUMP)) {
              if(this.entity.y > targetY){
                this.entity.y = targetY;
              }
              this.entity.velocityY = 0;
              this.entity.grounded = true;
              verticalCollision = true;
            }
            break;
        }
        if (verticalCollision) break;
      }
    }

    if (!verticalCollision) {
      this.entity.y = nextY;
      this.entity.grounded = false;
    }

    if (checker && !this.entity.actions.has(ACTION.JUMP)) {
      this.entity.grounded = true;
    }
  }

  isIntersecting(obstacle) {
    const bottomY = this.entity.y + this.entity.height - 10;
    return this.checkCollision(this.entity.x, bottomY, obstacle);
  }

  drawDebug(ctx, obstacles) {
    if (!debugConfig.collisionDetail) return;

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.entity.x,
      this.entity.y - this.entity.height,
      this.entity.width,
      this.entity.height
    );

    const nextY = this.entity.y + this.entity.velocityY;
    ctx.strokeStyle = "rgba(255, 165, 0, 0.5)";
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      this.entity.x,
      nextY - this.entity.height,
      this.entity.width,
      this.entity.height
    );
    ctx.setLineDash([]);

    obstacles.forEach((obstacle) => {
      if (this.checkCollision(this.entity.x, nextY, obstacle)) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        if (obstacle.type === "stair" || obstacle.type === "reverseStair") {
          const targetY = this.calculateStairHeight(obstacle, this.entity.x);
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
          if (obstacle.type === "reverseStair") {
            ctx.moveTo(obstacle.x, obstacle.y);
            ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
          } else {
            ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
            ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
          }
          ctx.stroke();

          ctx.fillStyle = "cyan";
          ctx.beginPath();
          ctx.arc(this.entity.x, targetY, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(`Type: ${obstacle.type}`, obstacle.x, obstacle.y - 20);
        ctx.fillText(
          `Grounded: ${this.entity.grounded}`,
          obstacle.x,
          obstacle.y - 5
        );
      }
    });
  }
}

export default Collision;
