const socket = io("/players");

function connect_to_room(){
    const route = window.location.pathname;
    const routes = route.split('/')
    socket.emit('join-room',routes[-1])
}

connect_to_room()