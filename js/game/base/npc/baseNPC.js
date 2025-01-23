import Drawer from "../../helper/drawer.js";
import { ctx } from "../../ctx.js";
import Assets from "../../helper/assets.js";

export class BaseNPC {
    constructor(x, y, camera, scale = 4) {
        this.x = x;
        this.y = y;
        this.camera = camera;
        this.scale = scale;
        this.currentSprite = null;
        this.idleSprite = null;
        this.actionSprite = null;  
        this.tradingSprite = null; 
        this.isInteracting = false;
        this.interactionDistance = 100;
        this.isFlipped = false; 
        this.popupText = "Press ENTER to interact";
        this.popupY = 0;
        this.popupActive = false;
        this.markSprite = null;
        this.loadMark();
    }

    async loadSprites() {
    }

    async loadMark() {
        this.markSprite = await Drawer.loadImage(() => 
            Assets.getWorldMark()
        );
    }

    isPlayerInRange(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.interactionDistance;
    }

    update(player) {
        this.isInteracting = this.isPlayerInRange(player);
        const interactionSprite = this.actionSprite || this.tradingSprite;
        this.currentSprite = this.isInteracting ? interactionSprite : this.idleSprite;
        
        this.popupActive = this.isInteracting;
        this.popupY = Math.sin(Date.now() / 500) * 5; 
    }

    draw() {
        
        if (this.markSprite?.images) {
            const markY = this.y - (this.currentSprite?.images[0]?.height * this.scale || 0) - 30;
            const markOffsetY = Math.sin(Date.now() / 500) * 5; 
            
            Drawer.drawToCanvas(
                this.markSprite.images,
                this.x + (this.currentSprite?.images[0]?.width * this.scale / 2 || 0) - 20, 
                markY + markOffsetY,
                this.markSprite.delay,
                false,
                2 
            );
        }

        if (this.currentSprite?.images) {
            Drawer.drawToCanvas(
                this.currentSprite.images,
                this.x,
                this.y,
                this.currentSprite.delay,
                this.isFlipped,
                this.scale
            );
        }

        if (this.popupActive) {
            ctx.save();
            
            
            const padding = 15;
            const fontSize = 18;
            ctx.font = `${fontSize}px 'Metal Slug Latino'`;
            const textWidth = ctx.measureText(this.popupText).width;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = 40;
            const boxX = this.x + (this.currentSprite?.images[0]?.width * this.scale / 2 || 0) - boxWidth / 2;
            const boxY = this.y - 80 + this.popupY;

            
            const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            gradient.addColorStop(1, 'rgba(20, 20, 20, 0.9)');
            
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 3;
            
            
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();

            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            
            ctx.fillStyle = '#FFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(this.popupText, boxX + boxWidth/2, boxY + boxHeight/2);
            
            const enterText = 'ENTER';
            const enterWidth = ctx.measureText(enterText).width;
            const startX = boxX + boxWidth/2 - textWidth/2;
            const enterX = startX + ctx.measureText('Press ').width;
            
            
            ctx.fillStyle = '#FFD700';
            ctx.fillText(enterText, enterX + enterWidth/2, boxY + boxHeight/2);
            
            ctx.restore();
        }
    }

    onInteract() {
        console.log("Interacting with NPC");
    }
}
