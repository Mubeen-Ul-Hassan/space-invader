// Boss ship with two attack modes: aimed burst and radial ring
class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bossShip');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Detect mobile: scale down the boss on narrow screens
    const isMobile = scene.scale.width < 600;
    this.setScale(isMobile ? 0.55 : 0.85);

    if (this.body) {
      this.body.setSize(this.width * 0.9, this.height * 0.8);
      // Do NOT use setCollideWorldBounds — it fights the sin-wave x assignment
      // and causes jitter/stuck behaviour on mobile. We clamp manually instead.
      this.body.setCollideWorldBounds(false);
    }

    this.maxHealth = 100;
    this.health = 100;
    this.bossState = 'entering'; // 'entering' | 'active' | 'dead'

    this.nextAttackTime = 0;
    this.attackInterval = 3500;
    this.attackCycle = 0; // 0 = targeted, 1 = radial

    this.startX = x;
    // On mobile keep the boss a bit higher so it fits
    this.targetY = isMobile ? 100 : 130;
    this.speedY = 50;   // entry speed

    // Accumulated oscillation time (separate from game time) so freeze works correctly
    this._oscTime = 0;

    this.healthBar = scene.add.graphics();
  }

  // Draw health bar on screen
  drawHealthBar() {
    this.healthBar.clear();
    if (!this.active || this.bossState === 'entering' || this.bossState === 'dead') return;

    const width = 300;
    const height = 12;
    const x = (this.scene.scale.width - width) / 2;
    const y = 60;

    this.healthBar.fillStyle(0x0a0c16, 0.7);
    this.healthBar.fillRect(x, y, width, height);
    this.healthBar.lineStyle(1.5, 0xff0033, 0.9);
    this.healthBar.strokeRect(x, y, width, height);

    const ratio = Math.max(0, this.health) / this.maxHealth;
    this.healthBar.fillStyle(0xff3333, 0.95);
    this.healthBar.fillRect(x + 2, y + 2, (width - 4) * ratio, height - 4);
  }

  update(time, delta) {
    if (!this.active || this.bossState === 'dead') return;

    // CHEAT: freeze slows all enemies
    const freezeMult = (ACTIVE_CHEATS && ACTIVE_CHEATS.freeze) ? 0.20 : 1.0;
    const deltaSec = delta / 1000;

    if (this.bossState === 'entering') {
      // Entry phase: move downwards slowly
      this.y += this.speedY * deltaSec * freezeMult;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.bossState = 'active';
        this.nextAttackTime = time + 1500; // First attack after 1.5 seconds
      }
    } else if (this.bossState === 'active') {
      // Accumulate oscillation time (freeze-aware)
      this._oscTime += deltaSec * freezeMult;

      // Oscillation amplitude scales with screen width
      const margin = 80;
      const halfRange = Math.max(60, (this.scene.scale.width / 2) - margin);
      this.x = this.startX + Math.sin(this._oscTime * 0.8) * halfRange;

      // Manual clamp so the boss never leaves the screen (no world bounds needed)
      const halfW = (this.displayWidth || 60) / 2;
      this.x = Phaser.Math.Clamp(this.x, halfW + 10, this.scene.scale.width - halfW - 10);

      if (!ACTIVE_CHEATS.freeze && time > this.nextAttackTime) {
        this.triggerAttack(time);
      }
    }

    // Hit tint flash fade
    if (this.hitTintTime && time > this.hitTintTime) {
      this.clearTint();
      this.hitTintTime = 0;
    } else if (ACTIVE_CHEATS && ACTIVE_CHEATS.freeze) {
      this.setTint(0x88ccff);
    }

    this.drawHealthBar();
  }

  triggerAttack(time) {
    this.nextAttackTime = time + this.attackInterval;

    if (this.attackCycle === 0) {
      this.shootTargeted();
      this.attackCycle = 1;
    } else {
      this.shootRadial();
      this.attackCycle = 0;
    }
  }

  // Attack 1: Fire 3 consecutive aimed lasers towards player position
  shootTargeted() {
    if (!this.scene.player || !this.scene.player.active) return;

    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!this.active || this.bossState !== 'active' || !this.scene.player || !this.scene.player.active) return;

        const angle = Phaser.Math.Angle.Between(this.x, this.y + 40, this.scene.player.x, this.scene.player.y);
        const speed = 280;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        if (this.scene.enemyBullets) {
          const bullet = this.scene.enemyBullets.get();
          if (bullet) {
            bullet.fire(this.x, this.y + 40, vy, false, 'bossLaser');
            bullet.rotation = angle;
            if (bullet.body) {
              bullet.body.velocity.x = vx;
            }
          }
        }

        if (this.scene.audioManager) {
          this.scene.audioManager.playShoot();
        }
      });
    }
  }

  // Attack 2: Fire 12 lasers in a radial circle
  shootRadial() {
    const laserCount = 12;
    const speed = 180;
    const angleStep = (2 * Math.PI) / laserCount;

    for (let i = 0; i < laserCount; i++) {
      const angle = i * angleStep;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      if (this.scene.enemyBullets) {
        const bullet = this.scene.enemyBullets.get();
        if (bullet) {
          bullet.fire(this.x, this.y + 40, vy, false, 'bossLaser');
          bullet.rotation = angle;
          if (bullet.body) {
            bullet.body.velocity.x = vx;
          }
        }
      }
    }

    if (this.scene.audioManager) {
      this.scene.audioManager.playShoot();
    }
  }

  damage(amount) {
    if (this.bossState !== 'active') return;

    this.health = Math.max(0, this.health - amount);

    this.setTint(0xff8888); // brief hit flash
    this.hitTintTime = this.scene.time.now + 60;

    if (this.scene.audioManager) {
      this.scene.audioManager.playHit();
    }
  }

  destroy() {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy();
  }
}
