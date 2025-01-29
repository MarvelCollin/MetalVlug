
export class Assets {
    static instance = null;
    static assets = null;

    constructor() {
        if (Assets.instance) {
            return Assets.instance;
        }
        Assets.instance = this;
    }

    async fetchAssets() {
        if (Assets.assets) {
            return Assets.assets;
        }
        const response = await fetch('../assets/assets.json');
        if (!response.ok) {
            throw new Error('Waduh error nih: ' + response.statusText);
        }
        Assets.assets = await response.json();
        return Assets.assets;
    }

        async getBackgroundArcade() {
            try {
                const assets = await this.fetchAssets();
                return assets.BACKGROUND.ARCADE;
            } catch (error) {
                console.error('Error in getBackgroundArcade:', error);
                return null;
            }
        }

        async getBackgroundBase() {
            try {
                const assets = await this.fetchAssets();
                return assets.BACKGROUND.BASE;
            } catch (error) {
                console.error('Error in getBackgroundBase:', error);
                return null;
            }
        }

        async getBackgroundMap() {
            try {
                const assets = await this.fetchAssets();
                return assets.BACKGROUND.MAP;
            } catch (error) {
                console.error('Error in getBackgroundMap:', error);
                return null;
            }
        }

        async getBackgroundMission() {
            try {
                const assets = await this.fetchAssets();
                return assets.BACKGROUND.MISSION;
            } catch (error) {
                console.error('Error in getBackgroundMission:', error);
                return null;
            }
        }

