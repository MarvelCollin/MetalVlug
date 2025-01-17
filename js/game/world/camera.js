import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export const VIEWPORT_WIDTH = GAME_WIDTH;
export const VIEWPORT_HEIGHT = GAME_HEIGHT;

class Camera {
    constructor(target) {
        this.x = 0;
        this.y = 0;
        this.target = target;
        this.width = VIEWPORT_WIDTH;
        this.height = VIEWPORT_HEIGHT;
        this.worldWidth = 0;
        this.worldHeight = 0;
    }

    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
        this.height = height; 
    }

    follow() {
        this.x = this.target.x - this.width / 2;
        
        this.y = 0;

        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
    }

    getViewport() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

export default Camera;
