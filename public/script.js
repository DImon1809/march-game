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
  enemy: 'images/enemies/enemy.png'
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

// Определяем игроков и ботов
  const players = [];
  const bots = [];

// Функция для создания игрока
  function createPlayer() {
    const img = new Image();
    img.src = playerFace;

    return {
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * (canvas.height - 50),
      size: 50,
      img: img,
      speed: 2,
      dx: 0,
      dy: 0
    };
  }

// Функция для создания бота с тремя жизнями
  function createBot() {
    const img = new Image();
    img.src = enemyFaces.enemy;

    return {
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * (canvas.height - 50),
      size: 50,
      img: img,
      speed: 1,
      dx: Math.random() > 0.5 ? 1 : -1,
      dy: Math.random() > 0.5 ? 1 : -1,
      lives: 3
    };
  }

// Создаем игроков и ботов
  players.push(createPlayer());

  for (let i = 0; i < 2; i++) {
    bots.push(createBot());
  }

// Функция для проверки столкновения
  function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.size &&
      rect1.x + rect1.size > rect2.x &&
      rect1.y < rect2.y + rect2.size &&
      rect1.y + rect1.size > rect2.y;
  }

// Функция для расчета направления убегания от ближайшего игрока
  function fleeFromClosestPlayer(bot) {
    let closestPlayer = null;
    let closestDistance = Infinity;

    players.forEach(player => {
      const distance = Math.sqrt((bot.x - player.x) ** 2 + (bot.y - player.y) ** 2);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });

    if (closestPlayer) {
      const angle = Math.atan2(closestPlayer.y - bot.y, closestPlayer.x - bot.x);
      bot.dx = -Math.cos(angle);
      bot.dy = -Math.sin(angle);
    }
  }

// Функция для отрисовки игроков и ботов
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка игроков
    players.forEach(player => {
      ctx.drawImage(player.img, player.x, player.y, player.size, player.size);
    });

    // Отрисовка ботов
    bots.forEach(bot => {
      ctx.drawImage(bot.img, bot.x, bot.y, bot.size, bot.size);
    });
  }

// Функция для обновления позиции игроков и ботов
  function update() {
    // Обновление позиции игроков
    players.forEach(player => {
      player.x += player.dx * player.speed;
      player.y += player.dy * player.speed;

      // Ограничение движением за пределы холста
      if (player.x < 0) player.x = 0;
      if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
      if (player.y < 0) player.y = 0;
      if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
    });

    // Обновление позиции ботов и убегание от игроков
    bots.forEach(bot => {
      fleeFromClosestPlayer(bot);
      bot.x += bot.dx * bot.speed;
      bot.y += bot.dy * bot.speed;

      // Ограничение движением за пределы холста
      if (bot.x < 0) {
        bot.x = 0;
        bot.dx = Math.abs(bot.dx);
      }
      if (bot.x > canvas.width - bot.size) {
        bot.x = canvas.width - bot.size;
        bot.dx = -Math.abs(bot.dx);
      }
      if (bot.y < 0) {
        bot.y = 0;
        bot.dy = Math.abs(bot.dy);
      }
      if (bot.y > canvas.height - bot.size) {
        bot.y = canvas.height - bot.size;
        bot.dy = -Math.abs(bot.dy);
      }
    });

    // Проверка столкновений и исчезновение ботов
    bots.forEach((bot, botIndex) => {
      players.forEach(player => {
        if (checkCollision(bot, player)) {
          bot.lives -= 1;
          if (bot.lives <= 0) {
            bots.splice(botIndex, 1); // Удаляем бота из массива
            botIndex--; // Декрементируем индекс для корректного удаления следующего бота
          } else {
            bot.x = Math.random() * (canvas.width - bot.size);
            bot.y = Math.random() * (canvas.height - bot.size);
          }
        }
      });
    });
  }

// Функция для обработки ввода
  function handleInput() {
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          players[0].dy = -1;
          break;
        case 'ArrowDown':
          players[0].dy = 1;
          break;
        case 'ArrowLeft':
          players[0].dx = -1;
          break;
        case 'ArrowRight':
          players[0].dx = 1;
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          players[0].dy = 0;
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          players[0].dx = 0;
          break;
      }
    });
  }

// Основной игровой цикл
  function gameLoop() {
    draw();
    update();
    if (bots.length > 0) {
      requestAnimationFrame(gameLoop);
    } else {
      alert('Игра пройдена!');
    }
  }

// Запуск игры
  handleInput();
  gameLoop();
}
