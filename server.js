const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const players = {};
const levels = {
  'FE лабиринт': 1,
  'BE порядок': 2,
  'QA преграда': 3,
  'SA догонялки': 4,
};

io.on('connection', (socket) => {
  const playerName = socket.handshake.query.name;
  if (!playerName || Object.keys(players).length >= 6) {
    socket.disconnect(true);
    return;
  }

  players[playerName] = { socket, level: null };

  io.emit('playerConnected', Object.keys(players));

  if (Object.keys(players).length === 6) {
    io.emit('allPlayersConnected');
  }

  socket.on('levelSelected', (levelName) => {
    if (!levels[levelName]) return;

    players[playerName].level = levels[levelName];
    io.emit('levelSelected', levelName);

    if (Object.values(players).every(player => player.level !== null) && Object.values(players).every(({level}) => level === Object.values(players)[0].level)) {
      const selectedLevel = Object.values(players)[0].level;
      io.emit('startLevel', selectedLevel);
    }
  });

  socket.on('disconnect', () => {
    delete players[playerName];
    if (Object.keys(players).length === 0) {
      io.emit('resetGame');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
