const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const players = [];
const bots = [];
const levels = {
  'FE лабиринт': 1,
  'BE порядок': 2,
  'QA преграда': 3,
  'SA догонялки': 4,
};

io.on('connection', (socket) => {
  const playerName = socket.handshake.query.name;
  if (!playerName || players.length >= 6) {
    socket.disconnect(true);
    return;
  }

  players.push({ name: playerName, level: null, state: null })

  io.emit('playerConnected', players.map(({name}) => name));

  if (players.length === 6) {
    io.emit('allPlayersConnected');
  }

  socket.on('levelSelected', (levelName) => {
    if (!levels[levelName]) return;

    players.find((({ name }) => name === playerName)).level = levels[levelName];
    io.emit('levelSelected', levelName);

    if (players.every(player => player.level !== null) && players.every(({level}) => level === players[0].level)) {
      const selectedLevel = players[0].level;
      io.emit('startLevel', selectedLevel);
    }
  });

  socket.on('disconnect', () => {
    players.splice(players.findIndex(({name}) => name === playerName), 1)

    if (players.length === 0) {
      io.emit('resetGame');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
