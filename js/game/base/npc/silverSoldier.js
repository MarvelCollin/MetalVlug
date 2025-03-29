import { BaseNPC } from "./baseNPC.js";
import Assets from "../../helper/assets.js";
import Drawer from "../../helper/drawer.js";
import Camera from "../../world/camera.js";

export class SilverSoldier extends BaseNPC {
    constructor(x, y, camera) {
        super(x, y, camera, 4);
        this.isFlipped = true;
        this.modal = document.getElementById('silverSoldierModal');
        
        this.difficulties = [
            { 
                id: 'easy', 
                name: 'Easy',
                description: 'Perfect for beginners. Enemies deal less damage and have reduced health.',
                image: '../assets/background/difficulty/easy.jpg'
            },
            { 
                id: 'normal', 
                name: 'Normal',
                description: 'Balanced difficulty for experienced players. Standard enemy stats.',
                image: '../assets/background/difficulty/normal.jpg'
            },
            { 
                id: 'hard', 
                name: 'Hard',
                description: 'Challenging mode with tougher enemies and limited resources.',
                image: '../assets/background/difficulty/hard.jpg'
            }
        ];

        this.difficultyImages = {};
        this.difficulties.forEach(diff => {
            const img = new Image();
            img.src = diff.image;
            this.difficultyImages[diff.id] = img;
        });

        this.locations = [
            {
                id: 'mission1',
                type: 'mission',
                title: 'Operation Desert Storm',
                description: 'Infiltrate enemy territory and gather intel on their operations.',
                position: { x: 200, y: 300 },
                image: '../assets/background/mission/mission.png',
                connections: ['mission2', 'arcade1']
            },
            {
                id: 'mission2',
                type: 'mission',
                title: 'Urban Assault',
                description: 'Clear the city of hostile forces and protect civilians.',
                position: { x: 600, y: 400 },
                image: '../assets/background/mission/mission2.png',
                connections: ['mission1', 'arcade2']
            },
            {
                id: 'arcade1',
                type: 'arcade',
                title: 'Desert Arena',
                description: 'Endless waves of enemies in a desert environment.',
                position: { x: 400, y: 350 },
                image: '../assets/background/arcade/arcade.png',
                connections: ['mission1']
            },
            {
                id: 'arcade2',
                type: 'arcade',
                title: 'Urban Warfare',
                description: 'Survive waves of enemies in urban ruins.',
                position: { x: 800, y: 300 },
                image: '../assets/background/arcade_2/arcade_2.png',
                connections: ['mission2']
            }
        ];
        this.currentMapIndex = 0;
        this.currentMap = this.locations[0].id;
        this.loadSprites();

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isInteracting) {
                this.onInteract();
            }
        });

        this.mapCanvas = document.createElement('canvas');
        this.mapCtx = this.mapCanvas.getContext('2d');
        this.mapImage = new Image();
        this.mapImage.src = '../assets/background/map/map.png';
        this.mapScale = 1;
        this.mapOffset = { x: 0, y: 0 };
        this.baseMapWidth = 1024;
        this.baseMapHeight = 576;
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.selectedLocation = null;
        this.locationHovered = null;
        this.pulsePhase = 0;
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
            <div class="game-map-container">
                <div class="game-map">
                    ${this.generateLocations()}
                    ${this.generateConnections()}
                </div>
                <div class="difficulty-selector-panel">
                    <h3>Select Difficulty</h3>
                    <div class="difficulty-options">
                        ${this.difficulties.map(diff => `
                            <div class="difficulty-option" data-difficulty="${diff.id}">
                                <div class="difficulty-preview">
                                    <img src="${diff.image}" alt="${diff.name}">
                                    <div class="difficulty-name">${diff.name}</div>
                                </div>
                                <div class="difficulty-description">${diff.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupMapInteractions();
    }

    generateLocations() {
        return this.locations.map(location => `
            <div class="map-location ${location.type}"
                 data-location="${location.id}"
                 data-type="${location.type}"
                 style="left: ${location.position.x}px; top: ${location.position.y}px">
            </div>
        `).join('');
    }

    generateConnections() {
        const connections = [];
        this.locations.forEach(location => {
            if (location.connections) {
                location.connections.forEach(targetId => {
                    const target = this.locations.find(l => l.id === targetId);
                    if (target) {
                        const angle = Math.atan2(
                            target.position.y - location.position.y,
                            target.position.x - location.position.x
                        ) * 180 / Math.PI;
                        
                        const distance = Math.sqrt(
                            Math.pow(target.position.x - location.position.x, 2) +
                            Math.pow(target.position.y - location.position.y, 2)
                        );
                        
                        const connection = `
                            <div class="mission-path"
                                 data-from="${location.id}"
                                 data-to="${targetId}"
                                 style="
                                    left: ${location.position.x}px;
                                    top: ${location.position.y}px;
                                    width: ${distance}px;
                                    transform: rotate(${angle}deg);
                                 ">
                            </div>
                        `;
                        connections.push(connection);
                    }
                });
            }
        });
        return connections.join('');
    }

    setupMapInteractions() {
        this.mapCanvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
        });

        this.mapCanvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                this.mapOffset.x += dx;
                this.mapOffset.y += dy;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.drawMap();
            }
        });

        this.mapCanvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.mapCanvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY) * 0.1;
            const newScale = Math.max(0.5, Math.min(2, this.mapScale + delta));
            
            const rect = this.mapCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.mapOffset.x = x - (x - this.mapOffset.x) * (newScale / this.mapScale);
            this.mapOffset.y = y - (y - this.mapOffset.y) * (newScale / this.mapScale);
            
            this.mapScale = newScale;
            this.drawMap();
        });

        this.mapCanvas.addEventListener('mousemove', (e) => {
            const rect = this.mapCanvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.mapOffset.x) / this.mapScale;
            const y = (e.clientY - rect.top - this.mapOffset.y) / this.mapScale;

            this.locationHovered = null;
            this.locations.forEach(location => {
                const dx = x - location.position.x;
                const dy = y - location.position.y;
                if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                    this.locationHovered = location.id;
                }
            });

            this.drawMap();
        });

        this.mapCanvas.addEventListener('click', (e) => {
            if (this.locationHovered) {
                const prevSelected = this.selectedLocation;
                this.selectedLocation = this.locationHovered;
                
                if (prevSelected !== this.selectedLocation) {
                    this.selectedDifficulty = 'easy';
                }
                
                this.drawMap();
            }
        });

        this.mapCanvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.selectedLocation) {
                const difficulties = ['easy', 'normal', 'hard', 'asian'];
                const currentIndex = difficulties.indexOf(this.selectedDifficulty || 'easy');
                this.selectedDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
                this.drawMap();
            }
        });

        const difficultyOptions = this.modal.querySelectorAll('.difficulty-option');
        difficultyOptions.forEach(option => {
            option.addEventListener('click', () => {
                if (this.selectedLocation && 
                    this.locations.find(l => l.id === this.selectedLocation)?.type === 'mission') {
                    difficultyOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    this.selectedDifficulty = option.dataset.difficulty;
                    this.drawMap();
                }
            });
        });
    }

    drawMap() {
        if (!this.mapCanvas || !this.mapCtx) return;
        
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const aspectRatio = this.baseMapWidth / this.baseMapHeight;
        
        let canvasWidth = containerWidth;
        let canvasHeight = containerWidth / aspectRatio;
        
        if (canvasHeight > containerHeight) {
            canvasHeight = containerHeight;
            canvasWidth = containerHeight * aspectRatio;
        }
        
        this.mapCanvas.width = canvasWidth;
        this.mapCanvas.height = canvasHeight;
        
        const scaleFactor = canvasWidth / this.baseMapWidth;
        
        this.mapCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        this.mapCtx.save();
        this.mapCtx.translate(this.mapOffset.x, this.mapOffset.y);
        this.mapCtx.scale(this.mapScale * scaleFactor, this.mapScale * scaleFactor);
        
        this.mapCtx.drawImage(this.mapImage, 0, 0, this.baseMapWidth, this.baseMapHeight);
        
        this.locations.forEach(location => {
            if (location.connections) {
                location.connections.forEach(targetId => {
                    const target = this.locations.find(l => l.id === targetId);
                    if (target) {
                        this.drawConnection(location, target);
                    }
                });
            }
        });
        
        this.locations.forEach(location => {
            this.drawLocation(location);
        });
        
        this.mapCtx.restore();
    }

    drawConnection(from, to) {
        if (from.type !== 'mission') return;
        
        this.mapCtx.beginPath();
        this.mapCtx.moveTo(from.position.x, from.position.y);
        this.mapCtx.lineTo(to.position.x, to.position.y);
        this.mapCtx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        this.mapCtx.lineWidth = 2;
        this.mapCtx.stroke();
    }

    drawLocation(location) {
        const size = 20;
        const x = location.position.x;
        const y = location.position.y;
        const isSelected = location.id === this.selectedLocation;
        const isHovered = location.id === this.locationHovered;

        if (isSelected && location.type === 'mission') {
            this.locations.forEach(connectedLoc => {
                if (location.connections.includes(connectedLoc.id)) {
                    this.drawConnectionGlow(location, connectedLoc);
                }
            });
        }

        this.mapCtx.save();
        this.mapCtx.translate(x, y);

        const glowSize = size + 8 + Math.sin(this.pulsePhase) * 3;
        const gradient = this.mapCtx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        
        if (location.type === 'mission') {
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
            gradient.addColorStop(1, 'transparent');
            
            const drawHexagon = (size) => {
                this.mapCtx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = ((i * Math.PI) / 3) + (Math.PI / 6);
                    const xPos = size * Math.cos(angle);
                    const yPos = size * Math.sin(angle);
                    if (i === 0) {
                        this.mapCtx.moveTo(xPos, yPos);
                    } else {
                        this.mapCtx.lineTo(xPos, yPos);
                    }
                }
                this.mapCtx.closePath();
            };

            drawHexagon(glowSize);
            this.mapCtx.fillStyle = gradient;
            this.mapCtx.fill();

            drawHexagon(size);
            this.mapCtx.fillStyle = '#ffd700';
            this.mapCtx.strokeStyle = isSelected || isHovered 
                ? '#ffffff' 
                : 'rgba(255, 215, 0, 0.6)';
            this.mapCtx.lineWidth = isSelected ? 3 : 2;
            this.mapCtx.fill();
            this.mapCtx.stroke();

            drawHexagon(size * 0.6);
            this.mapCtx.strokeStyle = '#000';
            this.mapCtx.lineWidth = 1;
            this.mapCtx.stroke();
        } else {
            gradient.addColorStop(0, 'rgba(255, 0, 85, 0.4)');
            gradient.addColorStop(1, 'transparent');

            const drawDiamond = (size) => {
                this.mapCtx.beginPath();
                this.mapCtx.moveTo(0, -size);
                this.mapCtx.lineTo(size, 0);
                this.mapCtx.lineTo(0, size);
                this.mapCtx.lineTo(-size, 0);
                this.mapCtx.closePath();
            };

            drawDiamond(glowSize);
            this.mapCtx.fillStyle = gradient;
            this.mapCtx.fill();

            drawDiamond(size);
            this.mapCtx.fillStyle = '#ff0055';
            this.mapCtx.strokeStyle = isSelected || isHovered ? '#ffffff' : 'rgba(255, 0, 85, 0.6)';
            this.mapCtx.lineWidth = isSelected ? 3 : 2;
            this.mapCtx.fill();
            this.mapCtx.stroke();

            drawDiamond(size * 0.6);
            this.mapCtx.strokeStyle = '#000';
            this.mapCtx.lineWidth = 1;
            this.mapCtx.stroke();
        }

        if (location.type === 'mission') {
            const difficulty = this.selectedDifficulty || 'easy';
            const difficultySymbols = {
                'easy': 'I',
                'normal': 'II',
                'hard': 'III',
                'asian': 'IV'
            };
            
            const indicatorSize = size * 0.4;
            
            this.mapCtx.fillStyle = '#ffd700';
            this.mapCtx.font = `${indicatorSize}px "Metal Slug Latino"`;
            this.mapCtx.textAlign = 'center';
            this.mapCtx.textBaseline = 'middle';
            this.mapCtx.fillText(difficultySymbols[difficulty], 0, 0);
        }

        this.mapCtx.restore();

        const fontSize = Math.round(12 / this.mapScale);
        const text = location.title;
        this.mapCtx.font = `${fontSize}px "Metal Slug Latino"`;
        const textMetrics = this.mapCtx.measureText(text);
        const textWidth = textMetrics.width;
        const padding = 6;
        const textY = y + size + fontSize + 3;

        this.mapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.mapCtx.fillRect(
            x - textWidth/2 - padding,
            textY - fontSize,
            textWidth + padding * 2,
            fontSize + padding
        );

        this.mapCtx.strokeStyle = location.type === 'mission' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 0, 85, 0.3)';
        this.mapCtx.lineWidth = 1.5;

        this.mapCtx.fillStyle = location.type === 'mission' ? '#ffd700' : '#ff0055';
        this.mapCtx.textAlign = 'center';
        this.mapCtx.fillText(text, x, textY);

        this.pulsePhase += 0.05;
    }

    drawConnectionGlow(from, to) {
        const gradient = this.mapCtx.createLinearGradient(
            from.position.x, from.position.y,
            to.position.x, to.position.y
        );
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        this.mapCtx.beginPath();
        this.mapCtx.moveTo(from.position.x, from.position.y);
        this.mapCtx.lineTo(to.position.x, to.position.y);
        this.mapCtx.strokeStyle = gradient;
        this.mapCtx.lineWidth = 4;
        this.mapCtx.stroke();
    }

    onInteract() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.modal.querySelector('.modal-content-area').appendChild(this.mapCanvas);
            this.drawMap();
            this.setupMapInteractions();
            requestAnimationFrame(() => this.modal.classList.add('show'));
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
            setTimeout(() => {
                this.modal.style.display = 'none';
            }, 500);
        }
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
