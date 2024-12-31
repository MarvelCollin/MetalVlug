import { debugConfig } from "../helper/debug.js";
import { canvas } from "../ctx.js";

class Obstacle {
    constructor(x, y, width, height, targetX = x, targetY = y) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.startX = x;
        this.startY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 2;
        this.movingToTarget = true;
    }

    update() {
        if (this.startX !== this.targetX || this.startY !== this.targetY) {
            const targetPos = this.movingToTarget ? 
                { x: this.targetX, y: this.targetY } : 
                { x: this.startX, y: this.startY };
            
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
        if(debugConfig.enabled) {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
            ctx.fillRect(this.x, this.y - 100, this.width, this.height);  // Draw at y - 100
            
            if (this.startX !== this.targetX || this.startY !== this.targetY) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(this.startX + this.width/2, this.startY + this.height/2 - 100);  // Adjust line start
                ctx.lineTo(
                  this.targetX + this.width / 2,
                  this.targetY  + this.height / 2 - 100 
                );
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
    }
}

const obstacles = [
    
    new Obstacle(100, 500, 100, 20),   // Adjusted y=700 to y=500
    new Obstacle(100, 800, 100, 20),   // Adjusted y=700 to y=500
    new Obstacle(250, 400, 100, 20),
    
    // Middle platforms
    new Obstacle(400, 450, 100, 20),
    new Obstacle(550, 350, 100, 20),
    
    // Right side platforms
    new Obstacle(700, 400, 100, 20),
    new Obstacle(850, 300, 100, 20)
];

export { Obstacle, obstacles as defaultObstacles };
