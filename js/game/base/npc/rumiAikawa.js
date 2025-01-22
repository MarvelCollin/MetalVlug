import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

export class RumiAikawa extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.modal = document.getElementById('rumiAikawaModal');
        this.buyTimer = null;
        this.buyDuration = 1000; // 1 second hold to buy
        this.loadSprites();
        this.setupShopInteractions();
        
        // Add resize handler
        window.addEventListener('resize', () => {
            if (this.modal.style.display === 'flex') {
                this.drawWorldItems();
            }
        });
    }

    async loadSprites() {
        this.idleSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRumiaikawaIdle()
        );
        this.tradingSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRumiaikawaTrading()
        );
        this.currentSprite = this.idleSprite;

        // Load world items
        this.ammoSprite = await Drawer.loadImage(() => 
            Assets.getWorldItemsAmmo()
        );
        this.attackSprite = await Drawer.loadImage(() => 
            Assets.getWorldItemsAttack()
        );
        this.bombSprite = await Drawer.loadImage(() => 
            Assets.getWorldItemsBomb()
        );
        this.gasSprite = await Drawer.loadImage(() => 
            Assets.getWorldItemsGas()
        );
        this.healthSprite = await Drawer.loadImage(() => 
            Assets.getWorldItemsHealth()
        );

        // Add coin sprite loading
        this.coinSprite = await Drawer.loadImage(() => 
            Assets.getWorldItemsCoin()
        );
        
        // Load and setup currency display with larger scale
        const currencyIcons = document.querySelectorAll('.coin-icon');
        currencyIcons.forEach(icon => {
            if (icon.tagName === 'CANVAS') {
                const ctx = icon.getContext('2d');
                const scale = icon.classList.contains('balance-coin') ? 3 : 3; // Larger scale for coins
                this.animateSprite(ctx, this.coinSprite, scale);
            }
        });
    }

    setupShopInteractions() {
        const shopItems = document.querySelectorAll('.shop-item');
        
        shopItems.forEach(item => {
            let startTime;
            let progressBar;
            let itemElement;

            const startBuying = (e) => {
                itemElement = e.currentTarget;
                progressBar = itemElement.querySelector('.buy-progress');
                startTime = Date.now();
                itemElement.classList.add('buying');
                
                this.buyTimer = requestAnimationFrame(updateProgress);
            };

            const updateProgress = () => {
                const elapsed = Date.now() - startTime;
                const progress = (elapsed / this.buyDuration) * 100;
                
                if (progressBar) {
                    progressBar.style.width = `${Math.min(progress, 100)}%`;
                }

                if (elapsed < this.buyDuration) {
                    this.buyTimer = requestAnimationFrame(updateProgress);
                } else {
                    this.completePurchase(itemElement.dataset.itemId);
                }
            };

            const stopBuying = () => {
                if (this.buyTimer) {
                    cancelAnimationFrame(this.buyTimer);
                    this.buyTimer = null;
                }
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
                if (itemElement) {
                    itemElement.classList.remove('buying');
                }
            };

            item.addEventListener('mousedown', startBuying);
            item.addEventListener('mouseup', stopBuying);
            item.addEventListener('mouseleave', stopBuying);
            item.addEventListener('touchstart', startBuying);
            item.addEventListener('touchend', stopBuying);
            item.addEventListener('touchcancel', stopBuying);
        });
    }

    completePurchase(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (item && player.coins >= item.price) {
            player.coins -= item.price;
            item.effect(player);
            
            // Visual feedback
            const purchasedItem = document.querySelector(`[data-item-id="${itemId}"]`);
            purchasedItem.classList.add('purchased');
            setTimeout(() => {
                purchasedItem.classList.remove('purchased');
            }, 500);

            // Update balance display
            this.updateBalance(player.coins);
        } else {
            // Show insufficient funds feedback
            console.log('Not enough coins!');
        }
    }

    updateBalance(newBalance) {
        const balanceElement = document.querySelector('.player-balance span:last-child');
        if (balanceElement) {
            balanceElement.textContent = newBalance;
        }
    }

    onInteract() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.drawWorldItems();

            const handleClick = (e) => {
                if (e.target.classList.contains('close-btn') || 
                    e.target.classList.contains('modal-overlay')) {
                    this.modal.style.display = 'none';
                }
            };

            this.modal.onclick = handleClick;
        }
    }

    drawWorldItems() {
        const getScale = () => {
            const width = window.innerWidth;
            if (width <= 480) return 1.2;  // Further reduced scales
            if (width <= 768) return 1.5;
            return 2;  // Reduced from 3
        };

        const items = [
            { canvasId: 'ammoCanvas', sprite: this.ammoSprite },
            { canvasId: 'attackCanvas', sprite: this.attackSprite },
            { canvasId: 'bombCanvas', sprite: this.bombSprite },
            { canvasId: 'gasCanvas', sprite: this.gasSprite },
            { canvasId: 'healthCanvas', sprite: this.healthSprite }
        ];

        const scale = getScale();

        items.forEach(item => {
            const canvas = document.getElementById(item.canvasId);
            if (canvas && item.sprite) {
                const ctx = canvas.getContext('2d');
                canvas.width = item.sprite.images[0].width * scale;
                canvas.height = item.sprite.images[0].height * scale;
                this.animateSprite(ctx, item.sprite, scale);
            }
        });

        // Update coin icons scale
        const currencyIcons = document.querySelectorAll('.coin-icon');
        currencyIcons.forEach(icon => {
            if (icon.tagName === 'CANVAS') {
                const ctx = icon.getContext('2d');
                const coinScale = window.innerWidth <= 768 ? 1.2 : 1.5;  // Reduced scales
                this.animateSprite(ctx, this.coinSprite, coinScale);
            }
        });
    }

    animateSprite(ctx, sprite, scale = 1) {
        let frameIndex = 0;
        const drawFrame = () => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.save();
            ctx.scale(scale, scale);
            Drawer.drawImageFromBottom(
                sprite.images[frameIndex], 
                0, 
                ctx.canvas.height / scale, 
                false, 
                1, 
                ctx
            );
            ctx.restore();
            frameIndex = (frameIndex + 1) % sprite.images.length;
            setTimeout(drawFrame, sprite.delay);
        };
        drawFrame();
    }
}

const SHOP_ITEMS = [
    {
        id: 'ammo',
        name: 'Ammo Pack',
        price: 100,
        buff: '+50 Max Ammo',
        detail: 'Increases maximum ammunition capacity',
        effect: (player) => {
            player.maxAmmo += 50;
        }
    },
    {
        id: 'attack',
        name: 'Attack Boost',
        price: 250,
        buff: '+25% Damage',
        detail: 'Enhances weapon damage output',
        effect: (player) => {
            player.damageMultiplier *= 1.25;
        }
    },
    {
        id: 'bomb',
        name: 'Bomb Pack',
        price: 300,
        buff: '+35% Explosive Damage',
        detail: 'Increases explosive weapon damage',
        effect: (player) => {
            player.explosiveDamage *= 1.35;
        }
    },
    {
        id: 'gas',
        name: 'Gas Tank',
        price: 150,
        buff: '+30% Slug Health',
        detail: 'Improves Metal Slug durability',
        effect: (player) => {
            player.slugHealth *= 1.3;
        }
    },
    {
        id: 'health',
        name: 'Health Pack',
        price: 200,
        buff: '+50 Max Health',
        detail: 'Increases maximum health points',
        effect: (player) => {
            player.maxHealth += 50;
        }
    }
];
