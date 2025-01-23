import { INVENTORY_ITEMS, applyItemEffect } from './items.js';

export class Inventory {
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
        this.inventoryModal = null;
        this._isVisible = false; 
        this.player = null; 
    }

    
    setPlayer(player) {
        this.player = player;
    }

    
    get isVisible() {
        return this._isVisible;
    }

    populateInventory(itemIds, slots) {
        itemIds.forEach((itemId, index) => {
            const item = INVENTORY_ITEMS[itemId];
            if (!item || !slots[index]) return;

            slots[index].classList.remove('empty');
            slots[index].dataset.itemId = itemId.toLowerCase();
            slots[index].dataset.stack = Math.floor(Math.random() * 999) + 1;

            const img = new Image();
            img.src = item.path;
            img.className = 'item-icon';
            slots[index].innerHTML = '';
            slots[index].appendChild(img);

            const count = document.createElement('span');
            count.className = 'item-count';
            count.textContent = slots[index].dataset.stack;
            slots[index].appendChild(count);
        });
    }

    createConsumeEffect(slot, item) {
        const slotRect = slot.getBoundingClientRect();
        const centerX = slotRect.left + slotRect.width / 2;
        const centerY = slotRect.top + slotRect.height / 2;

        
        const img = new Image();
        img.src = item.path;
        img.className = 'consume-effect';
        img.style.left = `${slotRect.left}px`;
        img.style.top = `${slotRect.top}px`;
        img.style.width = `${slotRect.width}px`;
        img.style.height = `${slotRect.height}px`;
        document.body.appendChild(img);

        
        const effectText = document.createElement('div');
        effectText.className = 'effect-text';
        effectText.textContent = item.buff;
        effectText.style.left = `${centerX}px`;
        effectText.style.top = `${centerY}px`;
        document.body.appendChild(effectText);

        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                this.createParticle(slotRect, i * 60); 
            }, i * 50);
        }

        img.style.animation = 'consumeAnimation 0.6s ease-out forwards';
        setTimeout(() => {
            img.remove();
            effectText.remove();
        }, 600);
    }

    createParticle(rect, angleOffset = 0) {
        const particle = document.createElement('div');
        particle.className = 'consume-particles';
        
        const angle = (Math.PI * 2 / 6) * angleOffset + (Math.random() * 0.5);
        const distance = Math.random() * 40 + 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.width = `${Math.random() * 3 + 2}px`;
        particle.style.height = particle.style.width;

        document.body.appendChild(particle);
        
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1,
                offset: 0
            },
            {
                transform: `translate(${x * 0.5}px, ${y * 0.5}px) scale(1.2)`,
                opacity: 0.8,
                offset: 0.4
            },
            {
                transform: `translate(${x}px, ${y}px) scale(0)`,
                opacity: 0,
                offset: 1
            }
        ], {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });

        setTimeout(() => particle.remove(), 500);
    }

    initialize() {
        this.inventoryModal = document.querySelector('.inventory-modal');
        this.setupSlots();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.currentSelectedIndex = -1;
    }

    setupSlots() {
        const slots = this.inventoryModal.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            slot.addEventListener('click', () => this.handleSlotClick(slot));
        });
    }

    setupEventListeners() {
        const consumeButton = this.inventoryModal.querySelector('.consume-button');
        if (consumeButton) {
            consumeButton.addEventListener('click', () => this.consumeSelectedItem());
        }

        
        this.inventoryModal.addEventListener('click', (e) => {
            if (e.target === this.inventoryModal) {
                this.hide();
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this._isVisible) return;

            const slots = Array.from(this.inventoryModal.querySelectorAll('.inventory-slot:not(.empty)'));
            if (slots.length === 0) return;

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    this.currentSelectedIndex = Math.min(this.currentSelectedIndex + 1, slots.length - 1);
                    this.selectSlotByIndex(slots);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.currentSelectedIndex = Math.max(this.currentSelectedIndex - 1, 0);
                    this.selectSlotByIndex(slots);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.currentSelectedIndex = Math.min(this.currentSelectedIndex + 5, slots.length - 1);
                    this.selectSlotByIndex(slots);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.currentSelectedIndex = Math.max(this.currentSelectedIndex - 5, 0);
                    this.selectSlotByIndex(slots);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.currentSelectedIndex >= 0) {
                        this.consumeSelectedItem();
                    }
                    break;
            }
        });
    }

    selectSlotByIndex(slots) {
        if (this.currentSelectedIndex < 0) this.currentSelectedIndex = 0;
        
        
        this.inventoryModal.querySelectorAll('.inventory-slot').forEach(s => 
            s.classList.remove('selected'));
        
        
        const selectedSlot = slots[this.currentSelectedIndex];
        if (selectedSlot) {
            selectedSlot.classList.add('selected');
            this.updateItemDetails(selectedSlot);
            selectedSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    handleSlotClick(slot) {
        if (slot.classList.contains('empty')) return;

        const slots = Array.from(this.inventoryModal.querySelectorAll('.inventory-slot:not(.empty)'));
        this.currentSelectedIndex = slots.indexOf(slot);
        
        this.inventoryModal.querySelectorAll('.inventory-slot').forEach(s => 
            s.classList.remove('selected'));
        slot.classList.add('selected');
        this.updateItemDetails(slot);
    }

    updateItemDetails(slot) {
        const itemId = slot.dataset.itemId;
        if (!itemId || !INVENTORY_ITEMS[itemId.toUpperCase()]) return;

        const item = INVENTORY_ITEMS[itemId.toUpperCase()];
        const stack = slot.dataset.stack || '1';

        const preview = this.inventoryModal.querySelector('.item-preview-icon');
        const name = this.inventoryModal.querySelector('.item-name');
        const buff = this.inventoryModal.querySelector('.stat-row.buff .stat-value');
        const effect = this.inventoryModal.querySelector('.stat-row.effect .stat-value');
        const description = this.inventoryModal.querySelector('.item-description');
        const consumeButton = this.inventoryModal.querySelector('.consume-button');

        name.textContent = `${item.name} (${stack})`;
        buff.textContent = item.buff;
        effect.textContent = item.effect;
        description.textContent = item.description;
        
        if (consumeButton) {
            consumeButton.disabled = false;
        }

        this.updatePreviewImage(preview, item);
    }

    updatePreviewImage(preview, item) {
        const img = new Image();
        img.src = item.path;
        img.onload = () => {
            const ctx = preview.getContext('2d');
            ctx.clearRect(0, 0, preview.width, preview.height);
            ctx.drawImage(img, 0, 0, preview.width, preview.height);
        };
    }

    consumeSelectedItem() {
        const selectedSlot = this.inventoryModal.querySelector('.inventory-slot.selected');
        if (!selectedSlot || !this.player) return;

        const itemId = selectedSlot.dataset.itemId;
        const item = INVENTORY_ITEMS[itemId.toUpperCase()];
        const stack = parseInt(selectedSlot.dataset.stack);

        this.createConsumeEffect(selectedSlot, item);
        applyItemEffect(this.player, itemId); 

        if (stack > 1) {
            selectedSlot.dataset.stack = stack - 1;
            selectedSlot.querySelector('.item-count').textContent = stack - 1;
            this.updateItemDetails(selectedSlot);
        } else {
            selectedSlot.innerHTML = '';
            selectedSlot.classList.add('empty');
            selectedSlot.classList.remove('selected');
            this.clearItemDetails();
        }
    }

    clearItemDetails() {
        const elements = {
            preview: this.inventoryModal.querySelector('.item-preview-icon'),
            name: this.inventoryModal.querySelector('.item-name'),
            buff: this.inventoryModal.querySelector('.stat-row.buff .stat-value'),
            effect: this.inventoryModal.querySelector('.stat-row.effect .stat-value'),
            description: this.inventoryModal.querySelector('.item-description'),
            consumeButton: this.inventoryModal.querySelector('.consume-button')
        };

        if (elements.preview) {
            const ctx = elements.preview.getContext('2d');
            ctx.clearRect(0, 0, elements.preview.width, elements.preview.height);
        }

        if (elements.name) elements.name.textContent = 'No item selected';
        if (elements.buff) elements.buff.textContent = '-';
        if (elements.effect) elements.effect.textContent = '-';
        if (elements.description) elements.description.textContent = 'Select an item to view its details.';
        if (elements.consumeButton) elements.consumeButton.disabled = true;
    }

    toggle() {
        if (!this.inventoryModal) return;
        
        if (!this._isVisible) { 
            this.show();
        } else {
            this.hide();
        }
        return this._isVisible;
    }

    show() {
        this.inventoryModal.style.display = 'flex';
        requestAnimationFrame(() => {
            this.inventoryModal.classList.add('show');
            
            
            const slots = Array.from(this.inventoryModal.querySelectorAll('.inventory-slot:not(.empty)'));
            if (slots.length > 0) {
                this.currentSelectedIndex = 0;
                this.selectSlotByIndex(slots);
            }
        });
        this._isVisible = true; 
    }

    hide() {
        this.inventoryModal.classList.remove('show');
        setTimeout(() => {
            this.inventoryModal.style.display = 'none';
        }, 300);
        this._isVisible = false; 
    }

    handleResize() {
        if (!this.inventoryModal) return;
        
        const canvasRect = this.gameCanvas.getBoundingClientRect();
        this.inventoryModal.style.width = `${window.innerWidth}px`;
        this.inventoryModal.style.height = `${window.innerHeight}px`;
    }
}
