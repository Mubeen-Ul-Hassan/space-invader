// Reusable single Enemy Invader sprite component
class Enemy extends Phaser.Physics.Arcade.Sprite {
  // Construct enemy invader with row tier texture and point value
  constructor(scene, x, y, textureKey, points) {
    super(scene, x, y, textureKey); // Call parent Sprite constructor
    scene.add.existing(this); // Render sprite in active scene
    scene.physics.add.existing(this); // Register static body in Arcade physics engine

    this.setScale(0.65); // Scale sprite graphic
    this.points = points; // Assign score point reward value
  }
}

// Manager class orchestrating enemy invader swarm formation and movement
class EnemyGroup {
  // Construct enemy formation grid inside given scene
  constructor(scene) {
    this.scene = scene; // Store scene reference
    this.group = scene.physics.add.group(); // Create physics arcade group container
    this.direction = 1; // Movement direction (1 = right, -1 = left)
    this.moveSpeed = GAME_CONFIG.enemyBaseSpeed; // Initial horizontal movement speed
    this.lastFired = 0; // Timestamp of previous enemy shot

    this.createGrid(); // Construct initial matrix grid of enemies
  }

  // Build grid layout matrix of invader enemies
  createGrid() {
    const startX = 120; // Starting horizontal margin offset
    const startY = 80; // Starting vertical top offset
    const spacingX = 65; // Horizontal gap between column centers
    const spacingY = 50; // Vertical gap between row centers

    const textures = ['enemyRed', 'enemyGreen', 'enemyGreen', 'enemyBlue']; // Texture list per row tier
    const pointValues = [30, 20, 20, 10]; // Score values awarded per row tier

    for (let row = 0; row < GAME_CONFIG.enemyRows; row++) {
      for (let col = 0; col < GAME_CONFIG.enemyCols; col++) {
        const x = startX + col * spacingX; // Compute enemy column x coordinate
        const y = startY + row * spacingY; // Compute enemy row y coordinate
        const texture = textures[row % textures.length]; // Pick row tier sprite texture
        const points = pointValues[row % pointValues.length]; // Pick row tier point value

        const enemy = new Enemy(this.scene, x, y, texture, points); // Instantiate custom Enemy object
        this.group.add(enemy); // Add enemy to group container
      }
    }
  }

  // Update enemy swarm movement and boundary checking
  update(time, delta) {
    const enemies = this.group.getChildren(); // Fetch all active enemy instances
    if (enemies.length === 0) return; // Exit early if all enemies are defeated

    let shiftDown = false; // Flag indicating if swarm hit boundary
    const deltaSeconds = delta / 1000; // Convert time delta to seconds fraction

    // Check if any enemy has reached screen horizontal edges
    for (let enemy of enemies) {
      if (enemy.active) {
        if ((this.direction === 1 && enemy.x >= GAME_CONFIG.width - 50) ||
            (this.direction === -1 && enemy.x <= 50)) {
          shiftDown = true; // Trigger row step down
          break; // Stop scanning after finding edge collision
        }
      }
    }

    if (shiftDown) {
      this.direction *= -1; // Reverse horizontal swarm direction
      for (let enemy of enemies) {
        if (enemy.active) {
          enemy.y += GAME_CONFIG.enemyStepDown; // Shift enemy down by step offset
        }
      }
      // Speed up swarm movement as fewer enemies remain
      const totalEnemies = GAME_CONFIG.enemyRows * GAME_CONFIG.enemyCols; // Maximum initial count
      const remainingRatio = enemies.length / totalEnemies; // Remaining percentage fraction
      this.moveSpeed = GAME_CONFIG.enemyBaseSpeed + (1 - remainingRatio) * 120; // Accelerate movement speed
    } else {
      for (let enemy of enemies) {
        if (enemy.active) {
          enemy.x += this.direction * this.moveSpeed * deltaSeconds; // Move enemy horizontally
        }
      }
    }

    // Fire random alien bullet at intervals
    if (time > this.lastFired) {
      this.fireRandomBullet(time); // Attempt firing enemy laser
    }
  }

  // Pick a random lowest enemy in a column to shoot a laser
  fireRandomBullet(time) {
    const enemies = this.group.getChildren().filter(e => e.active); // Filter active enemies
    if (enemies.length === 0) return; // Exit if no enemies remain

    const randomEnemy = Phaser.Utils.Array.GetRandom(enemies); // Select random active enemy shooter
    const bullet = this.scene.enemyBullets.get(); // Fetch free bullet from enemy bullet pool
    if (bullet) {
      bullet.fire(randomEnemy.x, randomEnemy.y + 20, GAME_CONFIG.enemyBulletSpeed, false); // Launch laser downwards
      this.lastFired = time + GAME_CONFIG.enemyFireRate; // Set next allowed enemy firing timestamp
    }
  }
}
