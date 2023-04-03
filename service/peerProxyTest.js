const { WebSocketServer } = require('ws');
const uuid = require('uuid');
const EVENTS = {
  GameEnd: "game_end",        // the host disconnects or ends the game
  GameStart: "game_start",    // the host starts the game
  DeclareJoin: "declare_join",      // a user joins a game
  DeclareHost: "declare_host",      // a user declares themselves as host
  DeclareParticipate: "host_participating",
  GameLeave: "leave_game",    // a user leaves a game (not the host)
}

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
  let unregisteredConnections = {};
  let games = {};

  wss.on('connection', (ws) => {
    const connection = { id: uuid.v4(), alive: true, ws: ws };
    // each connection is unregistered until it joins or hosts a game.
    unregisteredConnections[connection.id] = connection;

    // Forward messages to everyone except the sender
    ws.on('message', function message(data) {
      let JSONData = JSON.parse(data.toString());
      if (connection.id in unregisteredConnections == true) {
        // attempt registration
        if (JSONData.type == EVENTS.DeclareJoin) {
          let gameCode = JSONData.value?.gameCode;
          if ((gameCode in games == true) && gameCode) {
            if (connection.id in games[gameCode].participants == false) {
              // join a game
              games[gameCode].participants[connection.id] = connection;
              // delete from unregisteredConnections
              delete unregisteredConnections[connection.id];
            }
          }
        } else if (JSONData.type == EVENTS.DeclareHost) {
          let gameCode = JSONData.value?.gameCode;
          if ((gameCode in games == false) && gameCode) {
            // start a new game
            games[gameCode] = {
              host: connection,
              participants: {}
            }
            // delete from unregisteredConnections
            delete unregisteredConnections[connection.id];
          }
        }
      }
      let registered = (connection.id in unregisteredConnections);
      if (!registered) {
        Object.values(unregisteredConnections).forEach((otherConnection) => {
          if (otherConnection.id !== connection.id) {
            otherConnection.ws.send(data);
          }
        });
      } else {
        let myGame = Object.values(games).filter((game) => {
          if (game?.host?.id == connection.id) {
            return true;
          } else if (connection.id in game.participants) {
            return true;
          }
          return false;
        })[0];
        let isHost = (myGame.host.id == connection.id);

        switch (JSONData.type) {
          case EVENTS.GameStart:
            // you must be a host to start a game.
            if (isHost) {
              for (const participant of myGame.participants) {
                participant.ws.send(data);
              }
            }
          break;
          case EVENTS.GameLeave:
            if (isHost) {
              for (const participant of myGame.participants) {
                participant.ws.send(data);
              }
            } else {
              if (myGame?.host) {
                myGame.host.ws.send(data);
              }
              for (const participant of myGame.participants) {
                if (participant.id !== connection.id) participant.ws.send(data);
              }
            }
          break;
          case EVENTS.GameEnd:
            // you must be the host to end the game
            if (isHost) {
              for (const participant of myGame.participants) {
                participant.ws.send(data);
              }
            }
          break;
        }
      }

    });

    // Remove the closed connection so we don't try to forward anymore
    ws.on('close', () => {
      if (connection.id in unregisteredConnections) {
        // unregistered
        delete unregisteredConnections[connection.id];
      } else {
        // registered
        let myGame = Object.values(games).filter((game) => {
          if (game?.host?.id == connection.id) {
            return true;
          } else if (connection.id in game.participants) {
            return true;
          }
          return false;
        })[0];
        let isHost = (myGame.host.id == connection.id);
        if (isHost) {
          delete games[myGame].host;
        } else {
          delete games[myGame].participants[connection.id];
        }
      }
      // registered
      for (const game of Object.values(games)) {
        if (connection.id in game.participants) {
          // remove as a participant
          delete game.participants[connection.id];
        } else if (game.host.id == connection.id) {
          // end game
          game.host = {};
          game.status = "ended";
        }
      }
    });

    // Respond to pong messages by marking the connection alive
    ws.on('pong', () => {
      connection.alive = true;
    });
  });

  // Keep active connections alive
  setInterval(() => {
    Object.values(unregisteredConnections).forEach((c) => {
      // Kill any connection that didn't respond to the ping last time
      if (!c.alive) {
        c.ws.terminate();
      } else {
        c.alive = false;
        c.ws.ping();
      }
    });
    for (const game of Object.values(games)) {
      let allGameConnections = [game.host, ...Object.values(game.participants)];
      for (const connection of allGameConnections) {
        if (!connection.alive) {
          connection.ws.terminate();
        } else {
          connection.alive = false;
          connection.ws.ping();
        }
      }
    }
  }, 10000);
}

module.exports = { peerProxy };