// Reusable Player ship game object with 4-directional movement (Left, Right, Up, Down), firing logic, and power-up boosts
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(0.7);
    this.lastFired = 0;
    this.fireRateBoostUntil = 0;
    this.shieldUntil = 0;

    // Visual glowing shield aura sprite overlay
    this.shieldAura = scene.add.image(x, y, 'shield1').setScale(1.2).setAlpha(0.85);
    this.shieldAura.setVisible(false);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D,SPACE');

    // Touch & Mouse Drag controls supporting 2D screen movement (x, y)
    scene.input.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        this.x = Phaser.Math.Clamp(pointer.x, 30, scene.scale.width - 30);
        this.y = Phaser.Math.Clamp(pointer.y, 100, scene.scale.height - 40);
      }
    });
  }

  // Activate 12-second rapid fire boost
  activateRapidFire(durationMs = 12000) {
    this.fireRateBoostUntil = this.scene.time.now + durationMs;
  }

  // Activate 15-second shield immunity
  activateShield(durationMs = 15000) {
    this.shieldUntil = this.scene.time.now + durationMs;
    this.shieldAura.setVisible(true);
  }

  // Check if shield is currently active
  isShieldActive() {
    return this.scene.time.now < this.shieldUntil;
  }

  update(time, delta) {
    let velocityX = 0;
    let velocityY = 0;

    // Horizontal controls (Left / Right)
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -GAME_CONFIG.playerSpeed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = GAME_CONFIG.playerSpeed;
    }

    // Vertical controls (Up / Down)
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -GAME_CONFIG.playerSpeed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = GAME_CONFIG.playerSpeed;
    }

    this.setVelocity(velocityX, velocityY);

    // Keep ship within playable screen boundaries
    this.y = Phaser.Math.Clamp(this.y, 100, this.scene.scale.height - 40);

    // Update attached shield aura position and visibility
    if (this.shieldAura) {
      this.shieldAura.setPosition(this.x, this.y);
      const shieldActive = time < this.shieldUntil;
      this.shieldAura.setVisible(shieldActive);
      if (shieldActive) {
        this.shieldAura.rotation += 0.02; // Rotate shield visual aura
      }
    }

    // Auto-shoot / space key input with rapid fire support
    if ((this.cursors.space.isDown || this.wasd.SPACE.isDown || this.scene.input.activePointer.isDown) && time > this.lastFired) {
      this.shoot(time);
    }

    // Visual indicator: golden tint when enderlein cheat is active
    if (ACTIVE_CHEATS && ACTIVE_CHEATS.enderlein) {
      this.setTint(0xffcc00);
    } else if (!this.isShieldActive()) {
      this.clearTint();
    }
  }

  shoot(time) {
    // CHEAT: enderlein grants ultra-rapid triple spread fire
    const isEnderlein = ACTIVE_CHEATS && ACTIVE_CHEATS.enderlein;
    const isRapid = time < this.fireRateBoostUntil;

    if (isEnderlein) {
      // Triple spread: center + angled left/right bullets
      const offsets = [{ x: 0, vx: 0 }, { x: -12, vx: -80 }, { x: 12, vx: 80 }];
      offsets.forEach(off => {
        const bullet = this.scene.playerBullets.get();
        if (bullet) {
          bullet.fire(this.x + off.x, this.y - 30, -GAME_CONFIG.bulletSpeed, true);
          // Apply slight horizontal spread to angled bullets via body velocity
          if (off.vx !== 0 && bullet.body) {
            bullet.body.velocity.x = off.vx;
          }
        }
      });
      this.lastFired = time + 40; // Ultra-fast 40ms fire rate
    } else {
      const bullet = this.scene.playerBullets.get();
      if (bullet) {
        bullet.fire(this.x, this.y - 30, -GAME_CONFIG.bulletSpeed, true);
        const delay = isRapid ? 120 : GAME_CONFIG.playerFireRate;
        this.lastFired = time + delay;
      }
    }

    if (this.scene.audioManager) {
      this.scene.audioManager.playShoot();
    }
  }
}
