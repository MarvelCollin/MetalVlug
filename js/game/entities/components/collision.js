
class Collision {
    constructor(entity) {
        this.entity = entity;
    }

    checkCollision(nextX, nextY, obstacle) {
        return (
            nextX < obstacle.x + obstacle.width &&
            nextX + this.entity.width > obstacle.x &&
            nextY < obstacle.y + obstacle.height &&
            nextY + this.entity.height > obstacle.y
        );
    }

    handleCollision(obstacles, leftPercentage, rightPercentage) {
        let nextY = this.entity.y + this.entity.velocityY;
        let verticalCollision = false;

        for (const obstacle of obstacles) {
            const middleX = this.entity.x + this.entity.width / 2;
            if (this.checkCollision(middleX, nextY - this.entity.height * leftPercentage, obstacle) ||
                this.checkCollision(middleX, nextY + this.entity.height * rightPercentage, obstacle)) {
                
                if (this.entity.velocityY > 0) {
                    this.entity.y = obstacle.y - this.entity.height;
                    this.entity.velocityY = 0;
                    this.entity.grounded = true;
                    verticalCollision = true;
                } 
                else if (this.entity.velocityY < 0 && !obstacle.passable) {
                    this.entity.y = obstacle.y + obstacle.height;
                    this.entity.velocityY = 0;
                    verticalCollision = true;
                }
                if (verticalCollision) break;
            }
        }

        if (!verticalCollision) {
            this.entity.y = nextY;
            this.entity.grounded = false;
        }
    }
}

export default Collision;