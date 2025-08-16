// Package Imports

const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

require("dotenv").config()

const session = require('express-session');
const sharedsession = require('express-socket.io-session');

// EXPRESS and SOCKET setup
const app = express();
const port = 4009;
const socket_server = http.createServer(app); // Create HTTP server for Express
const io = socketIo(socket_server); // Attach Socket.IO to the same server

//console.log(process.env)

const sessionMiddleware = session({
  secret: 'dedkedkeldked',
  resave: false,
  saveUninitialized: false, // No session stored unless modified
  cookie: { secure: false, httpOnly: true } // Secure: true in production
})

// EXPRESS middleware

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

app.use(sessionMiddleware);

// ### VARIABLES ###############################################

const alphabet = "abcdefghijklmnopqrstuvwxyz"

let active_rooms = new Map();
let active_players = new Map();

active_rooms.set('aaaa', { mode:'wisecrack' })
active_rooms.set('bbbb', { mode:'wisecrack' })

socket_server.listen(port, () => {
  console.log(`EXPRESS + Socket.IO | Server running on: localhost:${port}`);
});

// USEFULL FUNCTIONS

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStringOfLetters(length) {
  let result = '';
  for (let x=0; x<length; x++){
    result += alphabet[getRandomInt(0,alphabet.length-1)]
  }
  return result;
}

// EXPRESS ROUTING

app.get('/', function(req,res) {
  res.sendFile('index.html');
})

app.get('/game', function(req,res) {
  const roomcode = req.session.player.roomcode

  if (req.session.player && active_rooms.has(roomcode)){

    const gamemode = active_rooms.get(roomcode).mode;

    switch (gamemode){
      case 'wisecrack':
        res.sendFile(path.join(__dirname, 'public', 'wisecrack.html'));
        break;
      default:
        res.status(404).send('Error while retrieving game mode');
    }
    return;
  }
  res.status(404).send('Room could not be found :(')
})

// ROOM VERIFICATION

app.post('/check-room', function(req,res) {
    const { username, roomcode } = req.body;
    // Get list of players in the room
    const roomPlayers = getPlayersInRoom(roomcode)
    console.log(`PLayers ${JSON.stringify(roomPlayers)}`)
    // Check if room exists
    if (!active_rooms.has(roomcode)) {
      return res.json({ success: false, reason:"Room code not found" }); 
    }
    // Check if player already exists
    if (roomPlayers.includes(username)) {
      return res.json({ success: false, reason:"Username already taken" })
    }
    req.session.player = { roomcode, username };
    res.json({ success:true });
})

// SOCKET.IO player connection

const players = io.of('/players')

players.use(sharedsession(sessionMiddleware, {
    autoSave:true
})); 

players.on('connection', (socket) => {

  //console.log(socket.request.headers.cookie)

  socket.on('join-room', () => {
    if (active_players.has(socket.id)){ return }
    
    const playerData = socket.handshake.session.player
    const username = playerData.username;
    const roomcode = playerData.roomcode;

    active_players.set(socket.id, { username, roomcode })
    socket.join(roomcode)

    console.log(`Player ${username} has joined ${roomcode}`)

    io.of('/game').to(roomcode).emit('player-joined', { username, id:socket.id })

    console.log(active_players)
  })

})

// SOCKET.IO godot connection

const game = io.of('/game');

game.use((socket,next) => {
  //console.log('Handshake auth:', socket.handshake.auth);
  const auth_token = socket.handshake.auth;
  console.log(auth_token.auth)
  if (auth_token.auth === process.env.GODOT_AUTH_TOKEN){
    //console.log('NICE')
    next();
  } else {
    next(new Error("Unauthorized! Nice try"))
  }
})

game.on('connection', (socket) => {

  socket.on('disconnect', () => {
    if (socket.roomcode){
      console.log("Deleted")
      active_rooms.delete(socket.roomcode);
    }
    console.log(active_rooms)
  })

  socket.on('create-room', (data) => {
    if (socket.roomcode){
      socket.emit('create-room-failed', { 'reason':'The client has already created a room.' })
    }
    const gamemode = data.gamemode;
    const roomcode = create_room(gamemode);
    socket.join(roomcode);
    socket.roomcode = roomcode;
    socket.emit('created-room', {roomcode});
  })
})

// GAME HANDLERS

function getPlayersInRoom(roomcode) {
  const roomPlayers = Array.from(active_players.values())
      .filter(p => p.roomcode === roomcode)
      .map(p => p.username);
  return roomPlayers;
}


function create_room(gamemode){
  let roomcode = '';
  while (true){
    roomcode = generateStringOfLetters(4);
    if (!active_rooms.has(roomcode)){
      active_rooms.set(roomcode, { mode:gamemode, max_players:8})
      break;
    }
  }
  console.log(active_rooms);
  return roomcode;
}

//create_room('wisecrack');