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
        const thisConnection = { id: uuid.v4(), alive: true, ws: ws };
        connections.push(thisConnection);

        // Forward messages to everyone except the sender
        ws.on('message', function message(data) {
            connections.forEach((connection) => {
                if (connection.id !== thisConnection.id) {
                    connection.ws.send(data);
                }
            });
        });

        // Remove the closed connection so we don't try to forward anymore
        ws.on('close', () => {
            connections.findIndex((otherConnection, index) => {
                if (otherConnection.id === thisConnection.id) {
                    connections.splice(index, 1);
                    return true;
                }
                return false;
            });
        });

        // Respond to pong messages by marking the connection alive
        ws.on('pong', () => {
            thisConnection.alive = true;
        });
    });

    // Keep active connections alive
    let connection_check_interval = 1000 * 10;
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
    }, connection_check_interval);
}

module.exports = { peerProxy };