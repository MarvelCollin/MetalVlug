import Drawer from '../../helper/drawer.js';
import { ctx } from '../../ctx.js';

class Bullet {
    constructor(x, y, direction, assets) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 40;
        this.assets = assets;
        this.active = true;
        this.scale = 0.2; 
        this.maxTravelDistance = 6000; 
        this.initialX = x;  
    }

    update() {
        if (this.direction === 'right') {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }

        // Deactivate bullet based on travel distance
        const distanceTraveled = Math.abs(this.x - this.initialX);
        if (distanceTraveled > this.maxTravelDistance) {
            this.active = false;
        }
    }

    checkCollision(enemy) {
        return (
            this.x < enemy.x + enemy.width &&
            this.x + 20 > enemy.x &&
            this.y < enemy.y &&
            this.y + 20 > enemy.y - enemy.height
        );
    }

    draw() {
        if (this.active && this.assets) {
            const bulletImage = this.assets.images[0];
            if (bulletImage && bulletImage.complete) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(this.scale, this.scale);
                ctx.translate(-this.x, -this.y);
                
                Drawer.drawToCanvas(
                    this.assets.images,
                    this.x,
                    this.y,
                    'bullet',
                    this.assets.delay,
                    bulletImage.width,
                    bulletImage.height,
                    this.direction === 'LEFT'
                );
                
                ctx.restore();
            }
        }
    }
}

export default Bullet;
