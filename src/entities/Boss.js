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
    // Keep targetY low enough so there's plenty of space below top HUD/health bar
    this.targetY = isMobile ? 120 : 145;
    this.speedY = 50;   // entry speed

    // Accumulated oscillation time (separate from game time) so freeze works correctly
    this._oscTime = 0;

    this.healthBar = scene.add.graphics();
  }

  // Draw health bar on screen
  drawHealthBar() {
    this.healthBar.clear();
    if (!this.active || this.bossState === 'entering' || this.bossState === 'dead') return;

    const isMobile = this.scene.scale.width < 600;
    const width = isMobile ? 140 : 180;
    const height = 8;
    const x = (this.scene.scale.width - width) / 2;
    const y = isMobile ? 42 : 22;

    this.healthBar.fillStyle(0x0a0c16, 0.75);
    this.healthBar.fillRect(x, y, width, height);

    const isLowHealth = this.health <= 20;
    const borderColor = isLowHealth ? 0xff3300 : 0xff0033;
    this.healthBar.lineStyle(1.5, borderColor, 0.9);
    this.healthBar.strokeRect(x, y, width, height);

    const ratio = Math.max(0, this.health) / this.maxHealth;
    const fillColor = isLowHealth ? 0xff2200 : 0xff3333;
    this.healthBar.fillStyle(fillColor, 0.95);
    if (ratio > 0) {
      this.healthBar.fillRect(x + 2, y + 2, Math.max(0, (width - 4) * ratio), height - 4);
    }
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

    // Hit tint flash fade or enraged red pulse when health <= 20
    if (this.hitTintTime && time > this.hitTintTime) {
      this.clearTint();
      this.hitTintTime = 0;
    } else if (ACTIVE_CHEATS && ACTIVE_CHEATS.freeze) {
      this.setTint(0x88ccff);
    } else if (this.health <= 20) {
      // Enraged low-health red pulse effect
      const pulse = Math.floor((Math.sin(time * 0.01) + 1) * 50);
      this.setTint(Phaser.Display.Color.GetColor(255, 100 - pulse, 100 - pulse));
    } else {
      this.clearTint();
    }

    this.drawHealthBar();
  }

  triggerAttack(time) {
    // When health <= 20, attack interval is faster (1800ms vs 3500ms)
    const isLowHealth = this.health <= 20;
    const interval = isLowHealth ? 1800 : this.attackInterval;
    this.nextAttackTime = time + interval;

    if (this.attackCycle === 0) {
      this.shootTargeted();
      this.attackCycle = 1;
    } else {
      this.shootRadial();
      this.attackCycle = 0;
    }
  }

  // Attack 1: Fire aimed lasers towards player position (5 lasers when low health, 3 normally)
  shootTargeted() {
    if (!this.scene.player || !this.scene.player.active) return;

    const isLowHealth = this.health <= 20;
    const count = isLowHealth ? 5 : 3;
    const delay = isLowHealth ? 140 : 200;
    const speed = isLowHealth ? 340 : 280;

    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * delay, () => {
        if (!this.active || this.bossState !== 'active' || !this.scene.player || !this.scene.player.active) return;

        const angle = Phaser.Math.Angle.Between(this.x, this.y + 40, this.scene.player.x, this.scene.player.y);
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

  // Attack 2: Fire lasers in a radial circle (18 lasers when low health, 12 normally)
  shootRadial() {
    const isLowHealth = this.health <= 20;
    const laserCount = isLowHealth ? 18 : 12;
    const speed = isLowHealth ? 230 : 180;
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
