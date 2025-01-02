
import { ctx } from "../../ctx.js";

class Renderer {
    constructor(entity, ctx) {
        this.entity = entity;
        this.ctx = ctx;
    }

    draw() {
        if (this.entity.state) {
            this.ctx.save();
            this.ctx.translate(this.entity.x, this.entity.y);
            this.ctx.scale(this.entity.scaleX, this.entity.scaleY);
            this.ctx.translate(-this.entity.x, -this.entity.y);
            this.entity.state.draw();
            this.ctx.restore();
        }
    }
}

export default Renderer;