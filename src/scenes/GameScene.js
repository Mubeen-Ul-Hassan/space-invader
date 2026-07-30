// Main GameScene managing gameplay state, physics collisions, enemy waves, and power-up collectibles
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.score = 0;
    this.lives = GAME_CONFIG.initialLives;
    this.isGameOver = false;

    this.audioManager = new AudioManager();

    this.bg = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'background').setOrigin(0, 0);

    this.playerBullets = this.physics.add.group({ classType: Bullet, maxSize: 16, runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: Bullet, maxSize: 20, runChildUpdate: true });

    this.player = new Player(this, GAME_CONFIG.width / 2, GAME_CONFIG.height - 70);

    this.enemyGroup = new EnemyGroup(this);
    this.enemyShipGroup = new EnemyShipGroup(this);
    this.powerUpGroup = new PowerUpGroup(this);

    this.waveManager = new WaveManager(this);

    this.setupCollisions();

    // Start wave progression
    this.waveManager.startNextWave();
  }

  setupCollisions() {
    // Player bullet hits falling meteorite
    this.physics.add.overlap(this.playerBullets, this.enemyGroup.group, (bullet, meteor) => {
      if (bullet.active && meteor.active) {
        bullet.kill();
        this.createExplosion(meteor.x, meteor.y);
        this.score += meteor.points;
        this.events.emit('scoreChanged', this.score);
        this.audioManager.playExplosion();

        // Drop random power-up with reduced 10% spawn frequency
        this.powerUpGroup.dropRandomPowerUp(meteor.x, meteor.y, 0.10);

        meteor.setActive(false).setVisible(false);
        this.waveManager.onEnemyDestroyed();
      }
    });

    // Player bullet hits enemy ship
    this.physics.add.overlap(this.playerBullets, this.enemyShipGroup.group, (bullet, ship) => {
      if (bullet.active && ship.active) {
        bullet.kill();
        this.createExplosion(ship.x, ship.y);
        this.score += ship.points;
        this.events.emit('scoreChanged', this.score);
        this.audioManager.playExplosion();

        // Drop random power-up with reduced 10% spawn frequency
        this.powerUpGroup.dropRandomPowerUp(ship.x, ship.y, 0.10);

        ship.setActive(false).setVisible(false);
        this.waveManager.onEnemyDestroyed();
      }
    });

    // Player collects power-up
    this.physics.add.overlap(this.player, this.powerUpGroup.group, (player, powerUp) => {
      if (powerUp.active && !this.isGameOver) {
        const pType = powerUp.powerUpType;
        powerUp.kill();
        this.audioManager.playShoot();

        if (pType === 'pillRed') {
          this.lives = Math.min(5, this.lives + 1);
          this.events.emit('livesChanged', this.lives);
        } else if (pType === 'powerupRed') {
          this.player.activateRapidFire(12000);
        } else if (pType === 'shield') {
          this.player.activateShield(15000);
        }
      }
    });

    // Enemy laser bullet hits player ship
    this.physics.add.overlap(this.enemyBullets, this.player, (player, bullet) => {
      if (bullet.active && !this.isGameOver) {
        bullet.kill();
        if (!this.player.isShieldActive()) {
          this.createExplosion(player.x, player.y);
          this.handlePlayerDamage();
        }
      }
    });

    // Enemy ship collides directly with player ship
    this.physics.add.overlap(this.enemyShipGroup.group, this.player, (player, ship) => {
      if (ship.active && !this.isGameOver) {
        this.createExplosion(ship.x, ship.y);
        ship.setActive(false).setVisible(false);
        this.waveManager.onEnemyDestroyed();
        if (!this.player.isShieldActive()) {
          this.handlePlayerDamage();
        }
      }
    });

    // Falling meteorite collides directly with player ship
    this.physics.add.overlap(this.enemyGroup.group, this.player, (player, meteor) => {
      if (meteor.active && !this.isGameOver) {
        this.createExplosion(meteor.x, meteor.y);
        meteor.setActive(false).setVisible(false);
        this.waveManager.onEnemyDestroyed();
        if (!this.player.isShieldActive()) {
          this.handlePlayerDamage();
        }
      }
    });
  }

  handlePlayerDamage() {
    if (this.player.isShieldActive()) return;

    this.lives -= 1;
    this.events.emit('livesChanged', this.lives);
    this.audioManager.playHit();

    if (this.lives <= 0) {
      this.triggerGameOver();
    } else {
      this.tweens.add({ targets: this.player, alpha: 0.2, duration: 100, yoyo: true, repeat: 3 });
    }
  }

  createExplosion(x, y) {
    const blast = this.add.image(x, y, 'blast').setScale(0.5);
    this.tweens.add({
      targets: blast,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 250,
      onComplete: () => blast.destroy()
    });

    const damageKeys = ['damage1', 'damage2', 'damage3', 'damage4', 'damage5', 'damage6', 'damage7', 'damage8', 'damage9'];
    const chosenKeys = Phaser.Utils.Array.Shuffle(damageKeys).slice(0, 2);

    const emitters = chosenKeys.map(key => {
      return this.add.particles(x, y, key, {
        speed: { min: 60, max: 180 },
        scale: { start: 0.4, end: 0 },
        lifespan: 250,
        quantity: 4
      });
    });
    this.time.delayedCall(250, () => {
      emitters.forEach(emitter => emitter.destroy());
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    this.bg.tilePositionY -= 3.5;
    this.player.update(time, delta);
    this.enemyGroup.update(time, delta);
    this.enemyShipGroup.update(time, delta);
  }

  triggerWin() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.audioManager.playWin();
    this.events.emit('gameWin');
  }

  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.setTint(0xff0000);
    this.audioManager.playGameOver();
    this.events.emit('gameOver');
  }
}
