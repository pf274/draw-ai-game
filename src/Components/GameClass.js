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
    role; // either host or participant
    username;
    participants;
    host;
    setRows;

    constructor(myRole, myUsername = undefined, setRows = undefined) {
        this.role = myRole;
        this.setRows = setRows;
        this.username = myUsername || localStorage.getItem("username");
    }
    getUsername() {
        return this.username;
    }
}
