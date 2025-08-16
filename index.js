// Package Imports

const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

require("dotenv").config()

const session = require('express-session');

// EXPRESS and SOCKET setup
const app = express();
const port = 4009;
const socket_server = http.createServer(app); // Create HTTP server for Express
const io = socketIo(socket_server); // Attach Socket.IO to the same server

//console.log(process.env)

// EXPRESS middleware

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

app.use(session({
  secret: 'dedkedkeldked',
  resave: false,
  saveUninitialized: false, // No session stored unless modified
  cookie: { secure: false, httpOnly: true } // Secure: true in production
}));

// ### VARIABLES ###############################################

let active_rooms = new Map();
let active_players = new Map();

active_rooms.set('aaaa', { mode:'wisecrack' })
active_rooms.set('bbbb', { mode:'wisecrack' })

socket_server.listen(port, () => {
  console.log(`EXPRESS + Socket.IO | Server running on: rp5.local:${port}`);
});

// USEFULL FUNCTIONS

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStringOfNumbers(length) {
  let result = '';
  for (let x=0; x<length; x++){
    result += getRandomInt(0,9).toString()
  }
  return result;
}

// EXPRESS ROUTING

app.get('/', function(req,res) {
  res.sendFile('index.html');
})

app.get('/game/:id', function(req,res) {
  const roomcode = req.params.id;

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
    const roomPlayers = Array.from(active_players.values())
    .filter(p => p.roomCode === roomCode)
    .map(p => p.username);
    // Check if room exists
    if (!active_rooms.has(roomcode)) {
      return res.json({ success: false }); 
    }
    // Check if player already exists
    if (roomPlayers.includes(username)) {
      return res.json({ success: false })
    }
    req.session.player = { roomcode, username };
    res.json({ success:true });
})

// SOCKET.IO player connection

const players = io.of('/players')

players.on('connection', (socket) => {

})

// SOCKET.IO godot connection

const game = io.of('/game');

game.use('connection', (socket,next) => {
  const auth_token = socket.handshake.auth;
  if (auth_token === process.env.GODOT_AUTH_TOKEN){
    next();
  } else {
    next(new Error("Unauthorized! Nice try"))
  }
})

game.on('connection', (socket) => {
  socket.on('create-room', (gamemode) => {
    console.log("WOWOWOWOWOWOWOWOW")
    const roomcode = create_room(gamemode);
    socket.emit('created-room', roomcode)
  })
})

// GAME HANDLERS

function create_room(gamemode){
  let roomcode = '';
  while (true){
    roomcode = generateStringOfNumbers(4);
    if (!active_rooms.has(roomcode)){
      active_rooms.set(roomcode, { mode:gamemode })
      break;
    }
  }
  console.log(active_rooms);
  return roomcode;
}

create_room('wisecrack');