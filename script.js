const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const scoreEl = document.getElementById('score');

let keys = {};
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let animationId;

// Player prototype
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 5,
  color: '#d32f2f',
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

// Bullet class
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.speed = 7;
    this.color = '#fff';
  }
  update() {
    this.y -= this.speed;
    this.draw();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Enemy class
class Enemy {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = Math.random() * (canvas.width - this.width);
    this.y = -this.height;
    this.speed = 2 + Math.random() * 2;
    this.color = '#0f0';
  }
  update() {
    this.y += this.speed;
    this.draw();
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

function spawnEnemy() {
  if (!gameOver) enemies.push(new Enemy());
}

// Handle input
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup',   e => keys[e.code] = false);
window.addEventListener('keypress', e => {
  if (e.code === 'Space' && !gameOver) {
    bullets.push(new Bullet(player.x + player.width / 2, player.y));
  }
});

// Update game objects
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();

  // Move player
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;

  // Update bullets
  bullets.forEach((b, i) => {
    b.update();
    if (b.y + b.radius < 0) bullets.splice(i, 1);
  });

  // Update enemies
  enemies.forEach((enemy, ei) => {
    enemy.update();

    // Check collision with player
    if (
      enemy.x < player.x + player.width &&
      enemy.x + enemy.width > player.x &&
      enemy.y < player.y + player.height &&
      enemy.y + enemy.height > player.y
    ) {
      endGame();
    }

    // Check collision with bullets
    bullets.forEach((b, bi) => {
      const distX = b.x - (enemy.x + enemy.width / 2);
      const distY = b.y - (enemy.y + enemy.height / 2);
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < b.radius + enemy.width / 2) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
        scoreEl.textContent = `Pontos: ${score}`;
      }
    });

    // Remove offscreen enemy
    if (enemy.y > canvas.height) {
      enemies.splice(ei, 1);
    }
  });

  if (!gameOver) animationId = requestAnimationFrame(update);
}

// Start and reset
function startGame() {
  bullets = [];
  enemies = [];
  score = 0;
  gameOver = false;
  scoreEl.textContent = `Pontos: ${score}`;
  startBtn.style.display = 'none';
  canvas.focus();

  // Spawn enemies periodically
  setInterval(spawnEnemy, 800);

  update();
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animationId);
  startBtn.textContent = 'REINICIAR';
  startBtn.style.display = 'inline-block';
}

startBtn.addEventListener('click', startGame);
