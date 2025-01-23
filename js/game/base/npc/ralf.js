import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

export class Ralf extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.isFlipped = false;
        this.loadSprites();
    }

    async loadSprites() {
        this.idleSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRalfIdle()
        );
        this.actionSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRalfAction()
        );
        this.currentSprite = this.idleSprite;
    }

    onInteract() {
        console.log("Interacting with Ralf");
    }
}
