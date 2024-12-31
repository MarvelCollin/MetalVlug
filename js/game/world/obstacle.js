import { debugConfig } from "../helper/debug.js";
import { canvas } from "../ctx.js";

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        if(debugConfig.enabled) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

const obstacles = [
    new Obstacle(300, 400, 100, 20),  
    new Obstacle(500, 300, 100, 20),   
    new Obstacle(700, 250, 100, 20),   
    new Obstacle(0, canvas.height - 10, canvas.width, 10) 
];

export { Obstacle, obstacles as defaultObstacles };
