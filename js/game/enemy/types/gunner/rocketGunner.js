import Drawer from '../../../helper/drawer.js';
import { ctx } from '../../../ctx.js';
import { debugConfig } from '../../../helper/debug.js';

class RocketGunner {
    constructor(x, y, direction, sprite, damage = 10, speed = 15, target = null, isHoming = false) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.direction = direction;
        this.sprite = null;
        this.damage = damage;
        this.speed = speed;
        this.active = true;
        this.scale = 2;
        this.loadSprite(sprite);
        this.target = target;
        this.isHoming = isHoming;
        this.homingStrength = 0.7;
        this.velocityX = this.speed * direction;
        this.velocityY = 0;
        this.maxSpeed = speed;
        this.homingDuration = 2000; 
        this.creationTime = Date.now();
        this.fixedDirection = null;
    }

    async loadSprite(spritePromise) {
        try {
            this.sprite = await Drawer.loadImage(() => spritePromise);
        } catch (error) {
            console.error("Failed to load bullet sprite:", error);
        }
    }

    update() {
        const currentTime = Date.now();
        const isHomingExpired = currentTime - this.creationTime > this.homingDuration;

        if (this.isHoming && this.target && !isHomingExpired) {
            // kalkulasi ke player
            const dx = this.target.x - this.x;
            const dy = (this.target.y - this.target.height/2) - this.y;
            const angle = Math.atan2(dy, dx);

            // peluru ke player
            this.velocityX += Math.cos(angle) * this.homingStrength;
            this.velocityY += Math.sin(angle) * this.homingStrength;

            // atur kecepatan
            const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            if (currentSpeed > this.maxSpeed) {
                this.velocityX = (this.velocityX / currentSpeed) * this.maxSpeed;
                this.velocityY = (this.velocityY / currentSpeed) * this.maxSpeed;
            }

            // check stop kejar
            if (currentTime - this.creationTime >= this.homingDuration) {
                this.fixedDirection = {
                    x: this.velocityX / currentSpeed,
                    y: this.velocityY / currentSpeed
                };
            }

            this.x += this.velocityX;
            this.y += this.velocityY;
        } else {
            if (this.fixedDirection) {
                this.x += this.fixedDirection.x * this.maxSpeed;
                this.y += this.fixedDirection.y * this.maxSpeed;
            } else {
                this.x += this.speed * this.direction;
            }
        }
    }

    draw() {
        if (this.sprite?.images && this.active) {
            let rotation = 0;
            if (this.fixedDirection) {
                rotation = Math.atan2(this.fixedDirection.y, this.fixedDirection.x);
            } else if (this.isHoming) {
                rotation = Math.atan2(this.velocityY, this.velocityX);
            }

            ctx.save();
            if (this.isHoming || this.fixedDirection) {
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(rotation);
                ctx.translate(-this.width/2, -this.height/2);
                Drawer.drawLoop(
                    this.sprite.images,
                    0,
                    0,
                    this.sprite.delay || 100,
                    9,
                    12,
                    false,
                    this.scale
                );
            } else {
                Drawer.drawLoop(
                    this.sprite.images,
                    this.x,
                    this.y,
                    this.sprite.delay || 100,
                    9,
                    12,
                    this.direction === -1,
                    this.scale
                );
            }
            ctx.restore();

            if (debugConfig.rocketGunner) {
                ctx.save();
                
                if (this.target) {
                    const pulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5; 
                    ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + pulse * 0.4})`;
                    ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + pulse * 0.1})`;
                    
                    ctx.beginPath();
                    ctx.arc(
                        this.target.x + this.target.width/2,
                        this.target.y - this.target.height/2,
                        50,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.stroke();

                    const crosshairSize = 20;
                    const targetX = this.target.x + this.target.width/2;
                    const targetY = this.target.y - this.target.height/2;
                    
                    ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 + pulse * 0.5})`;
                    ctx.beginPath();
                    ctx.moveTo(targetX - crosshairSize, targetY);
                    ctx.lineTo(targetX + crosshairSize, targetY);
                    ctx.moveTo(targetX, targetY - crosshairSize);
                    ctx.lineTo(targetX, targetY + crosshairSize);
                    ctx.stroke();
                }

                if (this.isHoming && this.target && !this.fixedDirection) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                    ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
                    ctx.lineTo(this.target.x, this.target.y - this.target.height/2);
                    ctx.stroke();
                }

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
                ctx.lineTo(
                    this.x + this.width/2 + this.velocityX * 3,
                    this.y + this.height/2 + this.velocityY * 3
                );
                ctx.stroke();

                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.fillText(`Homing: ${!this.fixedDirection}`, this.x, this.y - 20);
                ctx.fillText(`Speed: ${Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY).toFixed(2)}`, this.x, this.y - 10);
                
                if (this.isHoming && this.target && !this.fixedDirection) {
                    ctx.strokeStyle = 'yellow';
                    ctx.strokeRect(
                        this.target.x,
                        this.target.y - this.target.height,
                        this.target.width,
                        this.target.height
                    );
                }

                ctx.strokeStyle = 'cyan';
                ctx.strokeRect(this.x, this.y, this.width, this.height);

                ctx.restore();
            }
        }
    }

    hasHitTarget(target) {
        return this.active && 
               this.x < target.x + target.width &&
               this.x + this.width > target.x &&
               this.y < target.y &&
               this.y + this.height > target.y - target.height;
    }
}

export default RocketGunner;
