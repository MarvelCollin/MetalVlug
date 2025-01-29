import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";
import Camera from "../../world/camera.js";

export class SilverSoldier extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.isFlipped = true;
        this.modal = document.getElementById('silverSoldierModal');
        this.missionData = {
            missions: [
                {
                    id: 'mission1',
                    title: 'Operation Desert Storm',
                    description: 'Infiltrate enemy territory and gather intel on their operations.',
                    image: '../assets/background/mission/mission.png'
                },
                {
                    id: 'mission2',
                    title: 'Urban Assault',
                    description: 'Clear the city of hostile forces and protect civilians.',
                    image: '../assets/background/mission/mission.png'
                }
            ],
            difficulties: [
                { 
                    id: 'easy', 
                    name: 'Easy',
                    description: 'Perfect for beginners. Enemies deal less damage and have reduced health.'
                },
                { 
                    id: 'normal', 
                    name: 'Normal',
                    description: 'Balanced difficulty for experienced players. Standard enemy stats.'
                },
                { 
                    id: 'hard', 
                    name: 'Hard',
                    description: 'Challenging mode with tougher enemies and limited resources.'
                },
                { 
                    id: 'asian', 
                    name: 'Asian', 
                    special: true,
                    description: 'Extreme difficulty. One hit = Game Over. Good luck!'
                }
            ]
        };
        
        this.arcadeMaps = [
            {
                id: 'desert',
                name: 'Desert Storm',
                description: 'Battle through endless waves in a scorching desert environment.',
                image: '../assets/background/arcade/arcade.png'
            },
            {
                id: 'city',
                name: 'Urban Combat',
                description: 'Fight through city ruins in intense urban warfare.',
                image: '../assets/background/arcade_2/arcade_2.png'
            }
        ];
        
        this.currentMapIndex = 0;
        this.currentMap = this.arcadeMaps[0].id;
        this.loadSprites();

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isInteracting) {
                this.onInteract();
            }
        });
    }

    async loadSprites() {
        this.idleSprite = await Drawer.loadImage(() => 
            Assets.getPartnerSilversoldierIdle()
        );
        this.actionSprite = await Drawer.loadImage(() => 
            Assets.getPartnerSilversoldierAction()
        );
        this.currentSprite = this.idleSprite;
    }

    update(player) {
        super.update(player);
        this.currentSprite = this.isInteracting ? this.actionSprite : this.idleSprite;
    }

    updateMenuPosition() {
        if (!this.menu) return;
        
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width;
        
        const screenX = (this.x - this.camera.x) / scale + rect.left;
        const screenY = (this.y - 150) / scale + rect.top;

        this.menu.style.left = `${screenX}px`;
        this.menu.style.top = `${screenY}px`;
    }

    generateModalContent() {
        const contentArea = this.modal.querySelector('.modal-content-area');
        contentArea.innerHTML = `
            <div class="content-section active" id="mission-content">
                <div class="mission-layout">
                    <div class="mission-panel">
                        ${this.missionData.missions.map(mission => `
                            <div class="mission-card" data-mission="${mission.id}">
                                <div class="mission-image">
                                    <img src="${mission.image}" alt="${mission.title}">
                                </div>
                                <div class="mission-info">
                                    <h3>${mission.title}</h3>
                                    <p>${mission.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="difficulty-panel">
                        <h3 class="panel-title">Select Difficulty</h3>
                        <div class="difficulty-selector">
                            ${this.missionData.difficulties.map(diff => `
                                <button class="difficulty-btn ${diff.special ? 'asian' : ''}" 
                                        data-difficulty="${diff.id}">${diff.name}</button>
                            `).join('')}
                        </div>
                        <div class="difficulty-description"></div>
                        <button class="start-button" style="display: none;">Start Mission</button>
                    </div>
                </div>
            </div>
            <div class="content-section" id="arcade-content">
                <div class="arcade-preview">
                    <div class="map-carousel">
                        <button class="map-nav prev">&lt;&lt;</button>
                        <div class="map-slides">
                            ${this.arcadeMaps.map((map, index) => `
                                <div class="map-slide ${index === 0 ? 'active' : ''}" data-map="${map.id}">
                                    ${this.createMapSlideHTML(map)}
                                </div>
                            `).join('')}
                        </div>
                        <button class="map-nav next">&gt;&gt;</button>
                        <div class="map-dots">
                            ${this.arcadeMaps.map((_, index) => `
                                <div class="map-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="map-info-container">
                        <p>${this.arcadeMaps[0].description}</p>
                    </div>
                    <div class="arcade-actions">
                        <button class="start-button">Start Arcade</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for mission selection
        const missionCards = this.modal.querySelectorAll('.mission-card');
        const difficultyPanel = this.modal.querySelector('.difficulty-panel');
        const startButton = this.modal.querySelector('.start-button');
        let selectedMission = null;

        missionCards.forEach(card => {
            card.addEventListener('click', () => {
                missionCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                selectedMission = card.dataset.mission;
                difficultyPanel.classList.add('active');
            });
        });

        // Add event listeners for difficulty selection
        const difficultyBtns = this.modal.querySelectorAll('.difficulty-btn');
        const difficultyDescription = this.modal.querySelector('.difficulty-description');
        let selectedDifficulty = null;

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedDifficulty = btn.dataset.difficulty;
                
                const diffData = this.missionData.difficulties.find(d => d.id === selectedDifficulty);
                difficultyDescription.textContent = diffData.description;
                
                // Show start button once difficulty is selected
                startButton.style.display = 'block';
            });
        });

        // Update start button click handler
        startButton.addEventListener('click', () => {
            if (selectedMission && selectedDifficulty) {
                window.location.href = `./game.html?mission=${selectedMission}&difficulty=${selectedDifficulty}`;
            }
        });
    }

    onInteract() {
        if (this.modal) {
            this.generateModalContent();
            this.modal.style.display = 'flex';
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
                this.setupMapCarousel();
            });

            let currentDifficulty = 'easy';
            let selectedModeContent = 'mission';

            const difficultyBtns = this.modal.querySelectorAll('.difficulty-btn');
            const difficultyDescription = this.modal.querySelector('.difficulty-description');
            
            const updateDifficulty = (newDifficulty) => {
                difficultyBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.difficulty === newDifficulty);
                });
                const selectedDifficulty = this.missionData.difficulties.find(d => d.id === newDifficulty);
                difficultyDescription.textContent = selectedDifficulty.description;
                currentDifficulty = newDifficulty;
            };

            difficultyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    updateDifficulty(btn.dataset.difficulty);
                });
            });

            const mapSlides = this.modal.querySelectorAll('.map-slide');
            const prevMapBtn = this.modal.querySelector('.map-nav.prev');
            const nextMapBtn = this.modal.querySelector('.map-nav.next');

            const updateMapSlide = () => {
                const slides = this.modal.querySelectorAll('.map-slide');
                const totalMaps = this.arcadeMaps.length;
                
                const prevIndex = (this.currentMapIndex - 1 + totalMaps) % totalMaps;
                const nextIndex = (this.currentMapIndex + 1) % totalMaps;
                
                slides.forEach((slide, index) => {
                    slide.style.transition = 'none';
                    slide.style.opacity = '0';
                    
                    if (index === this.currentMapIndex) {
                        slide.innerHTML = this.createMapSlideHTML(this.arcadeMaps[this.currentMapIndex]);
                        slide.style.transform = 'translateX(0)';
                        slide.style.opacity = '1';
                    } else if (index === prevIndex) {
                        slide.innerHTML = this.createMapSlideHTML(this.arcadeMaps[prevIndex]);
                        slide.style.transform = 'translateX(-100%)';
                    } else if (index === nextIndex) {
                        slide.innerHTML = this.createMapSlideHTML(this.arcadeMaps[nextIndex]);
                        slide.style.transform = 'translateX(100%)';
                    }
                    
                    requestAnimationFrame(() => {
                        slide.style.transition = 'all 0.5s ease';
                    });
                });

                this.currentMap = this.arcadeMaps[this.currentMapIndex].id;
            };

            prevMapBtn.addEventListener('click', () => {
                this.currentMapIndex = (this.currentMapIndex - 1 + this.arcadeMaps.length) % this.arcadeMaps.length;
                this.updateMapSlide();
            });

            nextMapBtn.addEventListener('click', () => {
                this.currentMapIndex = (this.currentMapIndex + 1) % this.arcadeMaps.length;
                this.updateMapSlide();
            });

            const modeButtons = this.modal.querySelectorAll('.modal-button');
            modeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const contentType = button.dataset.content;
                    selectedModeContent = contentType;
                    
                    modeButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    document.querySelectorAll('.content-section').forEach(section => {
                        section.classList.remove('active');
                    });
                    document.getElementById(`${contentType}-content`).classList.add('active');
                });
            });

            const setupModeButtons = (mode) => {
                const container = this.modal.querySelector(`#${mode}-content`);
                const startBtn = container.querySelector('.start-button');
                const params = mode === 'mission' ? 
                    { difficulty: currentDifficulty } : 
                    { map: this.currentMap };

                startBtn.addEventListener('click', () => {
                    window.location.href = `./game.html?mode=${mode}&${new URLSearchParams(params)}`;
                });
            };

            setupModeButtons('mission');
            setupModeButtons('arcade');

            updateDifficulty('easy');

            this.modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    this.closeModal();
                }
            });
        }
    }

    createMapSlideHTML(mapData) {
        return `
            <div class="map-title">${mapData.name}</div>
            <img src="${mapData.image}" alt="${mapData.name}">
        `;
    }

    updateMapSlide() {
        const slides = this.modal.querySelectorAll('.map-slide');
        const dots = this.modal.querySelectorAll('.map-dot');
        const infoContainer = this.modal.querySelector('.map-info-container');
        
        slides.forEach((slide, index) => {
            slide.className = 'map-slide';
            if (index === this.currentMapIndex) {
                slide.classList.add('active');
            }
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentMapIndex);
        });

        const currentMap = this.arcadeMaps[this.currentMapIndex];
        infoContainer.innerHTML = `<p>${currentMap.description}</p>`;

        this.currentMap = currentMap.id;
    }

    setupMapCarousel() {
        const prevMapBtn = this.modal.querySelector('.map-nav.prev');
        const nextMapBtn = this.modal.querySelector('.map-nav.next');
        const dots = this.modal.querySelectorAll('.map-dot');
        
        let isAnimating = false;

        const handleNavigation = (direction) => {
            if (isAnimating) return;
            
            isAnimating = true;
            
            if (direction === 'prev') {
                this.currentMapIndex = (this.currentMapIndex - 1 + this.arcadeMaps.length) % this.arcadeMaps.length;
            } else {
                this.currentMapIndex = (this.currentMapIndex + 1) % this.arcadeMaps.length;
            }
            
            this.updateMapSlide();
            
            setTimeout(() => {
                isAnimating = false;
            }, 400);
        };

        prevMapBtn.addEventListener('click', () => handleNavigation('prev'));
        nextMapBtn.addEventListener('click', () => handleNavigation('next'));

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (isAnimating || index === this.currentMapIndex) return;
                isAnimating = true;
                this.currentMapIndex = index;
                this.updateMapSlide();
                setTimeout(() => {
                    isAnimating = false;
                }, 400);
            });
        });

        window.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'flex' && 
                this.modal.querySelector('#arcade-content').classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    handleNavigation('prev');
                } else if (e.key === 'ArrowRight') {
                    handleNavigation('next');
                }
            }
        });

        this.updateMapSlide();
    }

    closeModal() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 500);
    }

    draw() {
        if (this.currentSprite?.images) {
            Drawer.drawToCanvas(
                this.currentSprite.images,
                this.x,
                this.y,
                this.currentSprite.delay,
                this.isFlipped,
                this.scale
            );
        }

        super.draw();
        
        if (this.modal && this.modal.style.display === 'flex') {
            this.updateMenuPosition();
        }
    }
}
