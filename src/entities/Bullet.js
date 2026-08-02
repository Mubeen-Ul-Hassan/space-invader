// Reusable Bullet class for player and enemy projectiles
class Bullet extends Phaser.Physics.Arcade.Sprite {
  // Construct bullet sprite with physics body enabled
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey || 'laserPlayer'); // Call parent Arcade Sprite constructor with default texture
    scene.add.existing(this); // Add sprite to scene render list
    scene.physics.add.existing(this); // Register body with physics engine
  }

  // Fire bullet from given coordinate with velocity vector
  fire(x, y, velocityY, isPlayerBullet = true, customTexture = null) {
    this.setTexture(customTexture || (isPlayerBullet ? 'laserPlayer' : 'laserEnemy')); // Assign laser texture based on shooter
    if (this.body) {
      this.body.setSize(this.width, this.height, true); // Update collision box and center it relative to sprite
    }
    this.body.reset(x, y); // Reset physics body to spawn position
    this.setActive(true); // Mark object active in pool
    this.setVisible(true); // Make object visible on screen
    this.setVelocityY(velocityY); // Set vertical movement speed
    this.isPlayerBullet = isPlayerBullet; // Store projectile ownership flag
    this.rotation = 0; // Reset rotation for recycled bullets
  }

  // Pre-update loop to recycle off-screen projectiles automatically
  preUpdate(time, delta) {
    super.preUpdate(time, delta); // Call parent sprite pre-update lifecycle
    if (this.y <= -50 || this.y >= this.scene.scale.height + 50 || this.x <= -50 || this.x >= this.scene.scale.width + 50) {
      this.kill(); // Deactivate bullet when off-screen bounds
    }
  }

  // Deactivate and hide bullet for reuse in object pool
  kill() {
    this.setActive(false); // Mark inactive for pool reuse
    this.setVisible(false); // Hide sprite graphics from render list
    this.setVelocity(0, 0); // Stop physical motion entirely
  }
}
