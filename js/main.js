const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const levelText = document.getElementById("levelText");
const ammoText = document.getElementById("ammoText");
const healthText = document.getElementById("healthText");
const healthFill = document.getElementById("healthFill");

const screenOverlay = document.getElementById("screenOverlay");
const menuTitle = document.getElementById("menuTitle");
const menuText = document.getElementById("menuText");
const startButton = document.getElementById("startButton");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let bullets = [];
let enemies = [];
let particles = [];
let floatingTexts = [];
let fogParticles = [];

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

let lastTime = performance.now();
let lastShot = 0;
let screenShake = 0;

let score = 0;
let level = 1;
let levelTransitionTimer = 0;

let ammo = 18;
let maxAmmo = 18;
let reloading = false;
let reloadTimer = 0;

let gameState = "menu";
const shootSounds = [];

// for (let i = 0; i < 5; i++) {
//   const sound = new Audio("sounds/u_f09vejvoga-gun-shot-350315.mp3");
//   sound.volume = 0.04;
//   shootSounds.push(sound);
// }

// let shootSoundIndex = 0;

// function playShootSound() {
//   const sound = shootSounds[shootSoundIndex];

//   sound.currentTime = 0;
//   sound.play().catch(() => {});

//   shootSoundIndex = (shootSoundIndex + 1) % shootSounds.length;
// }
const shootSound = new Audio("sounds/u_f09vejvoga-gun-shot-350315.mp3");
shootSound.volume = 0.08;

let shootSoundStopTimer = null;

function playShootSound() {
  shootSound.pause();
  shootSound.currentTime = 0;
  shootSound.play().catch(() => {});

  clearTimeout(shootSoundStopTimer);

  shootSoundStopTimer = setTimeout(() => {
    shootSound.pause();
    shootSound.currentTime = 0;
  }, 450);
}

let player = new Player(canvas.width / 2 - 32, canvas.height / 2 - 32);

for (let i = 0; i < 22; i++) {
  fogParticles.push(new Fog());
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (player) {
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
  }
}

window.addEventListener("resize", resizeCanvas);

document.addEventListener("keydown", (event) => {
  const key = event.code;

  keys[key] = true;

  if (key === "KeyP" && gameState === "playing") {
    pauseGame();
  } else if (key === "KeyP" && gameState === "paused") {
    resumeGame();
  }

  if (key === "KeyR") {
    if (gameState === "gameover") {
      startGame();
    } else {
      reloadWeapon();
    }
  }

  event.preventDefault();
});

document.addEventListener("keyup", (event) => {
  keys[event.code] = false;
  event.preventDefault();
});

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

window.addEventListener("mousedown", () => {
  shoot();
});

startButton.addEventListener("click", () => {
  if (gameState === "paused") {
    resumeGame();
  } else {
    startGame();
  }
});

function startGame() {
  player = new Player(canvas.width / 2 - 32, canvas.height / 2 - 32);

  bullets = [];
  enemies = [];
  particles = [];
  floatingTexts = [];

  keys = {};
  score = 0;
  level = 1;
  levelTransitionTimer = 0;

  ammo = maxAmmo;
  reloading = false;
  reloadTimer = 0;

  screenShake = 0;
  lastShot = 0;

  gameState = "playing";
  hideOverlay();

  spawnLevel();
  updateUI();
}

function pauseGame() {
  gameState = "paused";
  showOverlay(
    "Paused",
    "Press P to resume, or click the button below.",
    "Resume",
  );
}

function resumeGame() {
  gameState = "playing";
  hideOverlay();
}

function gameOver() {
  gameState = "gameover";

  showOverlay(
    "Game Over",
    `You reached level ${level} with a score of ${score}. Press R to restart.`,
    "Restart",
  );
}

function completeLevel() {
  gameState = "levelComplete";
  levelTransitionTimer = 2.2;

  const levelBonus = level * 250;
  score += levelBonus;

  player.health = Math.min(player.maxHealth, player.health + 20);

  ammo = maxAmmo;
  reloading = false;
  reloadTimer = 0;

  floatingTexts.push(
    new FloatingText(
      canvas.width / 2,
      canvas.height / 2 - 80,
      `Level ${level} Complete`,
      "#00ff99",
      1.4,
    ),
  );

  floatingTexts.push(
    new FloatingText(
      canvas.width / 2,
      canvas.height / 2 - 50,
      `+${levelBonus} Bonus`,
      "#ffd166",
      1.3,
    ),
  );

  updateUI();
}

