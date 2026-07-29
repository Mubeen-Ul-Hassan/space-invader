// Main GameScene managing gameplay state, physics collisions, and win/loss rules
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

    // Render scrolling background image tile
    this.bg = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'background').setOrigin(0, 0); // Render tiled space background image

    // Instantiate bullet object pools for physics collisions
    this.playerBullets = this.physics.add.group({ classType: Bullet, maxSize: 10, runChildUpdate: true }); // Player bullet pool
    this.enemyBullets = this.physics.add.group({ classType: Bullet, maxSize: 20, runChildUpdate: true }); // Enemy bullet pool

    // Instantiate custom Player starship entity
    this.player = new Player(this, GAME_CONFIG.width / 2, GAME_CONFIG.height - 70); // Create player ship object

    // Instantiate defense bunker shields
    this.createShields(); // Spawn defensive barrier bunkers

    // Instantiate custom EnemyGroup swarm manager
    this.enemyGroup = new EnemyGroup(this); // Build invader formation grid

    // Set up Arcade Physics collision handling rules
    this.setupCollisions(); // Register physics overlap and collision listeners
  }

  // Construct defensive bunker shield blocks across the screen width
  createShields() {
    this.shields = this.physics.add.staticGroup(); // Create static group for defense bunkers
    const shieldPositions = [150, 310, 490, 650]; // X positions for 4 shield bunkers

    shieldPositions.forEach(x => {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          const shieldBlock = new Shield(this, x + col * 12, GAME_CONFIG.height - 150 + row * 12); // Build individual shield tile block
          this.shields.add(shieldBlock); // Add block to static shield group
        }
      }
    });
  }

  // Register all collision and overlap handlers between game entities
  setupCollisions() {
    // Player bullet hits enemy invader
    this.physics.add.overlap(this.playerBullets, this.enemyGroup.group, (bullet, enemy) => {
      if (bullet.active && enemy.active) {
        bullet.kill(); // Recycle player bullet back to object pool
        this.createExplosion(enemy.x, enemy.y); // Spawn particle explosion effect
        this.score += enemy.points; // Add points awarded by enemy type
        this.events.emit('scoreChanged', this.score); // Emit score update event to UIScene
        this.audioManager.playExplosion(); // Play explosion audio effect
        enemy.destroy(); // Destroy hit enemy sprite

        // Check if all invaders are destroyed (Win State)
        if (this.enemyGroup.group.countActive() === 0) {
          this.triggerWin(); // Handle game win victory state
        }
      }
    });

    // Player bullet hits defense shield block
    this.physics.add.overlap(this.playerBullets, this.shields, (bullet, shieldBlock) => {
      if (bullet.active && shieldBlock.active) {
        bullet.kill(); // Recycle bullet back to pool
        shieldBlock.takeDamage(); // Damage shield barrier block
      }
    });

    // Enemy bullet hits defense shield block
    this.physics.add.overlap(this.enemyBullets, this.shields, (bullet, shieldBlock) => {
      if (bullet.active && shieldBlock.active) {
        bullet.kill(); // Recycle enemy bullet back to pool
        shieldBlock.takeDamage(); // Damage shield barrier block
      }
    });

    // Enemy bullet hits player ship
    this.physics.add.overlap(this.enemyBullets, this.player, (player, bullet) => {
      if (bullet.active && !this.isGameOver) {
        bullet.kill(); // Recycle enemy bullet back to pool
        this.createExplosion(player.x, player.y); // Spawn explosion particle effect at player location
        this.lives -= 1; // Decrement player lives
        this.events.emit('livesChanged', this.lives); // Emit lives update event to UIScene
        this.audioManager.playHit(); // Play player damage audio effect

        if (this.lives <= 0) {
          this.triggerGameOver(); // Handle game over loss state when lives depleted
        } else {
          this.tweens.add({ targets: player, alpha: 0.2, duration: 100, yoyo: true, repeat: 3 }); // Flash player ship red invulnerability visual feedback
        }
      }
    });
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

    const emitter = this.add.particles(x, y, 'star', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.5, end: 0 },
      lifespan: 250,
      quantity: 8
    }); // Create supporting star particle burst
    this.time.delayedCall(250, () => emitter.destroy()); // Clean up particle emitter instance
  }

  // Main frame update loop for scrolling background and swarm updates
  update(time, delta) {
    if (this.isGameOver) return; // Stop update loop logic if game is over

    this.bg.tilePositionY -= 0.5; // Scroll background graphics slowly vertically for starfield effect
    this.player.update(time, delta); // Call update method on player ship entity
    this.enemyGroup.update(time, delta); // Call update method on enemy swarm manager

    // Check if any invading enemy reached player bottom line (Game Over State)
    const enemies = this.enemyGroup.group.getChildren(); // Fetch remaining active enemies
    for (let enemy of enemies) {
      if (enemy.active && enemy.y >= GAME_CONFIG.height - 110) {
        this.triggerGameOver(); // Trigger game over when invaders reach player base
        break; // Exit loop after triggering game over
      }
    }
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
