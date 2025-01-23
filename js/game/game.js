import { ctx, canvas } from './ctx.js'; 
import Player from './player/player.js';
import PlayerInputHandler from './player/components/playerInputHandler.js';
import Camera from './world/camera.js';
import { debugConfig, logCursorPosition } from './helper/debug.js';
import Drawer from './helper/drawer.js';
import { Obstacle } from './world/obstacle.js';
import WebSocketClient from './server/websocket.js';
import EnemySpawner from './enemy/enemySpawner.js'; 
import Assets from './helper/assets.js';
import { PauseModal } from './modal/pauseModal.js';
import { gameObstacles } from './world/obstacles/gameObstacles.js';

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
        this.inventoryPaused = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.pauseModal.isVisible()) {
                    this.pauseModal.continue();
                } else {
                    this.pauseModal.show();
                }
            }
            if (e.key.toLowerCase() === 'e') {
                this.inventoryPaused = !this.inventoryPaused;
                if (this.inventoryPaused) {
                    this.pause();
                } else {
                    this.resume();
                }
            }
        });
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
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
        obstacles = [...gameObstacles];  
    }

    async startAnimation() {
        player = new Player(1000, 300);
        camera = new Camera(null);
        camera.setTarget(player); // Changed from camera.target = player
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

        const lastTime = timestamp - lastTimestamp;
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
            enemy.draw(obstacles);
            return true;
        });

        player.update(enemies);
        player.draw(obstacles);

        WebSocketClient.players.forEach(otherPlayer => {
            otherPlayer.draw(obstacles);
        });

        WebSocketClient.sendPlayerState(player);

        obstacles.forEach(obstacle => obstacle.draw(ctx));

        ctx.restore();

        // Add debug logging
        if (this.camera.ui) {
            console.log('Drawing UI...'); // Debug log
            this.camera.ui.draw();
        } else {
            console.log('No UI available'); // Debug log
        }

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
game.startAnimation();
};

export {     game, 
    gameState 
};