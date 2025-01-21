import { enemyTypeToSprite } from "./enemyType.js";

export class EnemyAbstract {
    constructor(type) {
        this.type = type;
        this._stats = {
            health: 100,
            speed: 5,
            detectionRange: 500,
            attackRange: 100,
            scale: 4
        };
        this._sprites = enemyTypeToSprite[this.type];
    }

    get stats() {
        return this._stats;
    }

    get sprites() {
        return this._sprites;
    }

    set stats(newStats) {
        this._stats = { ...this._stats, ...newStats };
    }

    set sprites(newSprites) {
        this._sprites = { ...this._sprites, ...newSprites };
    }

    attack(enemy) {
        throw new Error('Attack method must be implemented');
    }

    updateBehavior(enemy) {
        throw new Error('UpdateBehavior method must be implemented');
    }

    takeDamage(enemy, amount) {
        return amount;
    }
}
