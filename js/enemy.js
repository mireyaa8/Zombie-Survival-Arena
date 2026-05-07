const zombieImg = new Image();
zombieImg.src = "assets/images/Zombie_Big_Down_Idle.gif";

class Enemy {
  constructor(x, y, player, level = 1) {
    this.x = x;
    this.y = y;
    this.size = 64;

    this.baseSpeed = 90 + level * 8;
    this.speed = this.baseSpeed;

    this.player = player;

    this.maxHealth = 90 + level * 18;
    this.health = this.maxHealth;

    this.isDead = false;
    this.direction = Math.random() * Math.PI * 2;
    this.hitFlash = 0;
    this.attackCooldown = 0;
    this.stateTimer = 0;
    this.value = 100 + level * 20;

    this.fsm = new FSM("IDLE");

    this.fsm.addState("IDLE", {
      enter: (enemy) => {
        enemy.stateTimer = Math.random() * 1.2 + 0.4;
      },

      update: (enemy, fsm, deltaTime) => {
        enemy.stateTimer -= deltaTime;

        if (enemy.distanceToPlayer() < 330) {
          fsm.changeState("CHASE", enemy);
          return;
        }

        if (enemy.stateTimer <= 0) {
          fsm.changeState("PATROL", enemy);
        }
      },
    });

    this.fsm.addState("PATROL", {
      enter: (enemy) => {
        enemy.direction = Math.random() * Math.PI * 2;
        enemy.stateTimer = Math.random() * 2 + 1;
      },

      update: (enemy, fsm, deltaTime) => {
        enemy.patrol(deltaTime);
        enemy.stateTimer -= deltaTime;

        if (enemy.distanceToPlayer() < 300) {
          fsm.changeState("CHASE", enemy);
          return;
        }

        if (enemy.stateTimer <= 0) {
          fsm.changeState("IDLE", enemy);
        }
      },
    });

    this.fsm.addState("CHASE", {
      update: (enemy, fsm, deltaTime) => {
        enemy.moveTowards(
          enemy.player.centerX,
          enemy.player.centerY,
          deltaTime,
        );

        if (enemy.distanceToPlayer() < 52) {
          fsm.changeState("ATTACK", enemy);
          return;
        }

        if (enemy.health < enemy.maxHealth * 0.22 && Math.random() < 0.006) {
          fsm.changeState("FLEE", enemy);
        }
      },
    });

    this.fsm.addState("ATTACK", {
      update: (enemy, fsm, deltaTime) => {
        enemy.attackCooldown -= deltaTime;

        if (enemy.distanceToPlayer() > 72) {
          fsm.changeState("CHASE", enemy);
          return;
        }

        if (enemy.attackCooldown <= 0) {
          const damaged = enemy.player.takeDamage(9 + level * 0.5);
          enemy.attackCooldown = 0.55;

          if (damaged && typeof addScreenShake === "function") {
            addScreenShake(8);
          }
        }
      },
    });

    this.fsm.addState("FLEE", {
      enter: (enemy) => {
        enemy.stateTimer = 1.2;
      },

      update: (enemy, fsm, deltaTime) => {
        enemy.flee(deltaTime);
        enemy.stateTimer -= deltaTime;

        if (enemy.stateTimer <= 0 || enemy.distanceToPlayer() > 430) {
          fsm.changeState("CHASE", enemy);
        }
      },
    });

    this.fsm.addState("DEAD", {
      enter: (enemy) => {
        enemy.isDead = true;
      },
    });
  }

  get centerX() {
    return this.x + this.size / 2;
  }

  get centerY() {
    return this.y + this.size / 2;
  }

  distanceToPlayer() {
    return Math.hypot(
      this.player.centerX - this.centerX,
      this.player.centerY - this.centerY,
    );
  }

  takeDamage(amount) {
    this.health -= amount;
    this.hitFlash = 0.12;

    if (this.health <= 0 && !this.isDead) {
      this.health = 0;
      this.fsm.changeState("DEAD", this);
      return true;
    }

    return false;
  }

  moveTowards(tx, ty, deltaTime) {
    const dx = tx - this.centerX;
    const dy = ty - this.centerY;
    const dist = Math.hypot(dx, dy) || 1;

    this.x += (dx / dist) * this.speed * deltaTime;
    this.y += (dy / dist) * this.speed * deltaTime;

    this.keepInsideCanvas();
  }

  patrol(deltaTime) {
    this.x += Math.cos(this.direction) * this.speed * 0.45 * deltaTime;
    this.y += Math.sin(this.direction) * this.speed * 0.45 * deltaTime;

    if (Math.random() < 0.015) {
      this.direction = Math.random() * Math.PI * 2;
    }

    this.keepInsideCanvas();
  }

  flee(deltaTime) {
    const dx = this.centerX - this.player.centerX;
    const dy = this.centerY - this.player.centerY;
    const dist = Math.hypot(dx, dy) || 1;

    this.x += (dx / dist) * this.speed * 1.45 * deltaTime;
    this.y += (dy / dist) * this.speed * 1.45 * deltaTime;

    this.keepInsideCanvas();
  }

  keepInsideCanvas() {
    this.x = Math.max(0, Math.min(canvas.width - this.size, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.size, this.y));
  }

  update(deltaTime) {
    if (this.isDead) return;

    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    this.hitFlash = Math.max(0, this.hitFlash - deltaTime);

    this.fsm.update(this, deltaTime);
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save();

    if (this.hitFlash > 0) {
      ctx.shadowColor = "#ff334f";
      ctx.shadowBlur = 26;
      ctx.globalAlpha = 0.72;
    }

    const angle = Math.atan2(
      this.player.centerY - this.centerY,
      this.player.centerX - this.centerX,
    );

    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(angle);

    ctx.drawImage(
      zombieImg,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size,
    );

    ctx.restore();

    this.drawHealthBar(ctx);
    this.drawStateLabel(ctx);
  }

  drawHealthBar(ctx) {
    const barWidth = this.size;
    const barHeight = 6;
    const healthPercent = this.health / this.maxHealth;

    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(this.x, this.y - 12, barWidth, barHeight);

    ctx.fillStyle = healthPercent > 0.35 ? "#00ff99" : "#ff334f";
    ctx.fillRect(this.x, this.y - 12, barWidth * healthPercent, barHeight);
  }

  drawStateLabel(ctx) {
    ctx.save();

    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(this.fsm.state, this.centerX, this.y - 18);

    ctx.restore();
  }
}
