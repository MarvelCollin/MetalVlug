import { ctx } from "../../ctx.js";
import Drawer from "../../helper/drawer.js";

class Renderer {
    constructor(entity, ctx) {
        this.entity = entity;
        this.ctx = ctx;
    }

    draw() {
        if (this.entity.currentSprite && this.entity.currentSprite.images) {
            const flip = this.entity.lastDirection === 'left';
            Drawer.drawToCanvas(
                this.entity.currentSprite.images,
                this.entity.x,
                this.entity.y,
                this.entity.currentSprite.delay,
                flip,
                this.entity.scale
            );
        }
    }
}

export default Renderer;