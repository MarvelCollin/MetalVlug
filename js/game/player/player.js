import PlayerIdleState from './playerIdleState.js';
import PlayerRunState from './playerRunState.js';
import PlayerShootState from './playerShootState.js';
import PlayerSpawnState from './playerSpawnState.js';

class Player {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.currentFrame = 0;
        this.frameDelay = 100;
        this.scaleFactor = 2;
        this.isIdle = true;
        this.isShooting = false;
        this.isSpawning = true;
        this.groundY = this.canvas.height - 50;
        this.x = 50;
        this.y = this.groundY;
        this.speed = 5;
        this.keys = {
            a: false,
            d: false,
            f: false
        };

        this.idleState = new PlayerIdleState();
        this.runState = new PlayerRunState();
        this.shootState = new PlayerShootState();
        this.spawnState = new PlayerSpawnState();
    }

    loadAssets(assets, callback) {
        const marco = assets.PLAYER.MARCO;
        this.totalImages = marco.IDLE.frames + marco.RUN.frames + marco.SHOOT.frames + marco.SPAWN.frames;

        this.idleState.loadFrames(marco.IDLE.path, marco.IDLE.frames, () => {
            this.runState.loadFrames(marco.RUN.path, marco.RUN.frames, () => {
                this.shootState.loadFrames(marco.SHOOT.path, marco.SHOOT.frames, () => {
                    this.spawnState.loadFrames(marco.SPAWN.path, marco.SPAWN.frames, callback);
                });
            });
        });
    }

    update() {
        let moving = false;
        if (this.keys.a) {
            this.x -= this.speed;
            moving = true;
        }
        if (this.keys.d) {
            this.x += this.speed;
            moving = true;
        }
        this.isIdle = !moving;

        if (this.keys.f && !this.isShooting && !this.isSpawning) { /
            this.isShooting = true;
            this.currentFrame = 0;
        }

        this.x = Math.max(0, Math.min(this.canvas.width - 50, this.x));

        this.currentFrame++;

        if (this.isSpawning) {
            if (this.currentFrame >= this.spawnState.spawnImages.length) {
                this.isSpawning = false;
                this.currentFrame = 0;
            }
        } else if (this.isShooting) {
            if (this.currentFrame >= this.shootState.shootImages.length) {
                this.isShooting = false;
                this.currentFrame = 0;
            }
        } else if (!this.isIdle && this.currentFrame >= this.runState.runImages.length) {
            this.currentFrame = 0;
        } else if (this.isIdle && this.currentFrame >= this.idleState.idleImages.length) {
            this.currentFrame = 0;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let img;
        if (this.isSpawning && this.spawnState.spawnImages.length > 0) {
            img = this.spawnState.spawnImages[this.currentFrame % this.spawnState.spawnImages.length];
        } else if (this.isShooting && this.shootState.shootImages.length > 0) {
            img = this.shootState.shootImages[this.currentFrame % this.shootState.shootImages.length];
        } else if (!this.isIdle && this.runState.runImages.length > 0) {
            img = this.runState.runImages[this.currentFrame % this.runState.runImages.length];
        } else if (this.isIdle && this.idleState.idleImages.length > 0) {
            img = this.idleState.idleImages[this.currentFrame % this.idleState.idleImages.length];
        }

        if (img && img.complete) {
            const drawX = this.x;
            const drawY = this.groundY - (img.height * this.scaleFactor);

            this.ctx.drawImage(img, drawX, drawY, img.width * this.scaleFactor, img.height * this.scaleFactor);
            
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(drawX, drawY, img.width * this.scaleFactor, img.height * this.scaleFactor);
        }
    }

    handleKeyDown(event) {
        if (event.key === 'a') this.keys.a = true;
        if (event.key === 'd') this.keys.d = true;
        if (event.key === 'f') this.keys.f = true;
    }

    handleKeyUp(event) {
        if (event.key === 'a') this.keys.a = false;
        if (event.key === 'd') this.keys.d = false;
        if (event.key === 'f') this.keys.f = false;
    }
}

export default Player;