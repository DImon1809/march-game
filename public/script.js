const socket = io({
  query: { name: new URLSearchParams(window.location.search).get("name") },
});

const screens = {
  waitingRoom: document.getElementById("waiting-room"),
  levelSelection: document.getElementById("level-selection"),
  treasureScreen: document.getElementById("treasure-screen"),
  level1: document.getElementById("level-1"),
  level2: document.getElementById("level-2"),
  level3: document.getElementById("level-3"),
  level4: document.getElementById("level-4"),
};

const enemyFaces = {
  fe: ["images/enemies/fe/islamov.png", "images/enemies/fe/klimov.png"],
  be: [
    "images/enemies/be/kizhaev.png",
    "images/enemies/be/kurtyakov.png",
    "images/enemies/be/schepkin.png",
    "images/enemies/be/zibert.png",
  ],
  qa: [
    "images/enemies/qa/erokhin.png",
    "images/enemies/qa/rogozin.png",
    "images/enemies/qa/vyaldin.png",
    "images/enemies/qa/zaichko.png",
  ],
  sa: [
    "images/enemies/sa/eremeev.png",
    "images/enemies/sa/kaluzhsky.png",
    "images/enemies/sa/puzanov.png",
  ],
};

const playerFaces = {
  tunyaeva: "images/players/tunyaeva.png",
  grushevskaya: "images/players/grushevskaya.png",
  verina: "images/players/verina.png",
  verbitskaya: "images/players/verbitskaya.png",
  emke: "images/players/emke.png",
  evko: "images/players/evko.png",
};

const playerName = new URLSearchParams(window.location.search).get("name");
const playerFace = playerFaces[playerName];

socket.on("playerConnected", (players) => {
  document.getElementById(
    "connected-players"
  ).innerText = `Подключились: ${players.join(", ")}`;
});

socket.on("allPlayersConnected", () => {
  document.getElementById("start-game").removeAttribute("disabled");
});

document.getElementById("start-game").addEventListener("click", () => {
  screens.waitingRoom.classList.remove("active");
  screens.levelSelection.classList.add("active");
});

document.getElementById("open-treasure").addEventListener("click", () => {
  const code = document.getElementById("treasure-code").value;
  if (code === "2517") {
    screens.levelSelection.classList.remove("active");
    screens.treasureScreen.classList.add("active");
    document.getElementById("treasure").style.background = `url(${playerFace})`;
  }
});

document.querySelectorAll(".level").forEach((level) => {
  level.addEventListener("click", () => {
    const levelName = level.getAttribute("data-name");
    socket.emit("levelSelected", levelName);
  });
});

socket.on("levelSelected", (players) => {
  players.forEach(({ name, level }) => {
    document.querySelector(`[data-player=${name}]`)?.remove();

    if (level) {
      const face = document.createElement("div");
      face.setAttribute("data-player", name);
      face.style.height = "50px";
      face.style.width = "50px";
      face.style.backgroundImage = `url(${playerFaces[name]})`;
      face.style.backgroundSize = "100% 100%";
      document.querySelector(`[data-number="${level}"]`).appendChild(face);
    }
  });
});

socket.on("startLevel", (level) => {
  screens.levelSelection.classList.remove("active");
  switch (level) {
    case 1:
      screens.level1.classList.add("active");
      startLevel1();
      break;
    case 2:
      screens.level2.classList.add("active");
      startLevel2();
      break;
    case 3:
      screens.level3.classList.add("active");
      startLevel3();
      break;
    case 4:
      screens.level4.classList.add("active");
      startLevel4();
      break;
  }
});

socket.on("levelCompleted", (completedLevels) => {
  screens.level1.classList.remove("active");
  screens.level2.classList.remove("active");
  screens.level3.classList.remove("active");
  screens.level4.classList.remove("active");

  completedLevels.forEach((levelName) => {
    let code;

    switch (levelName) {
      case "FE лабиринт":
        code = "2";
        break;
      case "BE порядок":
        code = "5";
        break;
      case "QA преграда":
        code = "1";
        break;
      case "SA догонялки":
        code = "7";
        break;
    }

    document.querySelector(`[date-name=${levelName}]`).textContent = code;
  });
});

function startLevel1() {
  const canvas = document.getElementById("maze");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 800;

  // Логика первого уровня
}

