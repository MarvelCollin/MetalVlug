const WebSocket = require('ws');
const http = require('http');
const port = 8080;  // Make sure this matches client port

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('WebSocket server is running');
});

const wss = new WebSocket.Server({ server });

const players = new Map();
let nextPlayerId = 1;

wss.on('connection', (ws) => {
    const playerId = nextPlayerId++;
    players.set(playerId, {
        x: 100,
        y: 300,
        health: 100
    });

    ws.send(JSON.stringify({
        type: 'PLAYER_ID',
        id: playerId
    }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'PLAYER_UPDATE') {
            players.set(data.id, {
                x: data.x,
                y: data.y,
                health: data.health,
                direction: data.direction,
                state: data.state
            });
            broadcastGameState();
        }
    });

    ws.on('close', () => {
        players.delete(playerId);
        broadcastGameState();
        console.log(`Player ${playerId} disconnected`);
    });
});

wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
});

function broadcastGameState() {
    const gameState = {
        type: 'GAME_STATE',
        players: Object.fromEntries(players)
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gameState));
        }
    });
}

server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
}).on('error', (error) => {
    console.error('Server Error:', error);
});
