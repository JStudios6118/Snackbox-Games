// Check Room Availability

function check_room_availability(){
    const username = document.getElementById('username').value;
    const roomcode = document.getElementById('roomcode').value;

    fetch('/check-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, roomcode })
    })
    .then(response => {
        if (response.ok){
            console.log(response)
        }
    })
}

// Get Keypresses

document.addEventListener('click', (e) => {
    const id = e.target.id;
    switch (id) {
        case 'join-button':

    }
})