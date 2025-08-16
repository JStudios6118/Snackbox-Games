const socket = io("/players");

function connect_to_room(){
    socket.emit('join-room')
}

socket.on('kicked', (reason) => {
    alert(`Uh-oh: ${reason}`)
    cookieStore.delete('connect.sid')
})

connect_to_room()