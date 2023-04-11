export function socketStartGame(socket, gameID, isHost, rounds) {
    socket.emit("send_message", {
        message: "starting game",
        room: gameID,
        username: localStorage.getItem("username"),
        isHost,
        rounds
    });
}
export function socketSendResults(socket, stuff, gameID, isHost) {
    socket.emit("send_message", {
        message: "my results",
        room: gameID,
        username: localStorage.getItem("username"),
        isHost,
        results: stuff.results,
        picture: stuff.picture,
        points: stuff.points,
        totalPoints: stuff.totalPoints
    });
}
export function socketNewPhase(socket, phase_name, time, prompt_index, gameID, isHost) {
    socket.emit("send_message", {
        message: "new phase",
        room: gameID,
        username: localStorage.getItem("username"),
        isHost,
        phaseInfo: {
            phase: phase_name,
            time,
            prompt_index
        }
    });
}
export function socketIAmHere(socket, gameCode, isHost) {
    socket.emit("send_message", {
        message: "I am here",
        room: gameCode,
        username: localStorage.getItem("username"),
        isHost,
    });
}
export function socketJoinRoom(socket, gameID, isHost) {
    socket.emit("join_room", {
        room: gameID,
        isHost
    });
}
export function socketIAmLeaving(socket, isHost, gameID) {
    socket.emit("send_message", {
        message: "I am leaving",
        username: localStorage.getItem("username"),
        isHost,
        room: gameID,
    });
}
export function socketWhoIsHere(socket, gameID) {
    socket.emit("send_message", {
        message: "who is here?",
        room: gameID,
        username: localStorage.getItem("username")
    });
}
export function socketIAmReady(socket, gameID) {
    socket.emit("send_message", {
        message: "I am ready!",
        room: gameID,
        username: localStorage.getItem("username")
    });
}