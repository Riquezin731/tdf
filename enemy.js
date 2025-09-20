export default class Enemy {
  constructor(game) {
    this.game = game;
    this.width = 40;
    this.height = 40;
    this.x = Math.random() * (game.width - this.width);
    this.y = -this.height;
    this.speed = 100 + Math.random() * 100; // px por segundo
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.y += this.speed * deltaTime / 1000;
    if (this.y > this.game.height) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
