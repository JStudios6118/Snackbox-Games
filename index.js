// Package Imports

const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const session = require('express-session');

// EXPRESS and SOCKET setup
const app = express();
const port = 4009;
const socket_server = http.createServer(app); // Create HTTP server for Express
const io = socketIo(socket_server); // Attach Socket.IO to the same server

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

let active_rooms = new Set(['aaaa'])

socket_server.listen(port, () => {
  console.log(`EXPRESS + Socket.IO | Server running on: rp5.local:${port}`);
});

// EXPRESS ROUTING

app.get('/', function(req,res) {
    req.session.player = { 'hello':'hello'};
    console.log(`hello!`)
    res.sendFile('index.html');
})

// ROOM VERIFICATION

app.post('/check-room', function(req,res) {
    const { username, roomcode } = req.body;

})

// SOCKET.IO player connection

const players = io.of('/players')

players.on('connection', (socket) => {

})

// SOCKET.IO godot connection