import Drawer from '../../helper/drawer.js';
import { ctx } from '../../ctx.js';

class Bullet {
    constructor(x, y, direction, assets) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 15;
        this.assets = assets;
        this.active = true;
        this.scale = 2; 
    }

    update() {
        console.log(this.direction)
        if (this.direction === 'right') {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }
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
