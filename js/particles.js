class Particle {
  constructor(x, y, color = "rgba(200, 0, 0, 0.85)", size = null) {
    this.x = x;
    this.y = y;
    this.size = size || Math.random() * 4 + 2;
    this.vx = (Math.random() - 0.5) * 180;
    this.vy = (Math.random() - 0.5) * 180;
    this.life = Math.random() * 0.45 + 0.35;
    this.maxLife = this.life;
    this.color = color;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.life -= deltaTime;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

class FloatingText {
  constructor(x, y, text, color = "#ffffff", life = 0.8) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = life;
    this.maxLife = life;
  }

  update(deltaTime) {
    this.y -= 38 * deltaTime;
    this.life -= deltaTime;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class Fog {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 240 + 120;
    this.vx = (Math.random() - 0.5) * 16;
    this.vy = (Math.random() - 0.5) * 16;
    this.alpha = Math.random() * 0.05 + 0.025;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    if (this.x > canvas.width + this.size) this.x = -this.size;
    if (this.x < -this.size) this.x = canvas.width + this.size;
    if (this.y > canvas.height + this.size) this.y = -this.size;
    if (this.y < -this.size) this.y = canvas.height + this.size;
  }

  draw(ctx) {
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size,
    );

    gradient.addColorStop(0, `rgba(190, 255, 220, ${this.alpha})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
