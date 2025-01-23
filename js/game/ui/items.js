export const INVENTORY_ITEMS = {
    APPLE: {
        id: 'apple',
        path: '../assets/world/items/inventory/apple.png',
        name: 'Fresh Apple',
        buff: '+10 HP',
        effect: 'Instant Health Recovery',
        description: 'A crisp, juicy apple that provides instant healing.'
    },
    APPLES: {
        id: 'apples',
        path: '../assets/world/items/inventory/apples.png',
        name: 'Apple Bundle',
        buff: '+25 HP',
        effect: 'Enhanced Health Recovery',
        description: 'A bundle of fresh apples for greater healing potential.'
    },
    BANANA: {
        id: 'banana',
        path: '../assets/world/items/inventory/banana.png',
        name: 'Banana',
        buff: '+15 HP, +5 Speed',
        effect: 'Health & Speed Boost',
        description: 'Quick energy boost and minor healing.'
    },
    BAKPAO_LEGEND: {
        id: 'bakpao_legend',
        path: '../assets/world/items/inventory/bakpao_legend.png',
        name: 'Legendary Bakpao',
        buff: '+100 HP, +50 MP',
        effect: 'Full Recovery',
        description: 'A mystical steamed bun that fully restores health and energy.'
    },
    BONE: {
        id: 'bone',
        path: '../assets/world/items/inventory/bone.png',
        name: 'Mystical Bone',
        buff: '+20 Defense',
        effect: 'Defense Boost',
        description: 'An enchanted bone that increases defense capabilities.'
    },
    CHICKEN: {
        id: 'chicken',
        path: '../assets/world/items/inventory/chicken.png',
        name: 'Roasted Chicken',
        buff: '+75 HP, +25 Energy',
        effect: 'Major Recovery',
        description: 'A hearty meal that provides substantial healing and energy.'
    },
    BLUE_POTION: {
        id: 'blue_potion',
        path: '../assets/world/items/inventory/blue_potion.png',
        name: 'Mana Potion',
        buff: '+50 MP',
        effect: 'Mana Restoration',
        description: 'Restores magical energy for special attacks.'
    },
    RED_POTION: {
        id: 'red_potion',
        path: '../assets/world/items/inventory/red_potion.png',
        name: 'Health Potion',
        buff: '+50 HP',
        effect: 'Major Healing',
        description: 'A powerful healing potion for critical situations.'
    },
    GREEN_POTION: {
        id: 'green_potion',
        path: '../assets/world/items/inventory/green_potion.png',
        name: 'Poison Resistance',
        buff: '+100% Poison Resist',
        effect: 'Poison Immunity',
        description: 'Provides temporary immunity to poison effects.'
    },
    YELLOW_POTION: {
        id: 'yellow_potion',
        path: '../assets/world/items/inventory/yellow_potion.png',
        name: 'Speed Potion',
        buff: '+30% Speed',
        effect: 'Movement Speed Boost',
        description: 'Temporarily increases movement and attack speed.'
    },
    LETTUCE: {
        id: 'lettuce',
        path: '../assets/world/items/inventory/lettuce.png',
        name: 'Fresh Lettuce',
        buff: '+5 HP/sec',
        effect: 'Health Regeneration',
        description: 'Provides continuous health regeneration over time.'
    }
};

export const applyItemEffect = (player, itemId) => {
    const effects = {
        apple: (player) => {
            player.health = Math.min(player.health + 10, player.maxHealth);
        },
        apples: (player) => {
            player.health = Math.min(player.health + 25, player.maxHealth);
        },
        banana: (player) => {
            player.health = Math.min(player.health + 15, player.maxHealth);
            player.speed *= 1.05;
            setTimeout(() => player.speed /= 1.05, 10000); // Remove speed boost after 10s
        },
        bakpao_legend: (player) => {
            player.health = player.maxHealth;
            player.mana = player.maxMana;
        },
        bone: (player) => {
            player.defense += 20;
            setTimeout(() => player.defense -= 20, 30000); // 30s duration
        },
        chicken: (player) => {
            player.health = Math.min(player.health + 75, player.maxHealth);
            player.energy = Math.min(player.energy + 25, player.maxEnergy);
        },
        blue_potion: (player) => {
            player.mana = Math.min(player.mana + 50, player.maxMana);
        },
        red_potion: (player) => {
            player.health = Math.min(player.health + 50, player.maxHealth);
        },
        green_potion: (player) => {
            player.isPoisonImmune = true;
            setTimeout(() => player.isPoisonImmune = false, 60000); // 60s immunity
        },
        yellow_potion: (player) => {
            const speedBoost = 1.3; // 30% speed boost
            player.speed *= speedBoost;
            setTimeout(() => player.speed /= speedBoost, 15000); // 15s duration
        },
        lettuce: (player) => {
            const regenInterval = setInterval(() => {
                if (player.health < player.maxHealth) {
                    player.health = Math.min(player.health + 5, player.maxHealth);
                } else {
                    clearInterval(regenInterval);
                }
            }, 1000); // Heal 5 HP every second
            setTimeout(() => clearInterval(regenInterval), 10000); // 10s duration
        }
    };

    const effect = effects[itemId];
    if (effect) {
        effect(player);
        // Play consume sound
        // playSound('item_consume');
        
        // Show effect indicator
        const effectText = document.createElement('div');
        effectText.className = 'effect-text';
        effectText.textContent = `Used ${INVENTORY_ITEMS[itemId.toUpperCase()].name}!`;
        document.body.appendChild(effectText);
        setTimeout(() => effectText.remove(), 2000);
    }
};
