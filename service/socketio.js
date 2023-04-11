const { Server } = require("socket.io");


function getAllRoomMembers(io, room, _nsp) {
    try {
        const roomMembers = [];
        const nsp = (typeof _nsp !== 'string') ? '/' : _nsp;

        for (const member in [...(io._nsps.get(nsp).adapter.rooms.get(room) || [])]) {
            roomMembers.push(member);
        }

        return roomMembers;
    } catch (err) {
        console.log(err);
        return [];
    }
}

function socketio(httpService) {
    const io = new Server(httpService, {
        cors: {
            origin: ["http://localhost:3001", "https://startup.peterfullmer.net"],
            methods: ["GET", "POST"],
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("send_message", (data) => {
            console.log(data);
            if (data?.room) {
                socket.to(data.room).emit("receive_message", data); // sends it to everyone in the room.
            } else {
                socket.broadcast.emit("receive_message", data); // sends it to everyone but the sender.
            }
            if (data?.message == "I am leaving") {
                console.log("leaving room");
                socket.leave(data?.room);
            }
        });
        socket.on("join_room", ({ room, isHost }) => {
            if (getAllRoomMembers(io, room).length == 0 && isHost == false) {
                socket.emit("receive_message", { message: "failed to join room" });
                return;
            }
            if (getAllRoomMembers(io, room).length == 0) {
                console.log(`Started room ${room}`);
            }
            socket.join(room);
            socket.emit("receive_message", { message: "joined room" });
        });
    });
}

module.exports = { socketio };