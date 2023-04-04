const { WebSocketServer } = require('ws');
const DB = require('./database.js');
const uuid = require('uuid');
const EVENTS = {
  GameEnd: "game_end",        // the host disconnects or ends the game
  GameStart: "game_start",    // the host starts the game
  DeclareJoin: "declare_join",      // a user joins a game
  DeclareHost: "declare_host",      // a user declares themselves as host
  DeclareParticipate: "host_participating",
  GameLeave: "leave_game",    // a user leaves a game (not the host)
}

async function getAllGames() {
  DB.getGames().then((games) => {
    let allGames = {};
    for (const game of games) {
      allGames[game.id] = game;
    }
    return allGames;
  })
}

async function getMyGame(connectionId) {
  let allGames = getAllGames();
  let myGame = Object.values(allGames).filter((game) => {
    if (game?.host?.id == connectionId) {
      return true;
    } else {
      for (const participant in game.participants) {
        if (participant.id == connectionId) {
          return true;
        }
      }
    }
    return false;
  })[0];
  return myGame;
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
  getAllGames().then((response) => games = response);

  wss.on('connection', (ws) => {
    const connection = { id: uuid.v4(), alive: true, ws: ws };
    // each connection is unregistered until it joins or hosts a game.
    unregisteredConnections[connection.id] = connection;

    async function attemptRegistration(JSONData) {
      if (JSONData.type == EVENTS.DeclareJoin) {
        let gameCode = JSONData.value?.gameCode;
        let games = await getAllGames();
        if ((gameCode in games == true) && gameCode) {
          if (connection.id in games[gameCode].participants == false) {
            // join a game
            let participantsObj = games[gameCode].participants;
            participantsObj[connection.id] = connection;
            await DB.joinGame(gameCode, connection);

            // delete from unregisteredConnections
            delete unregisteredConnections[connection.id];
            connection.ws.send(JSON.stringify({...(await DB.getGame(gameCode)), msg:"joined game"}));
          }
        }
      } else if (JSONData.type == EVENTS.DeclareHost) {
        let gameCode = JSONData.value?.gameCode;
        games = await getAllGames();
        if ((gameCode in games == false) && gameCode) {
          // start a new game
          await DB.hostGame({
            id: gameCode,
            host: connection,
            participants: []
          })
          // delete from unregisteredConnections
          delete unregisteredConnections[connection.id];
        }
      }
    }
    // Forward messages to everyone except the sender
    ws.on('message', async function message(data) {
      try {
        let JSONData = JSON.parse(data.toString());
        if (connection.id in unregisteredConnections == true) {
          // attempt registration
          await attemptRegistration(JSONData);
        }
        let registered = (connection.id in unregisteredConnections);
        if (!registered) {
          // send your data to the other connections
          // Object.values(unregisteredConnections).forEach((otherConnection) => {
          //   if (otherConnection.id !== connection.id) {
          //     otherConnection.ws.send(data);
          //   }
          // });
        } else {
          let myGame = await getMyGame(connection.id);
          if (!myGame) {
            console.log("Connection is not in a game nor unregistered.");
            return;
          }
          let isHost = (myGame?.host?.id == connection.id);
  
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
      } catch (err) {
        console.log(err);
      }
    });

    // Remove the closed connection so we don't try to forward anymore
    ws.on('close', async () => {
      if (connection.id in unregisteredConnections) {
        // unregistered
        delete unregisteredConnections[connection.id];
      } else {
        // registered
        let myGame = await getMyGame(connection.id);
        let isHost = (myGame?.host?.id == connection.id);
        if (isHost) {
          await DB.endGame(myGame?.id);
        } else {
          await DB.leaveGame(myGame?.id, connection);
        }
      }
    });

    // Respond to pong messages by marking the connection alive
    ws.on('pong', async () => {
      let myGame = await getMyGame(connection.id);
      DB.keepConnectionAlive(myGame.id, connection);
      connection.alive = true;
    });
  });

  // Keep active connections alive
  setInterval(async () => {
    try {
      Object.values(unregisteredConnections).forEach((c) => {
        // Kill any connection that didn't respond to the ping last time
        if (!c.alive) {
          c.ws.terminate();
        } else {
          c.alive = false;
          c.ws.ping();
        }
      });
      let allGames = await getAllGames();
      for (const game of Object.values(allGames)) {
        let newGameData = JSON.parse(JSON.stringify(game));
        if (!game.host.alive) {
          DB.endGame(game.id);
          game.host.ws.terminate();
        } else {
          game.host.alive = false;
          game.host.ws.ping();
        }
        for (const participant of game.participants) {
          if (!participant.alive) {
            DB.leaveGame(game.id, participant);
            participant.ws.terminate();
          } else {
            participant.alive = false;
            participant.ws.ping();
          }
        }
        if (JSON.stringify(game) !== JSON.stringify(newGameData)) {
          DB.updateGame(newGameData);
        }
      }
    
    } catch (err) {
      console.log(err);
    }
  }, 10000);
}

module.exports = { peerProxy };