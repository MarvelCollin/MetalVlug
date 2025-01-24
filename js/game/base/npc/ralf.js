import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";

const SKILL_IMAGES = {
    PLAYER_NODE: "../assets/world/skills/player_node.png",
    COMMON: {
        BOMB: "../assets/world/skills/common/bomb.png",
        COOLDOWN: "../assets/world/skills/common/cooldown.png",
        HEALTH: "../assets/world/skills/common/health.png",
        LIFESTEAL: "../assets/world/skills/common/lifesteal.png",
        METALSLUG: "../assets/world/skills/common/metalslug.png"
    },
    RARE: {
        BOMB: "../assets/world/skills/rare/bomb.png",
        COOLDOWN: "../assets/world/skills/rare/cooldown.png",
        HEALTH: "../assets/world/skills/rare/health.png",
        LIFESTEAL: "../assets/world/skills/rare/lifesteal.png",
        METALSLUG: "../assets/world/skills/rare/metalslug.png"
    },
    UNIQUE: {
        BOMB: "../assets/world/skills/unique/bomb.png",
        COOLDOWN: "../assets/world/skills/unique/cooldown.png",
        HEALTH: "../assets/world/skills/unique/health.png",
        LIFESTEAL: "../assets/world/skills/unique/lifesteal.png",
        METALSLUG: "../assets/world/skills/unique/metalslug.png"
    }
};

