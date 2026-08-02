// Reusable Boss Spaceship entity component with two shooting modes: aimed burst and radial ring
class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bossShip');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.85); // Adjust scale to make it look big and powerful
    if (this.body) {
      this.body.setSize(this.width * 0.9, this.height * 0.8);
      this.body.setCollideWorldBounds(true);
    }

    this.maxHealth = 40;
    this.health = 40;
    this.bossState = 'entering'; // 'entering' | 'active' | 'dead'
    
    // Attacks timer and loop
    this.nextAttackTime = 0;
    this.attackInterval = 3500; // Attack every 3.5 seconds
    this.attackCycle = 0; // 0 = targeted, 1 = radial

    // Hover variables
    this.startX = x;
    this.targetY = 130; // Boss moves down to this Y coordinate
    this.speedY = 50;   // Slow entry speed

    // Custom health bar graphics
    this.healthBar = scene.add.graphics();
  }

  // Draw health bar on screen
  drawHealthBar() {
    this.healthBar.clear();
    if (!this.active || this.bossState === 'entering' || this.bossState === 'dead') return;

    const width = 300;
    const height = 12;
    const x = (this.scene.scale.width - width) / 2;
    const y = 60; // Render just below score hud

    // Border and background
    this.healthBar.fillStyle(0x0a0c16, 0.7);
    this.healthBar.fillRect(x, y, width, height);
    this.healthBar.lineStyle(1.5, 0xff0033, 0.9);
    this.healthBar.strokeRect(x, y, width, height);

    // Health filled bar
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
      // Active phase: hover side to side slowly
      this.x = this.startX + Math.sin(time * 0.001 * freezeMult) * 150;
      
      // Keep within bounds
      this.x = Phaser.Math.Clamp(this.x, 100, this.scene.scale.width - 100);

      // Periodically trigger attacks (disabled during freeze cheat)
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
        
        // Target player's current coordinate
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

  // Trigger hit damage
  damage(amount) {
    if (this.bossState !== 'active') return;

    this.health = Math.max(0, this.health - amount);
    
    // Set tint flash on hit
    this.setTint(0xff8888);
    this.hitTintTime = this.scene.time.now + 60; // flash for 60ms

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
