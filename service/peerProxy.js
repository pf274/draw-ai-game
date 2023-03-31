const { WebSocketServer } = require('ws');
const uuid = require('uuid');

function peerProxy(httpServer) {
    // Create a websocket object
    const wss = new WebSocketServer({ noServer: true });

    // Handle the protocol upgrade from HTTP to WebSocket
    httpServer.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    });

    // Keep track of all the connections so we can forward messages
    let connections = [];

    wss.on('connection', (ws) => {
        const newConnection = { id: uuid.v4(), alive: true, ws: ws };
        connections.push(newConnection);

        // Forward messages to everyone except the sender
        ws.on('message', function message(data) {
            connections.forEach((connection) => {
                if (connection.id !== newConnection.id) {
                    connection.ws.send(data);
                }
            });
        });

        // Remove the closed connection so we don't try to forward anymore
        ws.on('close', () => {
            connections.findIndex((o, i) => {
                if (o.id === newConnection.id) {
                    connections.splice(i, 1);
                    return true;
                }
                return false;
            });
        });

        // Respond to pong messages by marking the connection alive
        ws.on('pong', () => {
            newConnection.alive = true;
        });
    });

    // Keep active connections alive
    setInterval(() => {
        connections.forEach((connection) => {
            // Kill any connection that didn't respond to the ping last time
            if (!connection.alive) {
                connection.ws.terminate();
            } else {
                connection.alive = false;
                connection.ws.ping();
            }
        });
    }, 1000 * 10);
}

module.exports = { peerProxy };