import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";
import Camera from "../../world/camera.js";

export class SilverSoldier extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.isFlipped = true;
        this.modal = document.getElementById('silverSoldierModal');
        this.loadSprites();
    }

    async loadSprites() {
        this.idleSprite = await Drawer.loadImage(() => 
            Assets.getPartnerSilversoldierIdle()
        );
        this.actionSprite = await Drawer.loadImage(() => 
            Assets.getPartnerSilversoldierAction()
        );
        this.currentSprite = this.idleSprite;
    }

    update(player) {
        super.update(player);
        this.currentSprite = this.isInteracting ? this.actionSprite : this.idleSprite;
    }

    updateMenuPosition() {
        if (!this.menu) return;
        
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width;
        
        const screenX = (this.x - this.camera.x) / scale + rect.left;
        const screenY = (this.y - 150) / scale + rect.top;

        this.menu.style.left = `${screenX}px`;
        this.menu.style.top = `${screenY}px`;
    }

    onInteract() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            
            const handleClick = (e) => {
                if (e.target.classList.contains('modal-button')) {
                    switch(e.target.textContent) {
                        case 'Start Mission':
                            window.location.href = './game.html';
                            break;
                        case 'Arcade':
                            window.location.href = './game.html';
                            break;
                        case 'Cancel':
                            this.modal.style.display = 'none';
                            break;
                    }
                } else if (e.target.classList.contains('modal-overlay')) {
                    this.modal.style.display = 'none';
                }
            };

            this.modal.onclick = handleClick;
        }
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

        super.draw();
        
        if (this.modal && this.modal.style.display === 'flex') {
            this.updateMenuPosition();
        }
    }
}
