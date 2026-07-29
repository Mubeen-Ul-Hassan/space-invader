// Reusable Falling Meteorite obstacle sprite component
class Enemy extends Phaser.Physics.Arcade.Sprite {
  // Construct falling meteorite obstacle with texture key and points reward
  constructor(scene, x, y, textureKey, points) {
    const key = (typeof textureKey === 'string' && textureKey) ? textureKey : 'stone'; // Default to stone texture
    super(scene, x, y, key); // Call parent Sprite constructor
    scene.add.existing(this); // Render sprite in active scene
    scene.physics.add.existing(this); // Register body with Arcade physics engine

    this.points = points || 20; // Assign score point reward value
    this.resetMeteor(); // Initialize random position, scale, and velocity parameters
  }

  // Reset meteorite parameters for spawning/recycling
  resetMeteor() {
    const textures = ['stone', 'stoneBig']; // Available stone meteor textures
    const chosenTexture = Phaser.Utils.Array.GetRandom(textures); // Pick random texture
    this.setTexture(chosenTexture); // Assign valid texture to sprite
    if (this.body) {
      this.body.setSize(this.width, this.height); // Refresh physics body size
    }

    const x = Phaser.Math.Between(40, GAME_CONFIG.width - 40); // Pick random horizontal position
    const y = Phaser.Math.Between(-80, -40); // Pick random off-screen vertical spawn height
    this.setPosition(x, y); // Set sprite coordinates

    const scale = Phaser.Math.FloatBetween(0.7, 1.2); // Pick random scale factor
    this.setScale(scale); // Set sprite graphic scale

    this.speedY = Phaser.Math.Between(180, 340); // Pick random downward fall speed
    this.speedX = Phaser.Math.Between(-40, 40); // Pick random slight horizontal drift
    this.rotationSpeed = Phaser.Math.FloatBetween(-0.05, 0.05); // Pick random spin rotation rate

    this.setActive(true); // Enable object in active pool
    this.setVisible(true); // Show sprite graphics
  }

  // Frame update lifecycle to move meteorite downwards and spin
  update(time, delta) {
    if (!this.active) return; // Guard clause if inactive

    const deltaSec = delta / 1000; // Convert time delta to seconds
    this.y += this.speedY * deltaSec; // Fall downwards through space
    this.x += this.speedX * deltaSec; // Apply slight horizontal drift
    this.rotation += this.rotationSpeed; // Spin meteorite graphic

    // Recycle meteorite when it passes below bottom screen boundary
    if (this.y > GAME_CONFIG.height + 60) {
      this.resetMeteor(); // Respawn meteorite at top of screen
    }
  }
}

// Manager class orchestrating continuous random meteorite spawning and wave progression
class EnemyGroup {
  // Construct meteorite swarm manager inside given scene
  constructor(scene) {
    this.scene = scene; // Store scene reference
    this.group = scene.physics.add.group({ classType: Enemy, runChildUpdate: true }); // Create physics group container
    this.nextSpawnTime = 0; // Timestamp of next meteorite spawn
    this.spawnInterval = 800; // Spawn delay in milliseconds
    this.destroyedCount = 0; // Track count of meteorites destroyed by player
    this.targetCount = 25; // Target count needed to trigger victory

    this.initialSpawn(); // Spawn initial wave of falling meteorites
  }

  // Spawn initial cluster of meteorites staggered vertically above the screen
  initialSpawn() {
    for (let i = 0; i < 6; i++) {
      const meteor = this.group.get(); // Fetch free meteorite from group pool
      if (meteor) {
        meteor.resetMeteor(); // Reset meteorite to top of screen
        meteor.y -= i * 60; // Stagger vertical spawn positions
      }
    }
  }

  // Update loop for continuous random meteorite spawning
  update(time, delta) {
    // Continuously spawn meteorites at random intervals
    if (time > this.nextSpawnTime) {
      const meteor = this.group.get(); // Fetch free meteorite from group pool
      if (meteor) {
        meteor.resetMeteor(); // Reset meteorite to random spawn location
      }
      this.nextSpawnTime = time + Phaser.Math.Between(500, 1100); // Schedule next random spawn timestamp
    }
  }
}
