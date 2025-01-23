import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

export class Agent extends BaseNPC {
    constructor(x, y, camera, achievementSystem) {
        super(x, y, camera, 4);
        this.isFlipped = false;
        this.achievementSystem = achievementSystem; 
        this.loadSprites();
    }

    async loadSprites() {
        this.idleSprite = await Drawer.loadImage(() => 
            Assets.getPartnerAgentIdle()
        );
        this.actionSprite = await Drawer.loadImage(() => 
            Assets.getPartnerAgentAction()
        );
        this.currentSprite = this.idleSprite;
    }

    onInteract() {
        this.achievementSystem.showModal();

        const modal = document.getElementById('achievementsModal');
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.achievementSystem.hideModal();
            }
        };
    }
}
