// Reusable defense bunker barrier block
class Shield extends Phaser.Physics.Arcade.Sprite {
  // Construct shield sprite with custom durability health
  constructor(scene, x, y) {
    super(scene, x, y, 'stone'); // Call parent Sprite constructor with stone meteor texture
    scene.add.existing(this); // Add graphic sprite to current scene
    scene.physics.add.existing(this, true); // Create static physics body for collision

    this.setScale(0.8); // Scale stone graphic to fit playfield barrier
    this.health = 3; // Set initial structural durability hits
  }

  // Handle damage impact when hit by projectile
  takeDamage() {
    this.health -= 1; // Decrement shield durability points
    if (this.health <= 0) {
      this.destroy(); // Remove object from game when health depleted
    } else {
      this.setAlpha(this.health / 4); // Reduce visual transparency to reflect damage state
    }
  }
}
