const EVENTS = {
    GameEnd: "game_end",
    GameStart: "game_start",
}

class Game { // this is only necessary for multiplayer
    socket; // the socket to communicate with
    role; // either host or participant
    constructor() {
        this.configureWebSocket();
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
            // TODO: configure connections!
            const msg = JSON.parse(await event.data.text());
            if (msg.type === EVENTS.GameEnd) {
                // this.displayMsg('player', msg.from, `scored ${msg.value.score}`);
            } else if (msg.type === EVENTS.GameStart) {
                // this.displayMsg('player', msg.from, `started a new game`);
            }
        };
    }
    broadcastEvent(from, type, value) {
        const event = {
            from: from,
            type: type,
            value: value,
        };
        this.socket.send(JSON.stringify(event));
      }
}

export default Game;