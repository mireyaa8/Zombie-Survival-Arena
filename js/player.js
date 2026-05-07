const playerImg = new Image();
playerImg.src = "assets/images/Character_down_idle.gif";

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 64;
    this.speed = 260;
    this.health = 100;
    this.maxHealth = 100;
    this.invincibleTimer = 0;
  }

  get centerX() {
    return this.x + this.size / 2;
  }

  get centerY() {
    return this.y + this.size / 2;
  }

  move(keys, deltaTime) {
    let dx = 0;
    let dy = 0;

    if (keys["KeyW"] || keys["ArrowUp"]) dy -= 1;
    if (keys["KeyS"] || keys["ArrowDown"]) dy += 1;
    if (keys["KeyA"] || keys["ArrowLeft"]) dx -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) dx += 1;

    const length = Math.hypot(dx, dy);

    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    this.x += dx * this.speed * deltaTime;
    this.y += dy * this.speed * deltaTime;

    this.x = Math.max(0, Math.min(canvas.width - this.size, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.size, this.y));
  }

  takeDamage(amount) {
    if (this.invincibleTimer > 0) return false;

    this.health = Math.max(0, this.health - amount);
    this.invincibleTimer = 0.32;

    return true;
  }

  update(deltaTime) {
    this.invincibleTimer = Math.max(0, this.invincibleTimer - deltaTime);
  }

  draw(ctx, mouseX, mouseY) {
    ctx.save();

    ctx.translate(this.centerX, this.centerY);

    const angle = Math.atan2(mouseY - this.centerY, mouseX - this.centerX);
    ctx.rotate(angle);

    if (this.invincibleTimer > 0) {
      ctx.globalAlpha = 0.72 + Math.sin(Date.now() * 0.04) * 0.2;
      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = 18;
    }

    ctx.drawImage(
      playerImg,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size,
    );

    ctx.restore();

    this.drawAimLine(ctx, mouseX, mouseY);
  }

  drawAimLine(ctx, mouseX, mouseY) {
    const angle = Math.atan2(mouseY - this.centerY, mouseX - this.centerX);
    const length = 36;

    ctx.save();
    ctx.strokeStyle = "rgba(0, 255, 153, 0.45)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.lineTo(
      this.centerX + Math.cos(angle) * length,
      this.centerY + Math.sin(angle) * length,
    );
    ctx.stroke();

    ctx.restore();
  }
}