const SKILLS = {
    
    COMMON_BOMB: {
        id: 'common_bomb',
        name: 'Basic Bomb',
        description: '20% chance to throw additional bomb',
        effect: 'Extra Bomb',
        damage: 20,
        cooldown: 8,
        icon: `<img src="${SKILL_IMAGES.COMMON.BOMB}" alt="Common Bomb" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'common'
    },
    COMMON_COOLDOWN: {
        id: 'common_cooldown',
        name: 'Quick Recovery',
        description: 'Reduces skill cooldowns by 15%',
        effect: 'CDR -15%',
        cooldown: 0,
        icon: `<img src="${SKILL_IMAGES.COMMON.COOLDOWN}" alt="Common Cooldown" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'common'
    },
    COMMON_HEALTH: {
        id: 'common_health',
        name: 'Vitality',
        description: 'Increases maximum health by 20%',
        effect: 'HP +20%',
        cooldown: 0,
        icon: `<img src="${SKILL_IMAGES.COMMON.HEALTH}" alt="Common Health" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'common'
    },
    COMMON_LIFESTEAL: {
        id: 'common_lifesteal',
        name: 'Basic Life Drain',
        description: 'Recover 10% of damage dealt as health',
        effect: 'Lifesteal 10%',
        cooldown: 12,
        icon: `<img src="${SKILL_IMAGES.COMMON.LIFESTEAL}" alt="Common Lifesteal" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'common'
    },
    COMMON_METALSLUG: {
        id: 'common_metalslug',
        name: 'Metal Power',
        description: 'Increases all damage by 15%',
        effect: 'DMG +15%',
        cooldown: 15,
        icon: `<img src="${SKILL_IMAGES.COMMON.METALSLUG}" alt="Common Metal Slug" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'common'
    },

    
    RARE_BOMB: {
        id: 'rare_bomb',
        name: 'Advanced Bomb',
        description: '30% chance to throw double bombs',
        effect: 'Double Bomb',
        damage: 30,
        cooldown: 8,
        icon: `<img src="${SKILL_IMAGES.RARE.BOMB}" alt="Rare Bomb" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'rare'
    },
    RARE_COOLDOWN: {
        id: 'rare_cooldown',
        name: 'Swift Recovery',
        description: 'Reduces skill cooldowns by 25%',
        effect: 'CDR -25%',
        cooldown: 0,
        icon: `<img src="${SKILL_IMAGES.RARE.COOLDOWN}" alt="Rare Cooldown" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'rare'
    },
    RARE_HEALTH: {
        id: 'rare_health',
        name: 'Enhanced Vitality',
        description: 'Increases maximum health by 35%',
        effect: 'HP +35%',
        cooldown: 0,
        icon: `<img src="${SKILL_IMAGES.RARE.HEALTH}" alt="Rare Health" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'rare'
    },
    RARE_LIFESTEAL: {
        id: 'rare_lifesteal',
        name: 'Life Drain',
        description: 'Recover 25% of damage dealt as health',
        effect: 'Lifesteal 25%',
        cooldown: 5,
        icon: `<img src="${SKILL_IMAGES.RARE.LIFESTEAL}" alt="Rare Lifesteal" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'rare'
    },
    RARE_METALSLUG: {
        id: 'rare_metalslug',
        name: 'Metal Slug Power',
        description: 'Increases all damage by 30%',
        effect: 'DMG +30%',
        cooldown: 12,
        icon: `<img src="${SKILL_IMAGES.RARE.METALSLUG}" alt="Rare Metal Slug" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'rare'
    },

    
    UNIQUE_BOMB: {
        id: 'unique_bomb',
        name: 'Supreme Bomber',
        description: '40% chance to throw triple bombs',
        effect: 'Triple Bomb',
        damage: 40,
        cooldown: 8,
        icon: `<img src="${SKILL_IMAGES.UNIQUE.BOMB}" alt="Unique Bomb" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'unique'
    },
    UNIQUE_COOLDOWN: {
        id: 'unique_cooldown',
        name: 'Master Recovery',
        description: 'Reduces skill cooldowns by 40%',
        effect: 'CDR -40%',
        cooldown: 0,
        icon: `<img src="${SKILL_IMAGES.UNIQUE.COOLDOWN}" alt="Unique Cooldown" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'unique'
    },
    UNIQUE_HEALTH: {
        id: 'unique_health',
        name: 'Supreme Vitality',
        description: 'Increases maximum health by 50%',
        effect: 'HP +50%',
        cooldown: 0,
        icon: `<img src="${SKILL_IMAGES.UNIQUE.HEALTH}" alt="Unique Health" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'unique'
    },
    UNIQUE_LIFESTEAL: {
        id: 'unique_lifesteal',
        name: 'Ultimate Drain',
        description: 'Recover 40% of damage dealt as health',
        effect: 'Lifesteal 40%',
        cooldown: 5,
        icon: `<img src="${SKILL_IMAGES.UNIQUE.LIFESTEAL}" alt="Unique Lifesteal" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'unique'
    },
    UNIQUE_METALSLUG: {
        id: 'unique_metalslug',
        name: 'Ultimate Metal Slug',
        description: 'Increases all damage by 50% and grants immunity',
        effect: 'DMG +50%, Immune',
        cooldown: 15,
        icon: `<img src="${SKILL_IMAGES.UNIQUE.METALSLUG}" alt="Unique Metal Slug" />`,
        level: 1,
        maxLevel: 5,
        rarity: 'unique'
    }
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


const RARITY_COLORS = {
    common: '#aaaaaa',
    rare: '#4488ff',
    unique: '#ffaa00'
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

        
        const rarityColor = RARITY_COLORS[this.selectedSkill.rarity];

        const currentLevel = this.selectedSkill.level || 1;
        const maxLevel = this.selectedSkill.maxLevel || 5;
        const isMaxLevel = currentLevel >= maxLevel;
        const medalCost = UPGRADE_COSTS.medals[currentLevel];

        detailsContainer.innerHTML = `
            <div class="selected-skill-icon" style="border-color: ${rarityColor}">${this.selectedSkill.icon}</div>
            <div class="skill-name" style="color: ${rarityColor}">${this.selectedSkill.name}</div>
            <div class="rarity-badge" style="background: ${rarityColor}">${this.selectedSkill.rarity.toUpperCase()}</div>
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
                <div class="player-node"><img src="../assets/skills/player_node.png" alt="Player" /></div>
                <div class="skill-paths">
                    <div class="skill-path path-left"></div>
                    <div class="skill-path path-middle"></div>
                    <div class="skill-path path-right"></div>
                </div>
                <div class="skill-nodes">
                    ${this.activeSkills.map((skill, index) => `
                        <div class="skill-slot node-${index} ${this.selectedSkill?.id === skill.id ? 'selected' : ''}" 
                             data-skill-id="${skill.id}">
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
            <div class="modal-inner-container">
                <div class="modal-title">All Available Skills</div>
                <button class="back-button">Back</button>
                <div class="all-skills-section">
                    <h3 class="rarity-title">Common Skills</h3>
                    <div class="all-skills-container">
                        ${Object.values(SKILLS)
                            .filter(skill => skill.rarity === 'common')
                            .map(skill => this.createSkillCard(skill)).join('')}
                    </div>
                    
                    <h3 class="rarity-title">Rare Skills</h3>
                    <div class="all-skills-container">
                        ${Object.values(SKILLS)
                            .filter(skill => skill.rarity === 'rare')
                            .map(skill => this.createSkillCard(skill)).join('')}
                    </div>
                    
                    <h3 class="rarity-title">Unique Skills</h3>
                    <div class="all-skills-container">
                        ${Object.values(SKILLS)
                            .filter(skill => skill.rarity === 'unique')
                            .map(skill => this.createSkillCard(skill)).join('')}
                    </div>
                </div>
            </div>
        `;

        const backButton = modalContent.querySelector('.back-button');
        backButton.onclick = () => this.showMainView();
    }

    createSkillCard(skill) {
        return `
            <div class="skill-slot" data-rarity="${skill.rarity}">
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-tooltip">
                    <div class="skill-name">${skill.name}</div>
                    <div class="rarity-badge">${skill.rarity.toUpperCase()}</div>
                    <div class="skill-description">${skill.description}</div>
                    <div class="skill-stats">
                        ${skill.effect ? `<div><span class="effect-label">Effect:</span> ${skill.effect}</div>` : ''}
                        ${skill.damage ? `<div><span class="damage-label">Damage:</span> ${skill.damage}</div>` : ''}
                        <div><span class="cooldown-label">Cooldown:</span> ${skill.cooldown}s</div>
                    </div>
                </div>
            </div>
        `;
    }

    showMainView() {
        const modalContent = document.querySelector('.ralf-modal');
        modalContent.innerHTML = `
            <div class="modal-inner-container">
                <div class="modal-title">Ralf's Combat Skills</div>
                <button class="view-all-skills">List</button>
                <div class="ralf-modal-layout">
                    <div class="skill-container"></div>
                    <div class="skill-details"></div>
                </div>
            </div>
        `;

        this.updateSkillsDisplay();
        
        
        if (!this.selectedSkill && this.activeSkills.length > 0) {
            this.selectSkill(this.activeSkills[0]);
        } else if (this.selectedSkill) {
            
            const currentSkill = this.activeSkills.find(skill => skill.id === this.selectedSkill.id);
            if (currentSkill) {
                this.selectSkill(currentSkill);
            } else {
                
                this.selectSkill(this.activeSkills[0]);
            }
        }
        
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
