import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { UI } from './ui.js';

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
        this.ui = null;
        this.achievementSystem = null; // Add achievement system reference
    }

    setWorldSize(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
        this.height = height; 
    }

    setTarget(target) {
        this.target = target;
        // Create UI with shared achievement system
        this.ui = new UI(target, this);
        this.achievementSystem = this.ui.achievementSystem; // Store reference to achievement system
    }

    follow() {
        this.x = this.target.x - this.width / 2;
        
        this.y = 0;

        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));

        if (this.ui) {
            this.ui.draw();
        }
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
