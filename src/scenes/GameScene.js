// Main GameScene managing gameplay state, physics collisions, enemy ships, and win/loss rules
class GameScene extends Phaser.Scene {
  // Construct GameScene with scene key
  constructor() {
    super({ key: 'GameScene' }); // Register scene key identifier
  }

  // Initialize game objects, background, audio, physics, and input events
  create() {
    this.score = 0; // Initialize player score
    this.lives = GAME_CONFIG.initialLives; // Initialize remaining lives count
    this.isGameOver = false; // Flag checking if game session ended

    this.audioManager = new AudioManager(); // Instantiate procedural WebAudio sound manager

    // Render fast scrolling background image tile for forward space flight
    this.bg = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'background').setOrigin(0, 0); // Render tiled space background image

    // Instantiate bullet object pool for player laser projectiles
    this.playerBullets = this.physics.add.group({ classType: Bullet, maxSize: 12, runChildUpdate: true }); // Player bullet pool

    // Instantiate bullet object pool for enemy laser projectiles
    this.enemyBullets = this.physics.add.group({ classType: Bullet, maxSize: 20, runChildUpdate: true }); // Enemy bullet pool

    // Instantiate custom Player starship entity
    this.player = new Player(this, GAME_CONFIG.width / 2, GAME_CONFIG.height - 70); // Create player ship object

    // Instantiate dynamic falling MeteorGroup spawner
    this.enemyGroup = new EnemyGroup(this); // Build falling meteorite swarm spawner

    // Instantiate enemy ship group spawner
    this.enemyShipGroup = new EnemyShipGroup(this); // Build enemy ship swarm spawner

    // Set up Arcade Physics collision handling rules
    this.setupCollisions(); // Register physics overlap and collision listeners
  }

  // Register all collision and overlap handlers between game entities
  setupCollisions() {
    // Player bullet hits falling meteorite
    this.physics.add.overlap(this.playerBullets, this.enemyGroup.group, (bullet, meteor) => {
      if (bullet.active && meteor.active) {
        bullet.kill(); // Recycle player bullet back to object pool
        this.createExplosion(meteor.x, meteor.y); // Spawn particle explosion effect
        this.score += meteor.points; // Add points awarded by meteorite
        this.enemyGroup.destroyedCount += 1; // Increment count of destroyed meteorites
        this.events.emit('scoreChanged', this.score); // Emit score update event to UIScene
        this.audioManager.playExplosion(); // Play explosion audio effect
        meteor.resetMeteor(); // Respawn meteorite at top of screen

        // Check if player reached target count (Win State)
        if (this.enemyGroup.destroyedCount >= this.enemyGroup.targetCount) {
          this.triggerWin(); // Handle game win victory state
        }
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
        ship.resetShip();
      }
    });

    // Enemy laser bullet hits player ship
    this.physics.add.overlap(this.enemyBullets, this.player, (player, bullet) => {
      if (bullet.active && !this.isGameOver) {
        bullet.kill();
        this.createExplosion(player.x, player.y);
        this.handlePlayerDamage();
      }
    });

    // Enemy ship collides directly with player ship
    this.physics.add.overlap(this.enemyShipGroup.group, this.player, (player, ship) => {
      if (ship.active && !this.isGameOver) {
        this.createExplosion(ship.x, ship.y);
        ship.resetShip();
        this.handlePlayerDamage();
      }
    });

    // Falling meteorite collides directly with player ship
    this.physics.add.overlap(this.enemyGroup.group, this.player, (player, meteor) => {
      if (meteor.active && !this.isGameOver) {
        this.createExplosion(meteor.x, meteor.y); // Spawn explosion particle effect at player location
        meteor.resetMeteor(); // Respawn meteorite at top of screen
        this.handlePlayerDamage();
      }
    });
  }

  // Handle player damage when struck by hazards
  handlePlayerDamage() {
    this.lives -= 1; // Decrement player lives
    this.events.emit('livesChanged', this.lives); // Emit lives update event to UIScene
    this.audioManager.playHit(); // Play player damage audio effect

    if (this.lives <= 0) {
      this.triggerGameOver(); // Handle game over loss state when lives depleted
    } else {
      this.tweens.add({ targets: this.player, alpha: 0.2, duration: 100, yoyo: true, repeat: 3 }); // Flash player ship red invulnerability visual feedback
    }
  }

  // Create blast explosion visual effect using blast texture and particle burst
  createExplosion(x, y) {
    const blast = this.add.image(x, y, 'blast').setScale(0.5); // Spawn fire blast sprite
    this.tweens.add({
      targets: blast,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 250,
      onComplete: () => blast.destroy() // Destroy blast sprite when animation finishes
    }); // Animate blast expansion and fade out

    const damageKeys = ['damage1', 'damage2', 'damage3', 'damage4', 'damage5', 'damage6', 'damage7', 'damage8', 'damage9'];
    const chosenKeys = Phaser.Utils.Array.Shuffle(damageKeys).slice(0, 2); // Pick two random distinct damage assets

    const emitters = chosenKeys.map(key => {
      return this.add.particles(x, y, key, {
        speed: { min: 60, max: 180 },
        scale: { start: 0.4, end: 0 },
        lifespan: 250,
        quantity: 4
      });
    }); // Create supporting damage particle bursts for realistic debris
    this.time.delayedCall(250, () => {
      emitters.forEach(emitter => emitter.destroy());
    }); // Clean up particle emitter instances
  }

  // Main frame update loop for scrolling background and entity updates
  update(time, delta) {
    if (this.isGameOver) return; // Stop update loop logic if game is over

    this.bg.tilePositionY -= 3.5; // Scroll background graphics rapidly for forward space flight sensation
    this.player.update(time, delta); // Call update method on player ship entity
    this.enemyGroup.update(time, delta); // Call update method on meteorite spawner
    this.enemyShipGroup.update(time, delta); // Call update method on enemy ship spawner
  }

  // Trigger Victory Win State
  triggerWin() {
    if (this.isGameOver) return; // Guard clause against duplicate triggers
    this.isGameOver = true; // Set game over status flag
    this.audioManager.playWin(); // Play victory audio jingle
    this.events.emit('gameWin'); // Emit game win event to UIScene
  }

  // Trigger Defeat Game Over State
  triggerGameOver() {
    if (this.isGameOver) return; // Guard clause against duplicate triggers
    this.isGameOver = true; // Set game over status flag
    this.player.setTint(0xff0000); // Tint player ship sprite red
    this.audioManager.playGameOver(); // Play game over audio jingle
    this.events.emit('gameOver'); // Emit game over event to UIScene
  }
}
