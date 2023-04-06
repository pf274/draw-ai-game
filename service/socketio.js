const {Server} = require("socket.io");


function getAllRoomMembers(io, room, _nsp) {
    try {
        const roomMembers = [];
        const nsp = (typeof _nsp !== 'string') ? '/' : _nsp;
    
        for(const member in [...(io._nsps.get(nsp).adapter.rooms.get(room) || [])]) {
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
        });
        socket.on("join_room", ({room, asHost}) => {
            if (getAllRoomMembers(io, room).length == 0 && asHost == false) {
                socket.emit("receive_message", {message: "failed to join room"});
            } else{
                if (getAllRoomMembers(io, room).length == 0) {
                    console.log(`Started room ${room}`);
                }
                socket.join(room);
                socket.emit("receive_message", {message: "joined room"});
            }
        });
        socket.on("leave_room", ({room}) => {
            console.log("leaving room");
            socket.leave(room);
        })
    });
}

module.exports = { socketio };