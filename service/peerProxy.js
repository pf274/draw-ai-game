const { WebSocketServer } = require('ws');
const uuid = require('uuid');
const {EVENTS} = require('../src/Components/GameClass.js');
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
  let unregisteredConnections = [];
  let games = [];

  wss.on('connection', (ws) => {
    const connection = { id: uuid.v4(), alive: true, ws: ws };
    unregisteredConnections.push(connection);

    // Forward messages to everyone except the sender
    ws.on('message', function message(data) {
      let JSONData = JSON.parse(data.toString());
      if (JSONData.type == EVENTS.DeclareHost) {
        games.push({
          hostConnection: connection,
          participantConnections: [],
          hostParticipating: false,
        })
      } else {
        unregisteredConnections.forEach((c) => {
          if (c.id !== connection.id) {
            c.ws.send(data);
          }
        });
      }
    });

    // Remove the closed connection so we don't try to forward anymore
    ws.on('close', () => {
      unregisteredConnections.findIndex((o, i) => {
        if (o.id === connection.id) {
          unregisteredConnections.splice(i, 1);
          return true;
        }
      });
    });

    // Respond to pong messages by marking the connection alive
    ws.on('pong', () => {
      connection.alive = true;
    });
  });

  // Keep active connections alive
  setInterval(() => {
    unregisteredConnections.forEach((c) => {
      // Kill any connection that didn't respond to the ping last time
      if (!c.alive) {
        removeGameParticipant(c);
        c.ws.terminate();
      } else {
        c.alive = false;
        c.ws.ping();
      }
    });
  }, 10000);

  function removeGameParticipant(endedConnection) {
    for (let index = 0; index < games.length; index++) {
      const game = games[index];
      if (game.hostConnection.id == endedConnection.id) {
        // the host is no longer connected, so end game.
        for (const participant of game.participantConnections) {
          // end participant websockets
          participant.ws.terminate();
          unregisteredConnections.findIndex((o, i) => {
            if (o.id === participant.id) {
              unregisteredConnections.splice(i, 1);
              return true;
            }
          });
        }
        games.splice(index,1);
        index--;
      } else {
        // remove the participant who disconnected
        for (let participantIndex = 0; game.participantConnections.length; ) {
          const participantConnection = game.participantConnections[participantIndex];
          if (participantConnection.id == endedConnection.id) {
            game.participantConnections.splice(participantIndex, 1);
            participantConnection.ws.terminate();
          }
        }
      }
    }
  }
}


module.exports = { peerProxy };