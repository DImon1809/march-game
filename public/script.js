const socket = io({ query: { name: new URLSearchParams(window.location.search).get('name') } });

const screens = {
  waitingRoom: document.getElementById('waiting-room'),
  levelSelection: document.getElementById('level-selection'),
  treasureScreen: document.getElementById('treasure-screen'),
  level1: document.getElementById('level-1'),
  level2: document.getElementById('level-2'),
  level3: document.getElementById('level-3'),
  level4: document.getElementById('level-4'),
};

const enemyFaces = {
  enemy: 'images/players/enemy.png'
}

const playerFaces = {
  tunyaeva: 'images/players/tunyaeva.png',
  grushevskaya: 'images/players/grushevskaya.png',
  verina: 'images/players/verina.png',
  verbitskaya: 'images/players/verbitskaya.png',
  emke: 'images/players/emke.png',
  evko: 'images/players/evko.png',
};

const playerName = new URLSearchParams(window.location.search).get('name');
const playerFace = playerFaces[playerName];

socket.on('playerConnected', (players) => {
  document.getElementById('connected-players').innerText = `Подключились: ${players.join(', ')}`
});

socket.on('allPlayersConnected', () => {
  document.getElementById('start-game').removeAttribute('disabled');
});

document.getElementById('start-game').addEventListener('click', () => {
  screens.waitingRoom.classList.remove('active');
  screens.levelSelection.classList.add('active');
});

document.getElementById('open-treasure').addEventListener('click', () => {
  const code = document.getElementById('treasure-code').value;
  if (code === '2517') {
    screens.levelSelection.classList.remove('active');
    screens.treasureScreen.classList.add('active');
    console.log(playerFace)
    document.getElementById('treasure').style.background = `url(${playerFace})`;
  }
});

document.querySelectorAll('.level').forEach(level => {
  level.addEventListener('click', () => {
    const levelName = level.getAttribute('data-name');
    socket.emit('levelSelected', levelName);
    level.style.background = `url(${playerFace})`;
  });
});

socket.on('startLevel', (level) => {
  screens.levelSelection.classList.remove('active');
  switch (level) {
    case 1:
      screens.level1.classList.add('active');
      startLevel1();
      break;
    case 2:
      screens.level2.classList.add('active');
      startLevel2();
      break;
    case 3:
      screens.level3.classList.add('active');
      startLevel3();
      break;
    case 4:
      screens.level4.classList.add('active');
      startLevel4();
      break;
  }
});

function startLevel1() {
  const canvas = document.getElementById('maze');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 800;

  // Логика первого уровня
}

function startLevel2() {
  const canvas = document.getElementById('sokoban');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 800;

  // Логика второго уровня
  document.getElementById('reset-level-2').addEventListener('click', () => {
    // Логика сброса уровня
  });
}

function startLevel3() {
  const canvas = document.getElementById('shooting');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 800;

  // Логика третьего уровня
}

function startLevel4() {
  const canvas = document.getElementById('chase');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 800;

  const playerSize = 50;
  const players = [];
  const enemies = [];

  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = playerSize;
      this.color = 'blue';
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    move(dx, dy) {
      this.x += dx;
      this.y += dy;
      this.checkBounds();
    }

    checkBounds() {
      if (this.x < 0) this.x = 0;
      if (this.x > canvas.width - this.size) this.x = canvas.width - this.size;
      if (this.y < 0) this.y = 0;
      if (this.y > canvas.height - this.size) this.y = canvas.height - this.size;
    }
  }

  class Enemy {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.size = playerSize;
      this.color = color;
      this.dx = Math.random() * 2 - 1;
      this.dy = Math.random() * 2 - 1;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    move() {
      this.x += this.dx;
      this.y += this.dy;
      this.checkBounds();
    }

    checkBounds() {
      if (this.x < 0) this.dx = Math.abs(this.dx);
      if (this.x > canvas.width - this.size) this.dx = -Math.abs(this.dx);
      if (this.y < 0) this.dy = Math.abs(this.dy);
      if (this.y > canvas.height - this.size) this.dy = -Math.abs(this.dy);
    }
  }

  function createPlayers() {
    for (let i = 0; i < 6; i++) {
      players.push(new Player(Math.random() * (canvas.width - playerSize), Math.random() * (canvas.height - playerSize)));
    }
  }

  function createEnemies() {
    enemies.push(new Enemy(Math.random() * canvas.width, Math.random() * canvas.height, 'red'));
    enemies.push(new Enemy(Math.random() * canvas.width, Math.random() * canvas.height, 'green'));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players.forEach(player => player.draw());
    enemies.forEach(enemy => enemy.draw());
  }

  function update() {
    players.forEach(player => {
      if (player.color === 'blue') {
        player.move(0, 1); // Move up
      } else if (player.color === 'yellow') {
        player.move(0, -1); // Move down
      } else if (player.color === 'green') {
        player.move(1, 0); // Move right
      } else if (player.color === 'purple') {
        player.move(-1, 0); // Move left
      }
    });

    enemies.forEach(enemy => {
      enemy.move();
    });
  }

  function checkCollisions() {
    players.forEach(player => {
      enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.size &&
          player.x + player.size > enemy.x &&
          player.y < enemy.y + enemy.size &&
          player.y + player.size > enemy.y) {
          if (enemy.color === 'red') {
            player.color = 'red';
          } else if (enemy.color === 'green') {
            player.color = 'green';
          }
        }
      });
    });
  }

  function gameLoop() {
    draw();
    update();
    checkCollisions();
    requestAnimationFrame(gameLoop);
  }

  createPlayers();
  createEnemies();
  gameLoop();
}
