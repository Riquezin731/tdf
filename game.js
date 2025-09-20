import InputHandler from './input.js';
import Player from './player.js';
import Enemy from './enemy.js';
import { detectCollision } from './utils.js';

export default class Game {
  constructor(canvas, scoreDisplay, onGameOver) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.scoreDisplay = scoreDisplay;
    this.onGameOver = onGameOver;

    this.input = new InputHandler();
    this.player = new Player(this);
    this.enemies = [];
    this.projectiles = [];

    this.enemyTimer = 0;
    this.enemyInterval = 1000; // spawn interval em ms
    this.score = 0;
    this.gameOver = false;
    this.lastTime = 0;
  }

  start() {
    this.enemies = [];
    this.projectiles = [];
    this.score = 0;
    this.updateScore();
    this.gameOver = false;
    this.enemyTimer = 0;

    requestAnimationFrame((timestamp) => {
      this.lastTime = timestamp;
      this.loop(timestamp);
    });
  }

  loop(timestamp) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.player.update(deltaTime);
    this.player.draw(this.ctx);

    this.projectiles.forEach(p => {
      p.update(deltaTime);
      p.draw(this.ctx);
    });

    this.spawnEnemies(deltaTime);
    this.enemies.forEach(e => {
      e.update(deltaTime);
      e.draw(this.ctx);
    });

    this.handleCollisions();
    this.cleanupEntities();

    if (!this.gameOver) {
      requestAnimationFrame((ts) => this.loop(ts));
    } else {
      this.onGameOver(this.score);
    }
  }

  spawnEnemies(deltaTime) {
    this.enemyTimer += deltaTime;
    if (this.enemyTimer > this.enemyInterval) {
      this.enemies.push(new Enemy(this));
      this.enemyTimer = 0;
    }
  }

  handleCollisions() {
    // Balas x Inimigos
    this.projectiles.forEach((p) => {
      this.enemies.forEach((e) => {
        if (detectCollision(p, e)) {
          p.markedForDeletion = true;
          e.markedForDeletion = true;
          this.score += 10;
          this.updateScore();
        }
      });
    });

    // Inimigos x Jogador
    this.enemies.forEach(e => {
      if (detectCollision(e, this.player)) {
        this.gameOver = true;
      }
    });
  }

  cleanupEntities() {
    this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    this.enemies = this.enemies.filter(e => !e.markedForDeletion);
  }

  updateScore() {
    this.scoreDisplay.textContent = this.score;
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }
}
