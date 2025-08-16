const socket = io("/players");

function connect_to_room(){
    socket.emit('join-room')
}

connect_to_room()