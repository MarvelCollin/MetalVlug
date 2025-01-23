import { INVENTORY_ITEMS, applyItemEffect } from './items.js';

export class Inventory {
    constructor(gameCanvas) {
        this.gameCanvas = gameCanvas;
        this.inventoryModal = null;
        this.isVisible = false;
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
        const img = new Image();
        img.src = item.path;
        img.className = 'consume-effect';
        
        const slotRect = slot.getBoundingClientRect();

        img.style.position = 'absolute';
        img.style.left = `${slotRect.left}px`;
        img.style.top = `${slotRect.top}px`;
        img.style.width = `${slotRect.width}px`;
        img.style.height = `${slotRect.height}px`;

        document.body.appendChild(img);

        for (let i = 0; i < 20; i++) {
            this.createParticle(slotRect);
        }

        img.style.animation = 'consumeAnimation 0.5s ease-out forwards';
        setTimeout(() => img.remove(), 500);
    }

    createParticle(rect) {
        const particle = document.createElement('div');
        particle.className = 'consume-particles';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);

        document.body.appendChild(particle);
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
        ], {
            duration: 500,
            easing: 'ease-out'
        });

        setTimeout(() => particle.remove(), 500);
    }

    initialize() {
        this.inventoryModal = document.querySelector('.inventory-modal');
        this.setupSlots();
        this.setupEventListeners();
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
    }

    handleSlotClick(slot) {
        if (slot.classList.contains('empty')) return;

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

        this.updatePreviewImage(preview, item, stack);
    }

    updatePreviewImage(preview, item, stack) {
        const img = new Image();
        img.src = item.path;
        img.onload = () => {
            const ctx = preview.getContext('2d');
            ctx.clearRect(0, 0, preview.width, preview.height);
            ctx.drawImage(img, 0, 0, preview.width, preview.height);

            if (parseInt(stack) > 1) {
                this.drawStackCount(ctx, stack, preview.width, preview.height);
            }
        };
    }

    drawStackCount(ctx, stack, width, height) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = stack.toString();
        const x = width - 20;
        const y = height - 10;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }

    consumeSelectedItem() {
        const selectedSlot = this.inventoryModal.querySelector('.inventory-slot.selected');
        if (!selectedSlot) return;

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
        
        if (!this.isVisible) {
            this.show();
        } else {
            this.hide();
        }
    }

    show() {
        this.inventoryModal.style.display = 'flex';
        requestAnimationFrame(() => {
            this.inventoryModal.classList.add('show');
        });
        this.isVisible = true;
    }

    hide() {
        this.inventoryModal.classList.remove('show');
        setTimeout(() => {
            this.inventoryModal.style.display = 'none';
        }, 300);
        this.isVisible = false;
    }

    handleResize() {
        if (!this.inventoryModal) return;
        
        const canvasRect = this.gameCanvas.getBoundingClientRect();
        this.inventoryModal.style.width = `${window.innerWidth}px`;
        this.inventoryModal.style.height = `${window.innerHeight}px`;
    }
}
