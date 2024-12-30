import PlayerState from './playerState.js';
import Drawer from '../../helper/drawer.js';
import Assets from '../../assets.js';
import { ctx } from '../../ctx.js';

class PlayerRunState extends PlayerState {
    async enter() {
        if (!this.runImages) {
            this.runImages = await Drawer.loadImage(Assets.getPlayerMarcoRun());
        }
    }

    handleInput(input) {
        if (input === 'idle') {
            this.player.setState(this.player.idleState);
        } else if (input === 'shoot') {
            this.player.setState(this.player.shootState);
            this.player.state.currentFrame = 0;
            this.player.state.frameTimer = Date.now();
        } else if (input === 'runLeft') {
            this.player.direction = 'left';
        } else if (input === 'runRight') {
            this.player.direction = 'right';
        }
    }

    update() {
        if (this.player.direction === 'left') {
            this.player.x -= this.player.speed;
        } else if (this.player.direction === 'right') {
            this.player.x += this.player.speed;
        }
    }

    draw() {
        if (this.runImages) {
            ctx.save();
            if (this.player.direction === 'left') {
                ctx.translate(this.player.x + this.runImages.images[0].width / 2, this.player.y);
                ctx.scale(-1, 1);
                ctx.translate(-(this.player.x + this.runImages.images[0].width / 2), -this.player.y);
            }
            Drawer.drawToCanvas(
                this.runImages.images,
                this.player.x,
                this.player.y,
                'run',
                this.runImages.delay
            );
            ctx.restore();
        }
    }
}

export default PlayerRunState;
