export class PauseModal {
    constructor(game) {
        this.game = game;
        this.overlay = document.getElementById('pauseModal');
        this.continueButton = document.getElementById('continueButton');
        this.baseButton = document.getElementById('baseButton');
        this.restartButton = document.getElementById('restartButton');
        this.selectedIndex = 0;
        this.buttons = [this.continueButton, this.baseButton, this.restartButton];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.continueButton.addEventListener('click', () => this.continue());
        this.baseButton.addEventListener('click', () => this.backToBase());
        this.restartButton.addEventListener('click', () => this.restart());
    }

    handleKeyPress(e) {
        if (!this.isVisible()) return;

        switch(e.code) {
            case 'ArrowUp':
                this.selectPrevious();
                break;
            case 'ArrowDown':
                this.selectNext();
                break;
            case 'Enter':
                this.executeSelected();
                break;
        }
    }

    show() {
        this.overlay.style.display = 'flex';
        this.game.pause();
    }

    hide() {
        this.overlay.style.display = 'none';
        this.game.resume();
    }

    isVisible() {
        return this.overlay.style.display === 'flex';
    }

    selectNext() {
        this.buttons[this.selectedIndex].classList.remove('selected');
        this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
        this.buttons[this.selectedIndex].classList.add('selected');
    }

    selectPrevious() {
        this.buttons[this.selectedIndex].classList.remove('selected');
        this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
        this.buttons[this.selectedIndex].classList.add('selected');
    }

    executeSelected() {
        switch(this.selectedIndex) {
            case 0: this.continue(); break;
            case 1: this.backToBase(); break;
            case 2: this.restart(); break;
        }
    }

    continue() {
        this.hide();
    }

    backToBase() {
        localStorage.setItem('lastGameState', JSON.stringify({
            timestamp: Date.now()
        }));
        
        window.location.href = '../html/base.html';
    }

    restart() {
        this.hide();
        window.location.reload();
    }
}
