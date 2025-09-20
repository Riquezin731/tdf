import Projectile from './projectile.js';

export default class Player {
  constructor(game) {
    this.game = game;
    this.width = 50;
    this.height = 50;
    this.x = (game.width - this.width) / 2;
    this.y = game.height - this.height - 20;
    this.speed = 300; // px por segundo
    this.cooldown = 0;
    this.fireRate = 500; // ms
  }

  update(deltaTime) {
    const input = this.game.input.keys;

    if (input['ArrowLeft'] && this.x > 0) {
      this.x -= this.speed * deltaTime / 1000;
    }
    if (input['ArrowRight'] && this.x + this.width < this.game.width) {
      this.x += this.speed * deltaTime / 1000;
    }

    if (input['Space'] && this.cooldown <= 0) {
      this.shoot();
      this.cooldown = this.fireRate;
    }

    if (this.cooldown > 0) {
      this.cooldown -= deltaTime;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  shoot() {
    const px = this.x + this.width / 2;
    const py = this.y;
    this.game.addProjectile(new Projectile(this.game, px, py));
  }
}
