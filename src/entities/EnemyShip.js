// Reusable Enemy Spaceship entity component with shooting capability
class EnemyShip extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    const key = (typeof textureKey === 'string' && textureKey) ? textureKey : 'enemyRed';
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.points = 50; // Points awarded for destroying enemy ship
    this.setScale(0.8);
    this.resetShip();
  }

  // Reset ship parameters for spawning/recycling
  resetShip() {
    const textures = ['enemyRed', 'enemyGreen', 'enemyBlue'];
    const chosenTexture = Phaser.Utils.Array.GetRandom(textures);
    this.setTexture(chosenTexture);
    if (this.body) {
      this.body.setSize(this.width, this.height);
    }

    const x = Phaser.Math.Between(60, GAME_CONFIG.width - 60);
    const y = Phaser.Math.Between(-100, -50);
    this.setPosition(x, y);

    this.startX = x;
    this.speedY = Phaser.Math.Between(90, 150); // Downward velocity
    this.waveAmplitude = Phaser.Math.Between(30, 70); // Horizontal weaving amplitude
    this.waveFrequency = Phaser.Math.FloatBetween(0.002, 0.004); // Weaving frequency
    this.lastFired = 0;
    this.fireInterval = Phaser.Math.Between(1200, 2200); // Shoot delay in ms

    this.setActive(true);
    this.setVisible(true);
  }

  update(time, delta) {
    if (!this.active) return;

    const deltaSec = delta / 1000;
    this.y += this.speedY * deltaSec;
    this.x = Phaser.Math.Clamp(
      this.startX + Math.sin(time * this.waveFrequency) * this.waveAmplitude,
      40,
      GAME_CONFIG.width - 40
    );

    // Periodically shoot laser at player
    if (time > this.lastFired && this.y > 20 && this.y < GAME_CONFIG.height - 100) {
      this.shootLaser(time);
    }

    // Recycle ship when off-screen
    if (this.y > GAME_CONFIG.height + 60) {
      this.resetShip();
    }
  }

  // Shoot laser projectile downwards towards player
  shootLaser(time) {
    this.lastFired = time + Phaser.Math.Between(1500, 2500);
    if (this.scene && this.scene.enemyBullets) {
      const bullet = this.scene.enemyBullets.get();
      if (bullet) {
        bullet.fire(this.x, this.y + 25, GAME_CONFIG.enemyBulletSpeed, false);
      }
    }
  }
}

// Manager class orchestrating continuous enemy ship spawning
class EnemyShipGroup {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ classType: EnemyShip, runChildUpdate: true });
    this.nextSpawnTime = 0;
    this.initialSpawn();
  }

  initialSpawn() {
    for (let i = 0; i < 2; i++) {
      const ship = this.group.get();
      if (ship) {
        ship.resetShip();
        ship.y -= i * 150;
      }
    }
  }

  update(time, delta) {
    if (time > this.nextSpawnTime) {
      const ship = this.group.get();
      if (ship) {
        ship.resetShip();
      }
      this.nextSpawnTime = time + Phaser.Math.Between(2500, 4500); // Spawning interval for enemy ships
    }
  }
}
