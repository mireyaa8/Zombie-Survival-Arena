const bulletImg = new Image();
bulletImg.src = "assets/images/Gun-Bullet.png";

class Bullet {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.size = 14;
    this.speed = 720;
    this.damage = 34;
    this.life = 1.15;

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy) || 1;

    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
    this.angle = Math.atan2(dy, dx);
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.life -= deltaTime;
  }

  isExpired() {
    return (
      this.life <= 0 ||
      this.x < -50 ||
      this.x > canvas.width + 50 ||
      this.y < -50 ||
      this.y > canvas.height + 50
    );
  }

  draw(ctx) {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowColor = "#ffd166";
    ctx.shadowBlur = 18;

    ctx.drawImage(
      bulletImg,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size,
    );

    ctx.restore();
  }
}
