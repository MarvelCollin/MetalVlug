import Assets from "../../helper/assets.js";
import { ACTION } from "../../entities/components/actions.js";

class PlayerSpriteHandler {
    constructor(player) {
        this.player = player;
    }

    handleSprite(actions) {
        // Spawn state has highest priority
        if (actions.has(ACTION.SPAWN)) {
            return Assets.getPlayerMarcoPistolSpawn();
        }

        // Air state checks
        if (!this.player.grounded) {
            if (actions.has(ACTION.SHOOT) && actions.has(ACTION.JUMP)) {
                return Assets.getPlayerMarcoPistolJumpShoot();
            }
            if (actions.has(ACTION.JUMP)) {
                return Assets.getPlayerMarcoPistolJumpIdle();
            }
            // Falling state
            if (this.player.velocityY > 0) {
                return Assets.getPlayerMarcoPistolJumpIdle();
            }
        }

        // Ground state checks
        if (this.player.grounded) {
            // Sneak combinations
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

            // Standing combinations
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

            // Idle variations
            if (actions.has(ACTION.IDLE)) {
                if (this.player.idleTime > 5000) { // 5 seconds idle
                    return Assets.getPlayerMarcoPistolStandIdleSleep();
                }
                return Assets.getPlayerMarcoPistolStandIdleNormal();
            }
        }

        return Assets.getPlayerMarcoPistolStandIdleNormal();
    }
}

export default PlayerSpriteHandler;
