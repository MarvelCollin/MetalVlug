import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

export class RumiAikawa extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.modal = document.getElementById('rumiAikawaModal');
        this.currentSlide = 2; // Set to middle index (0-based, so 2 is middle of 5 items)
        this.itemsPerView = 3;
        this.loadSprites();
        this.setupShopInteractions();
        this.setupCarousel();
        
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
            const purchaseBtn = item.querySelector('.card-purchase-btn');
            const itemId = item.dataset.itemId;

            purchaseBtn.addEventListener('click', () => {
                this.completePurchase(itemId);
            });
        });
    }

    completePurchase(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (item && player.coins >= item.price) {
            player.coins -= item.price;
            item.effect(player);
            
            // Visual feedback
            const shopItem = document.querySelector(`[data-item-id="${itemId}"]`);
            const purchaseBtn = shopItem.querySelector('.card-purchase-btn');
            
            // Add success state
            purchaseBtn.textContent = 'Purchased!';
            purchaseBtn.classList.add('success');
            shopItem.classList.add('purchase-success');
            
            // Add and animate success icon
            const successIcon = document.createElement('div');
            successIcon.className = 'success-icon';
            shopItem.appendChild(successIcon);
            shopItem.classList.add('showing-success');

            // Play success sound (if you have one)
            // this.playSuccessSound();
            
            // Reset after animation
            setTimeout(() => {
                purchaseBtn.textContent = 'Purchase';
                purchaseBtn.classList.remove('success');
                shopItem.classList.remove('purchase-success', 'showing-success');
                successIcon.remove();
            }, 1500);

            // Update balance display
            this.updateBalance(player.coins);
            
            // Add floating coins effect
            this.createFloatingCoins(shopItem, item.price);
        } else {
            // Show insufficient funds feedback
            const purchaseBtn = document.querySelector(`[data-item-id="${itemId}"] .card-purchase-btn`);
            purchaseBtn.textContent = 'Not enough coins!';
            purchaseBtn.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
            
            setTimeout(() => {
                purchaseBtn.textContent = 'Purchase';
                purchaseBtn.style.background = '';
            }, 1000);
        }
    }

    createFloatingCoins(element, amount) {
        const numCoins = Math.min(5, Math.ceil(amount / 50)); // 1 coin per 50 price, max 5
        
        for (let i = 0; i < numCoins; i++) {
            const coin = document.createElement('div');
            coin.className = 'floating-coin';
            coin.innerHTML = `<canvas width="32" height="32"></canvas>`;
            element.appendChild(coin);
            
            // Position randomly within the element
            const x = Math.random() * 80 - 40; // -40 to 40px
            const delay = i * 100; // Stagger the animations
            
            // Animate the coin
            coin.style.cssText = `
                position: absolute;
                left: 50%;
                bottom: 50%;
                transform: translate(${x}px, 0);
                animation: floatCoin 1s ${delay}ms ease-out forwards;
            `;
            
            // Setup coin sprite animation
            const ctx = coin.querySelector('canvas').getContext('2d');
            this.animateSprite(ctx, this.coinSprite, 1.5);
            
            // Remove after animation
            setTimeout(() => coin.remove(), 1000 + delay);
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
            // Force carousel to update and show middle item immediately
            const items = this.modal.querySelectorAll('.shop-item');
            this.currentSlide = Math.floor((items.length - 1) / 2); // Ensures middle item (index 2)
            this.updateCarousel();

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

    setupCarousel() {
        // Move updateCarousel to class level so it can be called from other methods
        this.updateCarousel = () => {
            const items = this.modal.querySelectorAll('.shop-item');
            const itemWidth = items[0].offsetWidth;
            const gap = 20;
            const containerWidth = this.modal.querySelector('.carousel-container').offsetWidth;
            const centerOffset = (containerWidth - itemWidth) / 2;
            
            const offset = -(this.currentSlide * (itemWidth + gap)) + centerOffset;
            const content = this.modal.querySelector('.shop-content');
            content.style.transform = `translateX(${offset}px)`;

            // Update active states
            items.forEach((item, index) => {
                if (index === this.currentSlide) {
                    item.classList.add('active');
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1.05)';
                } else {
                    item.classList.remove('active');
                    item.style.opacity = '0.6';
                    item.style.transform = 'scale(1)';
                }
            });

            // Update button states
            const prevBtn = this.modal.querySelector('#prevBtn');
            const nextBtn = this.modal.querySelector('#nextBtn');
            prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = this.currentSlide === 0 ? 'none' : 'auto';
            
            nextBtn.style.opacity = this.currentSlide >= items.length - 1 ? '0.5' : '1';
            nextBtn.style.pointerEvents = this.currentSlide >= items.length - 1 ? 'none' : 'auto';
        };

        const prevBtn = this.modal.querySelector('#prevBtn');
        const nextBtn = this.modal.querySelector('#nextBtn');
        const content = this.modal.querySelector('.shop-content');
        const items = content.querySelectorAll('.shop-item');
        
        this.currentSlide = Math.floor((items.length - 1) / 2);
        
        const updateCarousel = () => {
            const itemWidth = items[0].offsetWidth;
            const gap = 20;
            const containerWidth = this.modal.querySelector('.carousel-container').offsetWidth;
            const centerOffset = (containerWidth - itemWidth) / 2;
            
            const offset = -(this.currentSlide * (itemWidth + gap)) + centerOffset;
            content.style.transform = `translateX(${offset}px)`;

            items.forEach((item, index) => {
                if (index === this.currentSlide) {
                    item.classList.add('active');
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1.05)';
                } else {
                    item.classList.remove('active');
                    item.style.opacity = '0.6';
                    item.style.transform = 'scale(1)';
                }
            });

            prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = this.currentSlide === 0 ? 'none' : 'auto';
            
            nextBtn.style.opacity = this.currentSlide >= items.length - 1 ? '0.5' : '1';
            nextBtn.style.pointerEvents = this.currentSlide >= items.length - 1 ? 'none' : 'auto';
        };

        prevBtn.addEventListener('click', () => {
            if (this.currentSlide > 0) {
                this.currentSlide--;
                updateCarousel();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (this.currentSlide < items.length - 1) {
                this.currentSlide++;
                updateCarousel();
            }
        });

        // Add keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'flex') {
                if (e.key === 'ArrowLeft' && this.currentSlide > 0) {
                    this.currentSlide--;
                    updateCarousel();
                } else if (e.key === 'ArrowRight' && this.currentSlide < items.length - 1) {
                    this.currentSlide++;
                    updateCarousel();
                }
            }
        });

        // Initial setup
        updateCarousel();

        // Update on window resize
        window.addEventListener('resize', () => {
            updateCarousel();
        });
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
