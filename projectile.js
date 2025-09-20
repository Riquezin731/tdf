export default class Projectile {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 12;
    this.speed = 500; // px por segundo
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.y -= this.speed * deltaTime / 1000;
    if (this.y + this.height < 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
  }
}
