import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

export class RumiAikawa extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.modal = document.getElementById('rumiAikawaModal');
        this.loadSprites();
    }

    async loadSprites() {
        this.idleSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRumiaikawaIdle()
        );
        this.tradingSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRumiaikawaTrading()
        );
        this.currentSprite = this.idleSprite;
    }

    onInteract() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            
            const handleClick = (e) => {
                if (e.target.classList.contains('modal-button')) {
                    switch(e.target.textContent) {
                        case 'Trade':
                            // Handle trade logic
                            break;
                        case 'Talk':
                            // Handle talk logic
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
}
