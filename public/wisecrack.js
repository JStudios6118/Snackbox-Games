const socket = io("/players");

let prompt_mode = false;
let prompts = []
let prompt_index = 0;

let responses = []

function connect_to_room(){
    socket.emit('join-room')
}

socket.on('kicked', (reason) => {
    alert(`Uh-oh: ${reason}`)
    cookieStore.delete('connect.sid')
    window.location.href="/"
})

socket.on('prompts', (cur_prompts) => {
    console.log(cur_prompts)
    prompt_mode = true;
    prompts = cur_prompts
    document.getElementById('prompt-area').classList.remove('hidden');
    displayNextPrompt()
})

function displayNextPrompt(){
    document.getElementById('prompt-input').value = "";
    document.getElementById('prompt-text').innerText = prompts[prompt_index].prompt;
}

function promptSubmitPressed(){
    const response = document.getElementById('prompt-input').value;
    socket.emit('submit-response', response, prompts[prompt_index].id)
    prompt_index += 1

    if (prompt_index >= 2){
        document.getElementById('prompt-input').value = "";
        document.getElementById('prompt-area').classList.add('hidden');
        prompt_index = 0;
        prompt_mode = false
        socket.emit('finished-responding')
        return;
    } else {
        displayNextPrompt();
    }
}

document.addEventListener('click', (e) => {
    const id = e.target.id;

    switch (id){
        case 'prompt-submit':
            promptSubmitPressed();
            break;
        default:
            return;
    }
})

connect_to_room()