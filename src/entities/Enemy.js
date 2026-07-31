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

    const x = Phaser.Math.Between(40, this.scene.scale.width - 40); // Pick random horizontal position
    const y = Phaser.Math.Between(-80, -40); // Pick random off-screen vertical spawn height
    this.setPosition(x, y); // Set sprite coordinates

    const scale = Phaser.Math.FloatBetween(0.7, 1.2); // Pick random scale factor
    this.setScale(scale); // Set sprite graphic scale

    const destroyedCount = this.scene.enemyGroup ? this.scene.enemyGroup.destroyedCount : 0;
    // Gentle 1.5% compounding speed increase per destroyed meteorite, capped at 1.5x maximum
    const speedMultiplier = Math.min(1.5, Math.pow(1.015, destroyedCount));

    this.speedY = Phaser.Math.Between(150, 250) * speedMultiplier; // Pick baseline downward speed with gentle growth
    this.speedX = Phaser.Math.Between(-30, 30) * speedMultiplier; // Pick random slight horizontal drift
    this.rotationSpeed = Phaser.Math.FloatBetween(-0.04, 0.04) * speedMultiplier; // Pick random spin rotation rate

    this.setActive(true); // Enable object in active pool
    this.setVisible(true); // Show sprite graphics
  }

  // Frame update lifecycle to move meteorite downwards and spin
  update(time, delta) {
    if (!this.active) return; // Guard clause if inactive

    // CHEAT: freeze slows all enemies to 20% speed
    const freezeMult = (ACTIVE_CHEATS && ACTIVE_CHEATS.freeze) ? 0.20 : 1.0;

    const deltaSec = delta / 1000; // Convert time delta to seconds
    this.y += this.speedY * deltaSec * freezeMult; // Fall downwards (slowed if freeze cheat active)
    this.x += this.speedX * deltaSec * freezeMult; // Apply slight horizontal drift
    this.rotation += this.rotationSpeed * freezeMult; // Spin meteorite graphic

    // Visual tint: blue tint when frozen
    if (ACTIVE_CHEATS && ACTIVE_CHEATS.freeze) {
      this.setTint(0x88ccff);
    } else {
      this.clearTint();
    }

    // Recycle meteorite when it passes below bottom screen boundary
    if (this.y > this.scene.scale.height + 60) {
      this.resetMeteor(); // Respawn meteorite at top of screen
    }
  }
}

// Manager class orchestrating balanced meteorite spawning and wave progression
class EnemyGroup {
  // Construct meteorite swarm manager inside given scene
  constructor(scene) {
    this.scene = scene; // Store scene reference
    this.group = scene.physics.add.group({ classType: Enemy, runChildUpdate: true }); // Create physics group container
    this.nextSpawnTime = 0; // Timestamp of next meteorite spawn
    this.spawnInterval = 1800; // Spawn delay in milliseconds
    this.destroyedCount = 0; // Track count of meteorites destroyed by player
    this.targetCount = 25; // Target count needed to trigger victory

    this.initialSpawn(); // Spawn initial wave of falling meteorites
  }

  // Spawn initial cluster of meteorites staggered vertically above the screen
  initialSpawn() {
    for (let i = 0; i < 3; i++) {
      const meteor = this.group.get(); // Fetch free meteorite from group pool
      if (meteor) {
        meteor.resetMeteor(); // Reset meteorite to top of screen
        meteor.y -= i * 100; // Stagger vertical spawn positions
      }
    }
  }

  // Update loop for continuous random meteorite spawning
  update(time, delta) {
    // Continuously spawn meteorites at reduced frequency intervals
    if (time > this.nextSpawnTime) {
      const meteor = this.group.get(); // Fetch free meteorite from group pool
      if (meteor) {
        meteor.resetMeteor(); // Reset meteorite to random spawn location
      }
      this.nextSpawnTime = time + Phaser.Math.Between(1400, 2400); // Reduced spawn frequency
    }
  }
}