function startLevel2() {
  const canvas = document.getElementById("sokoban");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 800;

  // Логика второго уровня
  document.getElementById("reset-level-2").addEventListener("click", () => {
    // Логика сброса уровня
    const gridSize = 50;
    const player = { x: 1, y: 1 };
    const boxes = [
      { color: "red" },
      { color: "blue" },
      { color: "green" },
      { color: "yellow" },
    ];
    const targets = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
    ];

    function genCoord(i) {
      const x = Math.ceil(Math.random() * 13 + 1);
      const y = Math.ceil(Math.random() * 13 + 1);

      const isMatchTarget = targets.some(
        (l) =>
          (l.x === x && l.y === y) ||
          (l.x + 1 === x && l.y === y) ||
          (l.x - 1 === x && l.y === y) ||
          (l.x === x && l.y + 1 === y) ||
          (l.x === x && l.y - 1 === y)
      );

      const isMatchBox = targets.some((l) => l.x === x && l.y === y);

      const isMatchPlayer = player.x === x && player.y === y;

      if (isMatchTarget || isMatchBox || isMatchPlayer) return genCoord(i);

      return [x, y];
    }

    boxes.forEach((_, i) => {
      const [x, y] = genCoord(i);
      boxes[i].x = x;
      boxes[i].y = y;
    });

    const playerImage = new Image();
    playerImage.src = playerFace;

    playerImage.onload = () => {
      draw();
    };

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        playerImage,
        player.x * gridSize,
        player.y * gridSize,
        gridSize,
        gridSize
      );

      boxes.forEach((box) => {
        ctx.fillStyle = box.color;
        ctx.beginPath();
        ctx.arc(
          box.x * gridSize + gridSize / 2,
          box.y * gridSize + gridSize / 2,
          gridSize / 2 - 10,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      ctx.strokeStyle = "black";
      targets.forEach((target) => {
        ctx.strokeRect(
          target.x * gridSize,
          target.y * gridSize,
          gridSize,
          gridSize
        );
      });
    }

    function calcCoord(coord) {
      return coord * gridSize;
    }

    function move(dx, dy) {
      const newX = player.x + dx;
      const newY = player.y + dy;

      if (
        calcCoord(newX) < 0 ||
        calcCoord(newX) > canvas.height - gridSize ||
        calcCoord(newY) < 0 ||
        calcCoord(newY) > canvas.width - gridSize
      )
        return;

      const boxIndex = boxes.findIndex(
        (box) => box.x === newX && box.y === newY
      );
      if (boxIndex !== -1) {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;

        if (
          calcCoord(boxNewX) < gridSize ||
          calcCoord(boxNewX) > canvas.height - 2 * gridSize ||
          calcCoord(boxNewY) < gridSize ||
          calcCoord(boxNewY) > canvas.width - 2 * gridSize
        )
          return;

        if (!boxes.some((box) => box.x === boxNewX && box.y === boxNewY)) {
          boxes[boxIndex].x = boxNewX;
          boxes[boxIndex].y = boxNewY;
        } else {
          return;
        }
      }

      player.x = newX;
      player.y = newY;
      draw();

      if (
        boxes.every((box) =>
          targets.some((target) => target.x === box.x && target.y === box.y)
        )
      )
        return alert("Игра пройдена!");
    }

    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          move(0, -1);
          break;
        case "ArrowDown":
          move(0, 1);
          break;
        case "ArrowLeft":
          move(-1, 0);
          break;
        case "ArrowRight":
          move(1, 0);
          break;
      }
    });
  });
}

