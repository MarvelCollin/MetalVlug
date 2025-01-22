import Drawer from "../../helper/drawer.js";
import { ctx } from "../../ctx.js";

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
    }

    async loadSprites() {
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
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.font = '16px Arial';
            
            const textWidth = ctx.measureText(this.popupText).width;
            const padding = 10;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = 30;
            const boxX = this.x + (this.currentSprite?.images[0]?.width * this.scale / 2 || 0) - boxWidth / 2;
            const boxY = this.y - 60 + this.popupY;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.popupText, boxX + boxWidth/2, boxY + boxHeight/2);
            
            ctx.restore();
        }
    }

    onInteract() {
        console.log("Interacting with NPC");
    }
}
