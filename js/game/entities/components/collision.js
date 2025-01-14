class Collision {
    constructor(entity) {
        this.entity = entity;
    }

    checkCollision(nextX, nextY, obstacle) {
        let result =
          nextX < obstacle.x + obstacle.width &&
          nextX + this.entity.width > obstacle.x &&
          nextY < obstacle.y + obstacle.height &&
          nextY + this.entity.height > obstacle.y;
        //   console.log(result);
        return (
            result
        );
    }

    handleCollision(obstacles, leftPercentage, rightPercentage) {
        let nextY = this.entity.y + this.entity.velocityY;
        let verticalCollision = false;

        for (const obstacle of obstacles) {
            const middleX = this.entity.x + this.entity.width / 2;
            if (
                this.checkCollision(
                    middleX,
                    nextY - this.entity.height * 0.2, 
                    obstacle
                ) ||
                this.checkCollision(
                    middleX,
                    nextY + this.entity.height * 0.2, 
                    obstacle
                )
            ) {
                if (this.entity.velocityY > 0) {
                    if (this.checkCollision(this.entity.x, nextY, obstacle)) {
                        this.entity.y = obstacle.y - this.entity.height;
                        this.entity.velocityY = 0;
                        this.entity.grounded = true;
                        verticalCollision = true;
                        break;
                    }
                } else if (this.entity.velocityY < 0 && !obstacle.passable) {
                    this.entity.y = obstacle.y + obstacle.height;
                    this.entity.velocityY = 0;
                    verticalCollision = true;
                    break;
                }
            }
        }

        if (!verticalCollision) {
            this.entity.y = nextY;
            this.entity.grounded = false;
        }
    }
}

export default Collision;