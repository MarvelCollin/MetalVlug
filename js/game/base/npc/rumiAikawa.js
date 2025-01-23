import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

export class RumiAikawa extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.modal = document.getElementById('rumiAikawaModal');
        this.shopContent = this.modal.querySelector('.shop-content');
        this.currentSlide = 2; 
        this.itemsPerView = 3;
        this.isFlipped = true;
        this.loadSprites();
        this.generateShopItems();
        this.setupShopInteractions();
        this.setupCarousel();
        
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

        this.coinSprite = await Drawer.loadImage(() => 
            Assets.getWorldItemsCoin()
        );
        
        const currencyIcons = document.querySelectorAll('.coin-icon');
        currencyIcons.forEach(icon => {
            if (icon.tagName === 'CANVAS') {
                const ctx = icon.getContext('2d');
                const scale = icon.classList.contains('balance-coin') ? 1.5 : 1.5;
                this.animateSprite(ctx, this.coinSprite, scale);
            }
        });
    }

    generateShopItems() {
        this.shopContent.innerHTML = SHOP_ITEMS.map((item, index) => `
            <div class="shop-item" data-item-id="${item.id}">
                <div class="item-icon">
                    <canvas id="${item.id}Canvas"></canvas>
                </div>
                <div class="item-shop-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">
                        <span class="buff">${item.buff}</span>
                        <span class="detail">${item.detail}</span>
                    </div>
                    <div class="item-price">
                        <div class="coin-icon-container">
                            <canvas class="coin-icon" width="32" height="32"></canvas>
                        </div>
                        <span>${item.price}</span>
                    </div>
                </div>
                <button class="card-purchase-btn">Purchase</button>
            </div>
        `).join('');
    }

    setupShopInteractions() {
        // Update to select from newly generated items
        const shopItems = this.shopContent.querySelectorAll('.shop-item');
        
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
        const currentBalance = parseInt(document.querySelector('.player-balance span:last-child').textContent);
        
        if (item && currentBalance >= item.price) {
            const shopItem = document.querySelector(`[data-item-id="${itemId}"]`);
            const purchaseBtn = shopItem.querySelector('.card-purchase-btn');
            
            document.querySelectorAll('.card-purchase-btn').forEach(btn => {
                btn.disabled = true;
            });
            
            purchaseBtn.textContent = 'Purchased!';
            purchaseBtn.classList.add('success');
            
            const newBalance = currentBalance - item.price;
            this.updateBalance(newBalance);
            
            const resetPurchaseState = () => {
                purchaseBtn.textContent = 'Purchase';
                purchaseBtn.classList.remove('success');
                shopItem.classList.remove('purchase-success', 'showing-success');
                const successIcon = shopItem.querySelector('.success-icon');
                if (successIcon) successIcon.remove();
                
                document.querySelectorAll('.card-purchase-btn').forEach(btn => {
                    btn.disabled = false;
                });
            };

            const carouselButtons = document.querySelectorAll('.carousel-button');
            carouselButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    resetPurchaseState();
                }, { once: true });
            });

            window.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    resetPurchaseState();
                }
            }, { once: true });

            shopItem.classList.add('purchase-success', 'showing-success');
            const successIcon = document.createElement('div');
            successIcon.className = 'success-icon';
            shopItem.appendChild(successIcon);
            
            this.createFloatingCoins(shopItem, item.price);
            
            this.createSuccessParticles(shopItem);
            
            setTimeout(resetPurchaseState, 1500);
        } else {
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
        const numCoins = Math.min(5, Math.ceil(amount / 50));
        const balanceElement = document.querySelector('.player-balance');
        const balanceCoin = balanceElement.querySelector('.coin-icon-container');
        const balanceRect = balanceCoin.getBoundingClientRect();
        const targetRect = element.getBoundingClientRect();
        
        for (let i = 0; i < numCoins; i++) {
            const coin = document.createElement('div');
            coin.className = 'floating-coin';
            coin.innerHTML = `<canvas width="32" height="32"></canvas>`;
            document.body.appendChild(coin);
            
            const startX = balanceRect.left + balanceRect.width / 2;
            const startY = balanceRect.top + balanceRect.height / 2;
            const endX = targetRect.left + targetRect.width / 2;
            const endY = targetRect.top + targetRect.height / 2;
            
            const arcHeight = -(100 + Math.random() * 100);
            const delay = i * 100;
            
            coin.style.cssText = `
                position: fixed;
                left: ${startX}px;
                top: ${startY}px;
                transform: translate(-50%, -50%);
                z-index: 9999;
                pointer-events: none;
            `;
            
            const ctx = coin.querySelector('canvas').getContext('2d');
            this.animateSprite(ctx, this.coinSprite, 1.5);
            
            coin.animate([
                {
                    left: `${startX}px`,
                    top: `${startY}px`,
                    offset: 0
                },
                {
                    left: `${(startX + endX) / 2}px`,
                    top: `${(startY + endY) / 2 + arcHeight}px`,
                    offset: 0.5
                },
                {
                    left: `${endX}px`,
                    top: `${endY}px`,
                    offset: 1
                }
            ], {
                duration: 1000,
                delay: delay,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });
            
            // Remove after animation
            setTimeout(() => coin.remove(), 1000 + delay);
        }
    }

    createSuccessParticles(element) {
        const numParticles = 20;
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'success-particles';
            document.body.appendChild(particle);

            // Random position around the center
            const angle = (Math.PI * 2 * i) / numParticles;
            const distance = 100 + Math.random() * 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);

            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${x}px, ${y}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });

            setTimeout(() => particle.remove(), 1000);
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
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });
            
            this.drawWorldItems();
            
            const items = this.modal.querySelectorAll('.shop-item');
            items.forEach((item, index) => {
                item.style.setProperty('--index', index);
            });
            
            this.currentSlide = Math.floor((items.length - 1) / 2);
            this.updateCarousel();

            const handleClick = (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.closeModal();
                }
            };

            this.modal.onclick = handleClick;
        }
    }

    closeModal() {
        this.modal.classList.add('closing');
        this.modal.classList.remove('show');
        
        // Wait for animations to finish
        setTimeout(() => {
            this.modal.classList.remove('closing');
            this.modal.style.display = 'none';
        }, 500);
    }

    drawWorldItems() {
        const items = [
            { canvasId: 'ammoCanvas', sprite: this.ammoSprite },
            { canvasId: 'attackCanvas', sprite: this.attackSprite },
            { canvasId: 'bombCanvas', sprite: this.bombSprite },
            { canvasId: 'gasCanvas', sprite: this.gasSprite },
            { canvasId: 'healthCanvas', sprite: this.healthSprite }
        ];

        items.forEach(item => {
            const canvas = document.getElementById(item.canvasId);
            if (canvas && item.sprite) {
                const ctx = canvas.getContext('2d');
                canvas.width = 80;
                canvas.height = 80;
                this.animateSprite(ctx, item.sprite, 2);
            }
        });
        
    }

    animateSprite(ctx, sprite, scale = 1) {
        const canvas = ctx.canvas;
        
        let frameIndex = 0;
        const drawFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const imgWidth = sprite.images[frameIndex].width * scale;
            const imgHeight = sprite.images[frameIndex].height * scale;
            
            const x = (canvas.width - imgWidth) / 2;
            const y = (canvas.height - imgHeight) / 2;
            
            ctx.drawImage(
                sprite.images[frameIndex],
                x,
                y,
                imgWidth,
                imgHeight
            );
            
            frameIndex = (frameIndex + 1) % sprite.images.length;
            setTimeout(drawFrame, sprite.delay);
        };
        drawFrame();
    }

    updateCarousel() {
        const items = [...this.modal.querySelectorAll('.shop-item')];
        const totalItems = items.length;

        items.forEach((item, index) => {
            item.classList.remove('active', 'prev-1', 'prev-2', 'next-1', 'next-2');
            
            const position = (index - this.currentSlide + totalItems) % totalItems;
            
            switch (position) {
                case 0:
                    item.classList.add('active');
                    item.style.zIndex = 5;
                    break;
                case totalItems - 1:
                    item.classList.add('prev-1');
                    item.style.zIndex = 4;
                    break;
                case totalItems - 2:
                    item.classList.add('prev-2');
                    item.style.zIndex = 3;
                    break;
                case 1:
                    item.classList.add('next-1');
                    item.style.zIndex = 4;
                    break;
                case 2:
                    item.classList.add('next-2');
                    item.style.zIndex = 3;
                    break;
                default:
                    item.style.opacity = '0';
                    item.style.zIndex = 1;
            }
        });

        const prevBtn = this.modal.querySelector('#prevBtn');
        const nextBtn = this.modal.querySelector('#nextBtn');
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
        nextBtn.style.pointerEvents = 'auto';
    }

    setupCarousel() {
        const prevBtn = this.modal.querySelector('#prevBtn');
        const nextBtn = this.modal.querySelector('#nextBtn');
        const items = this.modal.querySelectorAll('.shop-item');
        
        prevBtn.addEventListener('click', () => {
            this.currentSlide = (this.currentSlide - 1 + items.length) % items.length;
            this.updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            this.currentSlide = (this.currentSlide + 1) % items.length;
            this.updateCarousel();
        });

        // Add keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'flex') {
                if (e.key === 'ArrowLeft') {
                    this.currentSlide = (this.currentSlide - 1 + items.length) % items.length;
                    this.updateCarousel();
                } else if (e.key === 'ArrowRight') {
                    this.currentSlide = (this.currentSlide + 1) % items.length;
                    this.updateCarousel();
                }
            }
        });

        // Initial setup
        this.updateCarousel();

        // Update on window resize
        window.addEventListener('resize', () => {
            this.updateCarousel();
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
