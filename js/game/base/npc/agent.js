import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

export class Agent extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.isFlipped = false;
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
        console.log("Interacting with Agent");
    }
}
