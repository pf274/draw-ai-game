export const EVENTS = {
    GameEnd: "game_end",        // the host disconnects or ends the game
    GameStart: "game_start",    // the host starts the game
    DeclareJoin: "declare_join",      // a user joins a game
    DeclareHost: "declare_host",      // a user declares themselves as host
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
    socketInitialized;
    participants;
    host;
    setRows;

    constructor(myRole, myUsername = undefined, setRows = undefined) {
        this.socketInitialized = false;
        this.configureWebSocket();
        this.socket.addEventListener('open', () => {
            this.socketInitialized = true;
        });
        this.socket.addEventListener('close', () => {
            this.socketInitialized = false;
        })
        this.role = myRole;
        this.setRows = setRows;
        this.username = myUsername || localStorage.getItem("username");
    }
    configureWebSocket() {
        let port = window.location.port;
        if (process.env.NODE_ENV !== "production") {
            port = 4000;
        }
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
        this.socket.onopen = (event) => {
            //   this.displayMsg('system', 'game', 'connected');
        };
        this.socket.onclose = (event) => {
            //   this.displayMsg('system', 'game', 'disconnected');
        };
        this.socket.onmessage = async (event) => {
            let data;
            if (event.data instanceof Blob) {
                data = JSON.parse(await event.data.text());
            } else {
                data = JSON.parse(event.data);
            }
            switch (data.type) {
                case EVENTS.GameEnd:
                    // console.log(data);
                break;
                case EVENTS.DeclareHost:
                    // console.log(data);
                break;
                case EVENTS.DeclareJoin:
                    // console.log(data);
                break;
                case EVENTS.GameLeave:
                    // console.log(data);
                break;
                case EVENTS.GameStart:
                    // console.log(data);
                break;
                default:
                    console.log("Some other event was triggered");
                    console.log(data);
                    console.log(`data.msg was this: ${data.msg}`)
                    if (data.msg === "joined game") {
                        debugger;
                        if (this.setRows) {
                            let newRows = [];
                            newRows.push(
                                <tr>
                                    <td>1</td>
                                    <td>{`${JSON.parse(data?.host || "{}")?.id || ""} (host)`}</td>
                                </tr>
                            );
                            for (const participant of Object.values(JSON.parse(data?.participants || "{}"))) {
                                newRows.push(
                                    <tr>
                                        <td>{newRows.length + 1}</td>
                                        <td>{participant?.id  || "anonymous"}</td>
                                    </tr>
                                );
                            }
                            this.setRows(newRows);
                        }
                    }
                break;
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
        if (this.socket.readyState === 1) {
            this.socket.send(JSON.stringify(event));
            return;
        }
        // connection failed. Maybe it was sent before the socket was fully initialized, so wait a bit!
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