function showOverlay(title, text, buttonText) {
  menuTitle.textContent = title;
  menuText.textContent = text;
  startButton.textContent = buttonText;
  screenOverlay.classList.add("active");
}

function hideOverlay() {
  screenOverlay.classList.remove("active");
}

function reloadWeapon() {
  if (reloading || ammo === maxAmmo || gameState !== "playing") return;

  reloading = true;
  reloadTimer = 0.9;
}

function shoot() {
  if (gameState !== "playing") return;
  if (reloading) return;

  const now = performance.now();

  if (now - lastShot < 260) return;

  if (ammo <= 0) {
    reloadWeapon();
    return;
  }

  lastShot = now;
  ammo--;

  bullets.push(new Bullet(player.centerX, player.centerY, mouseX, mouseY));

  addScreenShake(2.5);

  for (let i = 0; i < 4; i++) {
    particles.push(
      new Particle(
        player.centerX,
        player.centerY,
        "rgba(255, 209, 102, 0.75)",
        3,
      ),
    );
  }

  playShootSound();

  updateUI();

  if (ammo <= 0) reloadWeapon();
}

function spawnLevel() {
  const zombieCount = 4 + level * 3;

  for (let i = 0; i < zombieCount; i++) {
    const pos = getSpawnPositionOutsideScreen();
    enemies.push(new Enemy(pos.x, pos.y, player, level));
  }

  floatingTexts.push(
    new FloatingText(
      canvas.width / 2,
      canvas.height / 2 - 90,
      `Level ${level}`,
      "#00eaff",
      1.2,
    ),
  );
}

function getSpawnPositionOutsideScreen() {
  const margin = 90;
  const side = Math.floor(Math.random() * 4);

  if (side === 0) {
    return {
      x: Math.random() * canvas.width,
      y: -margin,
    };
  }

  if (side === 1) {
    return {
      x: canvas.width + margin,
      y: Math.random() * canvas.height,
    };
  }

  if (side === 2) {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + margin,
    };
  }

  return {
    x: -margin,
    y: Math.random() * canvas.height,
  };
}

function addScreenShake(amount) {
  screenShake = Math.min(18, screenShake + amount);
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    80,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width,
  );

  gradient.addColorStop(0, "#16211b");
  gradient.addColorStop(0.5, "#070908");
  gradient.addColorStop(1, "#000000");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const time = performance.now() * 0.001;
  const grid = 70;

  ctx.strokeStyle = "rgba(0, 255, 153, 0.055)";
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(time + x) * 2, 0);
    ctx.lineTo(x + Math.cos(time + x) * 2, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.cos(time + y) * 2);
    ctx.lineTo(canvas.width, y + Math.sin(time + y) * 2);
    ctx.stroke();
  }

  drawVignette();
}

function drawVignette() {
  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 4,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.75,
  );

  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.82)");

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function checkCollisions() {
  for (let b = bullets.length - 1; b >= 0; b--) {
    const bullet = bullets[b];

    for (let e = enemies.length - 1; e >= 0; e--) {
      const enemy = enemies[e];

      if (enemy.isDead) continue;

      const dist = Math.hypot(
        bullet.x - enemy.centerX,
        bullet.y - enemy.centerY,
      );

      if (dist < enemy.size / 2) {
        bullets.splice(b, 1);

        const killed = enemy.takeDamage(bullet.damage);

        addScreenShake(killed ? 7 : 3);

        floatingTexts.push(
          new FloatingText(
            enemy.centerX,
            enemy.y,
            `-${bullet.damage}`,
            "#ffd166",
          ),
        );

        for (let i = 0; i < 14; i++) {
          particles.push(new Particle(enemy.centerX, enemy.centerY));
        }

        if (killed) {
          score += enemy.value;

          floatingTexts.push(
            new FloatingText(
              enemy.centerX,
              enemy.y - 18,
              `+${enemy.value}`,
              "#00ff99",
            ),
          );

          for (let i = 0; i < 34; i++) {
            particles.push(
              new Particle(
                enemy.centerX,
                enemy.centerY,
                "rgba(255, 51, 79, 0.85)",
              ),
            );
          }
        }

        break;
      }
    }
  }
}

