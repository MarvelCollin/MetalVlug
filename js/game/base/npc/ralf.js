import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

const SKILLS = {
    DOUBLE_SHOT: {
        id: 'double_shot',
        name: 'Double Shot',
        description: '30% chance to fire two bullets at once',
        effect: 'Bullet x2',
        damage: 0,
        cooldown: 3,
        icon: '🎯',
        level: 1,
        maxLevel: 5
    },
    DUAL_EXPLOSION: {
        id: 'dual_explosion',
        name: 'Dual Explosion',
        description: '25% chance to throw two bombs simultaneously',
        effect: 'Bomb x2',
        damage: 0,
        cooldown: 8,
        icon: '💣',
        level: 1,
        maxLevel: 5
    },
    CRITICAL_STRIKE: {
        id: 'critical_strike',
        name: 'Critical Strike',
        description: '20% chance to deal double damage',
        effect: 'Crit x2',
        damage: 0,
        cooldown: 5,
        icon: '⚡',
        level: 1,
        maxLevel: 5
    },
    POWER_SURGE: {
        id: 'power_surge',
        name: 'Power Surge',
        description: 'Increases attack damage by 40%',
        effect: 'ATK +40%',
        damage: 0,
        cooldown: 12,
        icon: '💪',
        level: 1,
        maxLevel: 5
    },
    IRON_SKIN: {
        id: 'iron_skin',
        name: 'Iron Skin',
        description: 'Temporary immunity to damage',
        effect: 'Immune 3s',
        damage: 0,
        cooldown: 15,
        icon: '🛡️',
        level: 1,
        maxLevel: 5
    },
    DEFENSIVE_STANCE: {
        id: 'defensive_stance',
        name: 'Defensive Stance',
        description: 'Reduces incoming damage by 50%',
        effect: 'DEF +50%',
        damage: 0,
        cooldown: 10,
        icon: '🔰',
        level: 1,
        maxLevel: 5
    },
    TREASURE_HUNTER: {
        id: 'treasure_hunter',
        name: 'Treasure Hunter',
        description: '35% chance for enemies to drop extra items',
        effect: 'Drop +35%',
        damage: 0,
        cooldown: 20,
        icon: '💎',
        level: 1,
        maxLevel: 5
    },
};

const UPGRADE_COSTS = {
    coins: 10000,
    medals: {
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6
    }
};

