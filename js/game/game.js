import { ctx, canvas } from './ctx.js'; 
import Player from './player/player.js';
import PlayerInputHandler from './player/components/playerInputHandler.js';
import Camera from './world/camera.js';
import { debugConfig, logCursorPosition } from './helper/debug.js';
import Drawer from './helper/drawer.js';
import { Obstacle, defaultObstacles } from './world/obstacle.js';
import WebSocketClient from './server/websocket.js';
import EnemySpawner from './enemy/enemySpawner.js'; 
import Assets from './helper/assets.js';
import { PauseModal } from './modal/pauseModal.js';

let player;
let camera;
let obstacles = [];
let enemies = [];
let enemySpawner;
let lastTimestamp = 0;

class Game {
    constructor() {
        this.pauseModal = new PauseModal(this);
        this.isPaused = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.pauseModal.isVisible()) {
                    this.pauseModal.continue();
                } else {
                    this.pauseModal.show();
                }
            }
        });
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        // Continue game loop
        this.gameLoop();
    }

    async loadBackground() {
        const background = await Drawer.loadImage(() =>
          Assets.getBackgroundArcade()
        );
        return new Promise((resolve, reject) => {
            if (background && background.images && background.images[0]) {
                const img = background.images[0];
                const aspectRatio = img.width / img.height;
                const scaledWidth = canvas.height * aspectRatio;
                
                camera.setWorldSize(scaledWidth, canvas.height);
                resolve({ width: scaledWidth, height: canvas.height, background });
            } else {
                reject(new Error('Failed to load background'));
            }
        });
    }

    initializeObstacles() {
        obstacles = [...defaultObstacles];  
    }

    async startAnimation() {
        player = new Player(100, 300);
        camera = new Camera(player);
        enemySpawner = new EnemySpawner(); 
        this.initializeObstacles();
        const bgData = await this.loadBackground();
        gameState.background = bgData.background;
        canvas.addEventListener('mousemove', logCursorPosition);
        WebSocketClient.connect();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        if (this.isPaused) return;

        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        camera.follow();
        const viewport = camera.getViewport();

        ctx.save();
        ctx.translate(-viewport.x, -viewport.y);

        if (gameState.background) {
            const img = gameState.background.images[0];
            const aspectRatio = img.width / img.height;
            const scaledWidth = canvas.height * aspectRatio;
            
            Drawer.drawBackground(
                img,
                0,
                canvas.height,
                scaledWidth,
                canvas.height
            );
        }

        const newEnemies = enemySpawner.update();
        enemies.push(...newEnemies);

        enemies = enemies.filter(enemy => {
            if (enemy.health <= 0) {
                return false;
            }
            enemy.update(player);
            enemy.draw();
            return true;
        });

        player.update(enemies);
        player.draw();

        WebSocketClient.players.forEach(otherPlayer => {
            otherPlayer.draw();
        });

        WebSocketClient.sendPlayerState(player);

        obstacles.forEach(obstacle => obstacle.draw(ctx));

        ctx.restore();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    getPlayerPosition() {
        return player ? player.getPosition() : null;
    }
}

const gameState = {
    background: null
};

const game = new Game();
game.startAnimation();

export {     game, 
    gameState 
};