function updateGame(deltaTime) {
  if (reloading) {
    reloadTimer -= deltaTime;

    if (reloadTimer <= 0) {
      reloading = false;
      ammo = maxAmmo;
    }
  }

  player.update(deltaTime);
  player.move(keys, deltaTime);

  bullets.forEach((bullet) => bullet.update(deltaTime));
  bullets = bullets.filter((bullet) => !bullet.isExpired());

  enemies.forEach((enemy) => enemy.update(deltaTime));

  particles.forEach((particle) => particle.update(deltaTime));
  particles = particles.filter((particle) => particle.life > 0);

  floatingTexts.forEach((text) => text.update(deltaTime));
  floatingTexts = floatingTexts.filter((text) => text.life > 0);

  fogParticles.forEach((fog) => fog.update(deltaTime));

  checkCollisions();

  enemies = enemies.filter((enemy) => !enemy.isDead);

  if (enemies.length === 0) {
    completeLevel();
  }

  if (player.health <= 0) {
    gameOver();
  }

  screenShake = Math.max(0, screenShake - 45 * deltaTime);

  updateUI();
}

function updateLevelTransition(deltaTime) {
  levelTransitionTimer -= deltaTime;

  floatingTexts.forEach((text) => text.update(deltaTime));
  floatingTexts = floatingTexts.filter((text) => text.life > 0);

  particles.forEach((particle) => particle.update(deltaTime));
  particles = particles.filter((particle) => particle.life > 0);

  fogParticles.forEach((fog) => fog.update(deltaTime));

  screenShake = Math.max(0, screenShake - 45 * deltaTime);

  if (levelTransitionTimer <= 0) {
    level++;
    gameState = "playing";
    spawnLevel();
    updateUI();
  }
}

function drawGame() {
  ctx.save();

  if (screenShake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * screenShake,
      (Math.random() - 0.5) * screenShake,
    );
  }

  drawBackground();

  fogParticles.forEach((fog) => fog.draw(ctx));
  particles.forEach((particle) => particle.draw(ctx));
  bullets.forEach((bullet) => bullet.draw(ctx));
  enemies.forEach((enemy) => enemy.draw(ctx));

  player.draw(ctx, mouseX, mouseY);

  floatingTexts.forEach((text) => text.draw(ctx));

  drawCrosshair();

  ctx.restore();
}

function drawCrosshair() {
  ctx.save();

  ctx.strokeStyle = "rgba(0, 255, 153, 0.75)";
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.moveTo(mouseX - 9, mouseY);
  ctx.lineTo(mouseX - 3, mouseY);

  ctx.moveTo(mouseX + 3, mouseY);
  ctx.lineTo(mouseX + 9, mouseY);

  ctx.moveTo(mouseX, mouseY - 9);
  ctx.lineTo(mouseX, mouseY - 3);

  ctx.moveTo(mouseX, mouseY + 3);
  ctx.lineTo(mouseX, mouseY + 9);

  ctx.stroke();

  ctx.restore();
}

function updateUI() {
  scoreText.textContent = score;
  levelText.textContent = level;

  ammoText.textContent = reloading ? "Reloading..." : `${ammo} / ${maxAmmo}`;

  const healthPercent = Math.round((player.health / player.maxHealth) * 100);

  healthText.textContent = `${healthPercent}%`;
  healthFill.style.width = `${healthPercent}%`;

  if (healthPercent <= 30) {
    healthFill.style.background = "linear-gradient(90deg, #ff334f, #ffd166)";
  } else {
    healthFill.style.background = "linear-gradient(90deg, #00ff99, #00eaff)";
  }
}

function gameLoop(currentTime) {
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.033);
  lastTime = currentTime;

  if (gameState === "playing") {
    updateGame(deltaTime);
  }

  if (gameState === "levelComplete") {
    updateLevelTransition(deltaTime);
  }

  drawGame();

  requestAnimationFrame(gameLoop);
}

updateUI();
requestAnimationFrame(gameLoop);