function startLevel3() {
  const canvas = document.getElementById("shooting");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 800;

  const gridSize = 50;

  const player = { x: canvas.width / 2, y: canvas.height - 50 };
  const bullets = [];
  const balls = [
    { x: 100, y: 100, dx: 2, dy: 2, color: "green", hits: 0 },
    { x: 600, y: 200, dx: -2, dy: 3, color: "blue", hits: 0 },
  ];
  const ballRadius = 30;
  const bulletSpeed = 5;
  const maxHits = 5;
  let animationId = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const playerImage = new Image();
    playerImage.src = playerFace;

    ctx.drawImage(
      playerImage,
      player.x - 25,
      player.y - 25,
      gridSize,
      gridSize
    );

    // Рисуем пули
    bullets.forEach((bullet) => {
      ctx.fillStyle = "yellow";
      ctx.fillRect(bullet.x - 5, bullet.y - 10, 10, 20);
    });

    // Рисуем шары
    balls.forEach((ball) => {
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function update() {
    // Двигаем шары
    balls.forEach((ball) => {
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x - ballRadius < 0 || ball.x + ballRadius > canvas.width) {
        ball.dx *= -1;
      }
      if (ball.y - ballRadius < 0 || ball.y + ballRadius > canvas.height) {
        ball.dy *= -1;
      }
    });

    // Двигаем пули
    bullets.forEach((bullet, index) => {
      bullet.y -= bulletSpeed;
      if (bullet.y < 0) {
        bullets.splice(index, 1);
      }
    });

    // Проверяем попадания
    bullets.forEach((bullet, bulletIndex) => {
      balls.forEach((ball, ballIndex) => {
        if (
          Math.sqrt((bullet.x - ball.x) ** 2 + (bullet.y - ball.y) ** 2) <
          ballRadius
        ) {
          ++ball.hits;
          bullets.splice(bulletIndex, 1);
          const _color = ball.color;
          ball.color = "red";

          setTimeout(() => {
            ball.color = _color;
          }, 200);

          if (ball.hits >= maxHits) {
            balls.splice(ballIndex, 1);
          }
        }
      });
    });
  }

  function gameLoop() {
    draw();
    update();

    if (balls.length === 0) {
      cancelAnimationFrame(animationId);
      alert("Игра пройдена!");

      return ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  const shotCoolDown = 300;
  let lastShootTime = 0;
  let canShoot = true;

  document.addEventListener("keydown", (e) => {
    const now = Date.now();

    if (e.key === "ArrowLeft" && player.x > 30) {
      player.x -= 20;
    }
    if (e.key === "ArrowRight" && player.x < canvas.width - 30) {
      player.x += 20;
    }
    if (e.key === " " && now - lastShootTime > shotCoolDown && canShoot) {
      bullets.push({ x: player.x, y: player.y - 30 });
      lastShootTime = now;
      canShoot = false;

      setTimeout(() => {
        canShoot = true;
      }, shotCoolDown);
    }
  });

  gameLoop();

  // Логика третьего уровня
}

function startLevel4() {
  const canvas = document.getElementById("chase");
  const ctx = canvas.getContext("2d");
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
      dy: 0,
    };
  }

  // Функция для создания бота с тремя жизнями
  function createBot(i) {
    const img = new Image();
    img.src = enemyFaces.sa[i];

    return {
      x: Math.random() * (canvas.width - 50),
      y: Math.random() * (canvas.height - 50),
      size: 50,
      img: img,
      speed: 1,
      dx: Math.random() > 0.5 ? 1 : -1,
      dy: Math.random() > 0.5 ? 1 : -1,
      lives: 3,
    };
  }

  // Создаем игроков и ботов
  players.push(createPlayer());

  for (let i = 0; i < 3; i++) {
    bots.push(createBot(i));
  }

  // Функция для проверки столкновения
  function checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.size &&
      rect1.x + rect1.size > rect2.x &&
      rect1.y < rect2.y + rect2.size &&
      rect1.y + rect1.size > rect2.y
    );
  }

  // Функция для расчета направления убегания от ближайшего игрока
  function fleeFromClosestPlayer(bot) {
    let closestPlayer = null;
    let closestDistance = Infinity;

    players.forEach((player) => {
      const distance = Math.sqrt(
        (bot.x - player.x) ** 2 + (bot.y - player.y) ** 2
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });

    if (closestPlayer) {
      const angle = Math.atan2(
        closestPlayer.y - bot.y,
        closestPlayer.x - bot.x
      );
      bot.dx = -Math.cos(angle);
      bot.dy = -Math.sin(angle);
    }
  }

  // Функция для отрисовки игроков и ботов
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка игроков
    players.forEach((player) => {
      ctx.drawImage(player.img, player.x, player.y, player.size, player.size);
    });

    // Отрисовка ботов
    bots.forEach((bot) => {
      ctx.drawImage(bot.img, bot.x, bot.y, bot.size, bot.size);
    });
  }

  // Функция для обновления позиции игроков и ботов
  function update() {
    // Обновление позиции игроков
    players.forEach((player) => {
      player.x += player.dx * player.speed;
      player.y += player.dy * player.speed;

      // Ограничение движением за пределы холста
      if (player.x < 0) player.x = 0;
      if (player.x > canvas.width - player.size)
        player.x = canvas.width - player.size;
      if (player.y < 0) player.y = 0;
      if (player.y > canvas.height - player.size)
        player.y = canvas.height - player.size;
    });

    // Обновление позиции ботов и убегание от игроков
    bots.forEach((bot) => {
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
      players.forEach((player) => {
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
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          players[0].dy = -1;
          break;
        case "ArrowDown":
          players[0].dy = 1;
          break;
        case "ArrowLeft":
          players[0].dx = -1;
          break;
        case "ArrowRight":
          players[0].dx = 1;
          break;
      }
    });

    document.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
          players[0].dy = 0;
          break;
        case "ArrowLeft":
        case "ArrowRight":
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
      alert("Игра пройдена!");
    }
  }

  // Запуск игры
  handleInput();
  gameLoop();
}
