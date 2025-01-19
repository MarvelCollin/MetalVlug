import Player from '../player/player.js';

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.players = new Map();
        this.playerId = null;
    }

    connect() {
        try {
            // Make sure this matches the server port exactly
            this.ws = new WebSocket("https://smart-cups-kick.loca.lt");
            
            this.ws.onerror = (error) => {
                console.error('WebSocket connection error:', error);
            };
            
            this.ws.onopen = () => {
                console.log('Connected to game server');
            };

            this.ws.onclose = () => {
                console.log('Disconnected from game server');
            };

            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                switch(message.type) {
                    case 'PLAYER_ID':
                        this.playerId = message.id;
                        console.log(`Assigned player ID: ${this.playerId}`);
                        break;
                    case 'GAME_STATE':
                        this.updatePlayers(message.players);
                        break;
                }
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            // Try to reconnect after a delay
            setTimeout(() => this.connect(), 3000);
        }
    }

    updatePlayers(playerData) {
        Object.entries(playerData).forEach(([id, data]) => {
            if (id !== this.playerId.toString()) {
                if (!this.players.has(id)) {
                    const newPlayer = new Player(data.x, data.y);
                    this.players.set(id, newPlayer);
                }
                const player = this.players.get(id);
                Object.assign(player, data);
            }
        });

        this.players.forEach((_, id) => {
            if (!playerData[id]) {
                this.players.delete(id);
            }
        });
    }

    sendPlayerState(player) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'PLAYER_UPDATE',
                id: this.playerId,
                x: player.x,
                y: player.y,
                health: player.health,
                direction: player.lastDirection,
                state: player.state.constructor.name
            }));
        }
    }
}

export default new WebSocketClient();