        async getEnemyGunnerBullet() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.GUNNER.BULLET;
            } catch (error) {
                console.error('Error in getEnemyGunnerBullet:', error);
                return null;
            }
        }

        async getEnemyGunnerDie() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.GUNNER.DIE;
            } catch (error) {
                console.error('Error in getEnemyGunnerDie:', error);
                return null;
            }
        }

        async getEnemyGunnerIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.GUNNER.IDLE;
            } catch (error) {
                console.error('Error in getEnemyGunnerIdle:', error);
                return null;
            }
        }

        async getEnemyGunnerMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.GUNNER.MOVE;
            } catch (error) {
                console.error('Error in getEnemyGunnerMove:', error);
                return null;
            }
        }

        async getEnemyGunnerShootDiagonal() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.GUNNER.SHOOT.DIAGONAL;
            } catch (error) {
                console.error('Error in getEnemyGunnerShootDiagonal:', error);
                return null;
            }
        }

        async getEnemyGunnerShootHorizontal() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.GUNNER.SHOOT.HORIZONTAL;
            } catch (error) {
                console.error('Error in getEnemyGunnerShootHorizontal:', error);
                return null;
            }
        }

        async getEnemySoldierBazookaBullet() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.BAZOOKA.BULLET;
            } catch (error) {
                console.error('Error in getEnemySoldierBazookaBullet:', error);
                return null;
            }
        }

        async getEnemySoldierBazookaDie() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.BAZOOKA.DIE;
            } catch (error) {
                console.error('Error in getEnemySoldierBazookaDie:', error);
                return null;
            }
        }

        async getEnemySoldierBazookaExplode() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.BAZOOKA.EXPLODE;
            } catch (error) {
                console.error('Error in getEnemySoldierBazookaExplode:', error);
                return null;
            }
        }

        async getEnemySoldierBazookaMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.BAZOOKA.MOVE;
            } catch (error) {
                console.error('Error in getEnemySoldierBazookaMove:', error);
                return null;
            }
        }

        async getEnemySoldierNormalDie() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.DIE;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalDie:', error);
                return null;
            }
        }

        async getEnemySoldierNormalExplode() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.EXPLODE;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalExplode:', error);
                return null;
            }
        }

        async getEnemySoldierNormalGrenade() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.GRENADE;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalGrenade:', error);
                return null;
            }
        }

        async getEnemySoldierNormalIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.IDLE;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalIdle:', error);
                return null;
            }
        }

        async getEnemySoldierNormalMeleeForward() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.MELEE.FORWARD;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalMeleeForward:', error);
                return null;
            }
        }

        async getEnemySoldierNormalMeleeStab() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.MELEE.STAB;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalMeleeStab:', error);
                return null;
            }
        }

        async getEnemySoldierNormalRun() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.RUN;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalRun:', error);
                return null;
            }
        }

        async getEnemySoldierNormalThrow() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.NORMAL.THROW;
            } catch (error) {
                console.error('Error in getEnemySoldierNormalThrow:', error);
                return null;
            }
        }

        async getEnemySoldierRifleBullet() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.RIFLE.BULLET;
            } catch (error) {
                console.error('Error in getEnemySoldierRifleBullet:', error);
                return null;
            }
        }

        async getEnemySoldierRifleDie() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.RIFLE.DIE;
            } catch (error) {
                console.error('Error in getEnemySoldierRifleDie:', error);
                return null;
            }
        }

        async getEnemySoldierRifleIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.RIFLE.IDLE;
            } catch (error) {
                console.error('Error in getEnemySoldierRifleIdle:', error);
                return null;
            }
        }

        async getEnemySoldierRifleMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.RIFLE.MOVE;
            } catch (error) {
                console.error('Error in getEnemySoldierRifleMove:', error);
                return null;
            }
        }

        async getEnemySoldierRifleShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.RIFLE.SHOOT;
            } catch (error) {
                console.error('Error in getEnemySoldierRifleShoot:', error);
                return null;
            }
        }

        async getEnemySoldierRifleSmoke() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.RIFLE.SMOKE;
            } catch (error) {
                console.error('Error in getEnemySoldierRifleSmoke:', error);
                return null;
            }
        }

        async getEnemySoldierShieldDefend() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.SHIELD.DEFEND;
            } catch (error) {
                console.error('Error in getEnemySoldierShieldDefend:', error);
                return null;
            }
        }

        async getEnemySoldierShieldDie() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.SHIELD.DIE;
            } catch (error) {
                console.error('Error in getEnemySoldierShieldDie:', error);
                return null;
            }
        }

        async getEnemySoldierShieldIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.SHIELD.IDLE;
            } catch (error) {
                console.error('Error in getEnemySoldierShieldIdle:', error);
                return null;
            }
        }

        async getEnemySoldierShieldMelee() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.SHIELD.MELEE;
            } catch (error) {
                console.error('Error in getEnemySoldierShieldMelee:', error);
                return null;
            }
        }

        async getEnemySoldierShieldMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.SHIELD.MOVE;
            } catch (error) {
                console.error('Error in getEnemySoldierShieldMove:', error);
                return null;
            }
        }

        async getEnemySoldierShieldShield() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.SHIELD.SHIELD;
            } catch (error) {
                console.error('Error in getEnemySoldierShieldShield:', error);
                return null;
            }
        }

        async getEnemySoldierShieldShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.ENEMY.SOLDIER.SHIELD.SHOOT;
            } catch (error) {
                console.error('Error in getEnemySoldierShieldShoot:', error);
                return null;
            }
        }

        async getPartnerAgentAction() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.AGENT.ACTION;
            } catch (error) {
                console.error('Error in getPartnerAgentAction:', error);
                return null;
            }
        }

        async getPartnerAgentIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.AGENT.IDLE;
            } catch (error) {
                console.error('Error in getPartnerAgentIdle:', error);
                return null;
            }
        }

        async getPartnerRalfAction() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.RALF.ACTION;
            } catch (error) {
                console.error('Error in getPartnerRalfAction:', error);
                return null;
            }
        }

        async getPartnerRalfIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.RALF.IDLE;
            } catch (error) {
                console.error('Error in getPartnerRalfIdle:', error);
                return null;
            }
        }

        async getPartnerRumiaikawaBack() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.RUMIAIKAWA.BACK;
            } catch (error) {
                console.error('Error in getPartnerRumiaikawaBack:', error);
                return null;
            }
        }

        async getPartnerRumiaikawaIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.RUMIAIKAWA.IDLE;
            } catch (error) {
                console.error('Error in getPartnerRumiaikawaIdle:', error);
                return null;
            }
        }

        async getPartnerRumiaikawaTrading() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.RUMIAIKAWA.TRADING;
            } catch (error) {
                console.error('Error in getPartnerRumiaikawaTrading:', error);
                return null;
            }
        }

        async getPartnerSilversoldierAction() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.SILVERSOLDIER.ACTION;
            } catch (error) {
                console.error('Error in getPartnerSilversoldierAction:', error);
                return null;
            }
        }

        async getPartnerSilversoldierIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.SILVERSOLDIER.IDLE;
            } catch (error) {
                console.error('Error in getPartnerSilversoldierIdle:', error);
                return null;
            }
        }

        async getPartnerTaroAttack() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.TARO.ATTACK;
            } catch (error) {
                console.error('Error in getPartnerTaroAttack:', error);
                return null;
            }
        }

        async getPartnerTaroBullet() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.TARO.BULLET;
            } catch (error) {
                console.error('Error in getPartnerTaroBullet:', error);
                return null;
            }
        }

        async getPartnerTaroIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.TARO.IDLE;
            } catch (error) {
                console.error('Error in getPartnerTaroIdle:', error);
                return null;
            }
        }

        async getPartnerTaroInit() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.TARO.INIT;
            } catch (error) {
                console.error('Error in getPartnerTaroInit:', error);
                return null;
            }
        }

        async getPartnerTaroMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.PARTNER.TARO.MOVE;
            } catch (error) {
                console.error('Error in getPartnerTaroMove:', error);
                return null;
            }
        }

        async getPlayerMarcoExplode() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.EXPLODE;
            } catch (error) {
                console.error('Error in getPlayerMarcoExplode:', error);
                return null;
            }
        }

        async getPlayerMarcoMachinegunWin() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.MACHINEGUN.WIN;
            } catch (error) {
                console.error('Error in getPlayerMarcoMachinegunWin:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolDashIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.DASH.IDLE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolDashIdle:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolDashShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.DASH.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolDashShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolJumpIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.JUMP.IDLE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolJumpIdle:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolJumpShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.JUMP.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolJumpShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolMoveShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.MOVE.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolMoveShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.IDLE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakIdle:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakMelee() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.MELEE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakMelee:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.MOVE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakMove:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakThrow() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.THROW;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakThrow:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSpawn() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SPAWN;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSpawn:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandIdleDrink() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.DRINK;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandIdleDrink:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandIdleNormal() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.NORMAL;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandIdleNormal:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandIdleSleep() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.SLEEP;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandIdleSleep:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandIdleSleeping() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.SLEEPING;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandIdleSleeping:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandMelee() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.MELEE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandMelee:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandRun() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.RUN;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandRun:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandShoot:', error);
                return null;
            }
        }

        async getPlayerMetalslugAttack() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.METALSLUG.ATTACK;
            } catch (error) {
                console.error('Error in getPlayerMetalslugAttack:', error);
                return null;
            }
        }

        async getPlayerMetalslugDamageLeft() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.METALSLUG.DAMAGE.LEFT;
            } catch (error) {
                console.error('Error in getPlayerMetalslugDamageLeft:', error);
                return null;
            }
        }

        async getPlayerMetalslugDamageRight() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.METALSLUG.DAMAGE.RIGHT;
            } catch (error) {
                console.error('Error in getPlayerMetalslugDamageRight:', error);
                return null;
            }
        }

        async getPlayerMetalslugExplode() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.METALSLUG.EXPLODE;
            } catch (error) {
                console.error('Error in getPlayerMetalslugExplode:', error);
                return null;
            }
        }

        async getPlayerMetalslugIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.METALSLUG.IDLE;
            } catch (error) {
                console.error('Error in getPlayerMetalslugIdle:', error);
                return null;
            }
        }

        async getPlayerMetalslugMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.METALSLUG.MOVE;
            } catch (error) {
                console.error('Error in getPlayerMetalslugMove:', error);
                return null;
            }
        }

        async getPlayerOtherBullet() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.OTHER.BULLET;
            } catch (error) {
                console.error('Error in getPlayerOtherBullet:', error);
                return null;
            }
        }

        async getPlayerOtherGrenade() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.OTHER.GRENADE;
            } catch (error) {
                console.error('Error in getPlayerOtherGrenade:', error);
                return null;
            }
        }

        async getWebDark() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.DARK;
            } catch (error) {
                console.error('Error in getWebDark:', error);
                return null;
            }
        }

        async getWebUfoAfraid() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.UFO.AFRAID;
            } catch (error) {
                console.error('Error in getWebUfoAfraid:', error);
                return null;
            }
        }

        async getWebUfoBullet() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.UFO.BULLET;
            } catch (error) {
                console.error('Error in getWebUfoBullet:', error);
                return null;
            }
        }

        async getWebUfoEffect() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.UFO.EFFECT;
            } catch (error) {
                console.error('Error in getWebUfoEffect:', error);
                return null;
            }
        }

        async getWebUfoEnemy() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.UFO.ENEMY;
            } catch (error) {
                console.error('Error in getWebUfoEnemy:', error);
                return null;
            }
        }

        async getWebUfoExplode() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.UFO.EXPLODE;
            } catch (error) {
                console.error('Error in getWebUfoExplode:', error);
                return null;
            }
        }

        async getWebUfoLaugh() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.UFO.LAUGH;
            } catch (error) {
                console.error('Error in getWebUfoLaugh:', error);
                return null;
            }
        }

        async getWebUfoWave() {
            try {
                const assets = await this.fetchAssets();
                return assets.WEB.UFO.WAVE;
            } catch (error) {
                console.error('Error in getWebUfoWave:', error);
                return null;
            }
        }

        async getWorldItemsAmmo() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.AMMO;
            } catch (error) {
                console.error('Error in getWorldItemsAmmo:', error);
                return null;
            }
        }

        async getWorldItemsAttack() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.ATTACK;
            } catch (error) {
                console.error('Error in getWorldItemsAttack:', error);
                return null;
            }
        }

        async getWorldItemsBomb() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.BOMB;
            } catch (error) {
                console.error('Error in getWorldItemsBomb:', error);
                return null;
            }
        }

        async getWorldItemsCoin() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.COIN;
            } catch (error) {
                console.error('Error in getWorldItemsCoin:', error);
                return null;
            }
        }

        async getWorldItemsGas() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.GAS;
            } catch (error) {
                console.error('Error in getWorldItemsGas:', error);
                return null;
            }
        }

        async getWorldItemsHealth() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.HEALTH;
            } catch (error) {
                console.error('Error in getWorldItemsHealth:', error);
                return null;
            }
        }

        async getWorldItemsApple() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.APPLE;
            } catch (error) {
                console.error('Error in getWorldItemsApple:', error);
                return null;
            }
        }

        async getWorldItemsMedal() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.MEDAL;
            } catch (error) {
                console.error('Error in getWorldItemsMedal:', error);
                return null;
            }
        }

        async getWorldItemsPotionBlue() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.POTION.BLUE;
            } catch (error) {
                console.error('Error in getWorldItemsPotionBlue:', error);
                return null;
            }
        }

        async getWorldItemsPotionGreen() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.POTION.GREEN;
            } catch (error) {
                console.error('Error in getWorldItemsPotionGreen:', error);
                return null;
            }
        }

        async getWorldItemsPotionRed() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.POTION.RED;
            } catch (error) {
                console.error('Error in getWorldItemsPotionRed:', error);
                return null;
            }
        }

        async getWorldItemsPotionYellow() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.ITEMS.POTION.YELLOW;
            } catch (error) {
                console.error('Error in getWorldItemsPotionYellow:', error);
                return null;
            }
        }

        async getWorldMark() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.MARK;
            } catch (error) {
                console.error('Error in getWorldMark:', error);
                return null;
            }
        }

        async getWorldSkillsBomb() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.SKILLS.BOMB;
            } catch (error) {
                console.error('Error in getWorldSkillsBomb:', error);
                return null;
            }
        }

        async getWorldSlotEmpty() {
            try {
                const assets = await this.fetchAssets();
                return assets.WORLD.SLOT.EMPTY;
            } catch (error) {
                console.error('Error in getWorldSlotEmpty:', error);
                return null;
            }
        }

}

const assetsInstance = new Assets();
export default assetsInstance;
