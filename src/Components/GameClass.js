export const EVENTS = {
    GameEnd: "game_end",        // the host disconnects or ends the game
    GameStart: "game_start",    // the host starts the game
    GameJoin: "join_game",      // a user joins a game
    GameHost: "host_game",      // a user hosts a game
    GameLeave: "leave_game",    // a user leaves a game (not the host)
}
export const ROLES = {
    Host: "host",
    Participant: "participant"
}
export class Game { // this is only necessary for multiplayer
    socket; // the socket to communicate with
    role; // either host or participant
    username;

    constructor(myRole, myUsername = undefined) {
        this.configureWebSocket();
        this.role = myRole;
        this.username = myUsername || localStorage.getItem("username");
    }
    configureWebSocket() {
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
        this.socket.onopen = (event) => {
            //   this.displayMsg('system', 'game', 'connected');
        };
        this.socket.onclose = (event) => {
            //   this.displayMsg('system', 'game', 'disconnected');
        };
        this.socket.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            // console.log(msg.type);
            if (msg.type === EVENTS.GameEnd) {
                // this.displayMsg('player', msg.from, `scored ${msg.value.score}`);
            } else if (msg.type === EVENTS.GameHost) {
                // this.displayMsg('player', msg.from, `started a new game`);
                console.log(msg.type);
            }
        };
    }
    async broadcastEvent(newEvent, sendData, sender = this.username) {
        const event = {
            from: sender,
            type: newEvent,
            value: sendData,
        };
        let maxWaitTime = 1000 * 5;
        let currentWaitTime = 0;
        let connectionInterval = setInterval(() => {
            if (this.socket.readyState !== 1 && currentWaitTime < maxWaitTime) {
                currentWaitTime += 1000;
            } else {
                this.socket.send(JSON.stringify(event));
                // console.log("package sent!");
                clearInterval(connectionInterval);
            }
        }, 1000);
    }
    getUsername() {
        return this.username;
    }
}
