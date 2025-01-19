import Assets from "../../helper/assets.js";
import { ACTION } from "../../entities/components/actions.js";

class PlayerSpriteHandler {
    constructor(player) {
        this.player = player;
    }

    handleSprite(actions) {
        if (actions.has(ACTION.SPAWN)) {
            return Assets.getPlayerMarcoPistolSpawn();
        }

        if (!this.player.grounded) {
            if (actions.has(ACTION.FLOAT)) {
                return Assets.getPlayerMarcoPistolJumpIdle(); 
            }
            if (actions.has(ACTION.SHOOT) && actions.has(ACTION.JUMP)) {
                return Assets.getPlayerMarcoPistolJumpShoot();
            }
            if(actions.has(ACTION.SHOOT)){
                return Assets.getPlayerMarcoPistolJumpIdle();
            }
            if (actions.has(ACTION.JUMP)) {
                return Assets.getPlayerMarcoPistolJumpIdle();
            }
            if (this.player.velocityY > 0) {
                return Assets.getPlayerMarcoPistolJumpIdle();
            }
        }

        if (this.player.grounded) {
            if (actions.has(ACTION.SNEAK)) {
                if (actions.has(ACTION.SHOOT)) {
                    return Assets.getPlayerMarcoPistolSneakShoot();
                }
                if (actions.has(ACTION.MELEE)) {
                    return Assets.getPlayerMarcoPistolSneakMelee();
                }
                if (actions.has(ACTION.THROW)) {
                    return Assets.getPlayerMarcoPistolSneakThrow();
                }
                if (actions.has(ACTION.RUN)) {
                    return Assets.getPlayerMarcoPistolSneakMove();
                }
                return Assets.getPlayerMarcoPistolSneakIdle();
            }

            if (actions.has(ACTION.RUN)) {
                if (actions.has(ACTION.SHOOT)) {
                    return Assets.getPlayerMarcoPistolMoveShoot();
                }
                return Assets.getPlayerMarcoPistolStandRun();
            }

            if (actions.has(ACTION.SHOOT)) {
                return Assets.getPlayerMarcoPistolStandShoot();
            }

            if (actions.has(ACTION.MELEE)) {
                return Assets.getPlayerMarcoPistolStandMelee();
            }

            if (actions.has(ACTION.IDLE)) {
                if (this.player.idleTime > 5000 ) {
                    return Assets.getPlayerMarcoPistolStandIdleSleeping();
                } 
                return Assets.getPlayerMarcoPistolStandIdleNormal();
            }
        }

        return Assets.getPlayerMarcoPistolStandIdleNormal();
    }
}

export default PlayerSpriteHandler;