export class Ralf extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.isFlipped = false;
        this.activeSkills = this.getInitialSkills();
        this.selectedSkill = null;
        this.modal = null;
        this.loadSprites();
    }

    async loadSprites() {
        this.idleSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRalfIdle()
        );
        this.actionSprite = await Drawer.loadImage(() => 
            Assets.getPartnerRalfAction()
        );
        this.currentSprite = this.idleSprite;
    }

    getInitialSkills() {
        const allSkills = Object.values(SKILLS);
        const shuffled = allSkills.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    randomizeAllSkills() {
        const allSkills = Object.values(SKILLS);
        this.activeSkills = [];
        for(let i = 0; i < 3; i++) {
            const availableSkills = allSkills.filter(skill => 
                !this.activeSkills.some(active => active.id === skill.id)
            );
            const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            this.activeSkills.push(randomSkill);
        }
        this.updateSkillsDisplay();
    }

    selectSkill(skill) {
        this.selectedSkill = skill;
        const skillSlots = document.querySelectorAll('.skill-slot');
        skillSlots.forEach(slot => {
            slot.classList.remove('selected');
            if(slot.dataset.skillId === skill.id) {
                slot.classList.add('selected');
            }
        });
        this.updateSkillDetails();
    }

    updateSkillDetails() {
        const detailsContainer = document.querySelector('.skill-details');
        if (!detailsContainer || !this.selectedSkill) return;

        const currentLevel = this.selectedSkill.level || 1;
        const maxLevel = this.selectedSkill.maxLevel || 5;
        const isMaxLevel = currentLevel >= maxLevel;
        const medalCost = UPGRADE_COSTS.medals[currentLevel];

        detailsContainer.innerHTML = `
            <div class="selected-skill-icon">${this.selectedSkill.icon}</div>
            <div class="skill-name">${this.selectedSkill.name}</div>
            <div class="level-indicator">Level ${currentLevel}${isMaxLevel ? ' (MAX)' : ''}</div>
            <div class="skill-description">${this.selectedSkill.description}</div>
            <div class="skill-stats">
                <div style="margin-bottom: 8px;">
                    <span style="color: #ffd700">Effect:</span> ${this.selectedSkill.effect}
                </div>
                ${this.selectedSkill.damage ? `
                <div style="margin-bottom: 8px;">
                    <span style="color: #ffd700">Damage:</span> ${this.selectedSkill.damage}
                </div>
                ` : ''}
                <div>
                    <span style="color: #ffd700">Cooldown:</span> ${this.selectedSkill.cooldown}s
                </div>
            </div>
            ${!isMaxLevel ? `
                <div class="upgrade-cost">
                    <div class="cost-title">Upgrade Cost:</div>
                    <div class="cost-item">
                        <span class="coin-icon">🪙</span> ${UPGRADE_COSTS.coins}
                    </div>
                    <div class="cost-item">
                        <span class="medal-icon">🏅</span> ${medalCost}
                    </div>
                </div>
            ` : ''}
            <button class="replace-button" onclick="window.replaceSkill()">
                Replace Skill (🪙 10000 + 🏅 2)
            </button>
        `;
    }

    replaceRandomSkill() {
        const currentSkillIds = this.activeSkills.map(skill => skill.id);
        const availableSkills = Object.values(SKILLS).filter(
            skill => !currentSkillIds.includes(skill.id)
        );
        
        if (availableSkills.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.activeSkills.length);
            const newSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            this.activeSkills[randomIndex] = newSkill;
            this.updateSkillsDisplay();
        }
    }

    replaceSelectedSkill() {
        const gameCanvas = document.querySelector('#gameCanvas');
        const player = gameCanvas?.__gameInstance?.player;
        
        if (!this.selectedSkill || !player) return;
        
        
        if (player.coins < 10000 || player.medals < 2) {
            this.showNotification('Not enough resources!');
            return;
        }

        const currentSkillIds = this.activeSkills.map(skill => skill.id);
        const availableSkills = Object.values(SKILLS).filter(
            skill => !currentSkillIds.includes(skill.id)
        );
        
        if (availableSkills.length > 0) {
            
            player.coins -= 10000;
            player.medals -= 2;

            const newSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            const indexToReplace = this.activeSkills.findIndex(skill => skill.id === this.selectedSkill.id);
            
            if (indexToReplace !== -1) {
                this.activeSkills[indexToReplace] = {...newSkill, level: 1};
                this.selectedSkill = this.activeSkills[indexToReplace];
                this.updateSkillsDisplay();
                this.selectSkill(this.selectedSkill);
                this.showNotification('Skill replaced successfully!');
            }
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'skill-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 100);
    }

    updateSkillsDisplay() {
        const skillContainer = document.querySelector('.skill-container');
        if (!skillContainer) return;

        skillContainer.innerHTML = `
            <div class="skill-flow-container">
                <div class="player-node">👨‍🦰</div>
                <div class="skill-paths">
                    <div class="skill-path path-left"></div>
                    <div class="skill-path path-middle"></div>
                    <div class="skill-path path-right"></div>
                </div>
                <div class="skill-nodes">
                    ${this.activeSkills.map((skill, index) => `
                        <div class="skill-slot node-${index}" data-skill-id="${skill.id}">
                            <div class="skill-icon">${skill.icon}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const skillSlots = document.querySelectorAll('.skill-slot');
        skillSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                const skillId = slot.dataset.skillId;
                const skill = this.activeSkills.find(s => s.id === skillId);
                if (skill) this.selectSkill(skill);
            });
        });

        
        if (!this.selectedSkill && this.activeSkills.length > 0) {
            this.selectSkill(this.activeSkills[0]);
        }
    }

    showAllSkills() {
        const modal = document.getElementById('ralfModal');
        const modalContent = modal.querySelector('.ralf-modal');
        
        modalContent.innerHTML = `
            <div class="modal-title">All Available Skills</div>
            <button class="back-button">Back</button>
            <div class="all-skills-container">
                ${Object.values(SKILLS).map(skill => `
                    <div class="skill-slot">
                        <div class="skill-icon">${skill.icon}</div>
                        <div class="skill-info">
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-description">${skill.description}</div>
                            <div class="skill-stats">
                                ${skill.effect ? `<div><span class="effect-label">Effect:</span> ${skill.effect}</div>` : ''}
                                ${skill.damage ? `<div><span class="damage-label">Damage:</span> ${skill.damage}</div>` : ''}
                                <div><span class="cooldown-label">Cooldown:</span> ${skill.cooldown}s</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const backButton = modalContent.querySelector('.back-button');
        backButton.onclick = () => this.showMainView();
    }

    showMainView() {
        const modalContent = document.querySelector('.ralf-modal');
        modalContent.innerHTML = `
            <div class="modal-title">Ralf's Combat Skills</div>
            <button class="view-all-skills">List</button>
            <div class="ralf-modal-layout">
                <div class="skill-container"></div>
                <div class="skill-details"></div>
            </div>
        `;

        this.updateSkillsDisplay();
        
        const viewAllButton = modalContent.querySelector('.view-all-skills');
        viewAllButton.onclick = () => this.showAllSkills();
    }

    onInteract() {
        const modal = document.getElementById('ralfModal');
        if (modal) {
            modal.style.display = 'flex';
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
            
            this.showMainView();

            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    setTimeout(() => modal.style.display = 'none', 300);
                }
            };

            window.replaceSkill = () => {
                this.replaceSelectedSkill();
            };
        }
        console.log("Interacting with Ralf");
    }
}
