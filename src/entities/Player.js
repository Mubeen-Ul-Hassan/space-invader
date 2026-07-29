// Reusable Player ship game object with controls and firing logic
class Player extends Phaser.Physics.Arcade.Sprite {
  // Construct player ship with physics body and input listeners
  constructor(scene, x, y) {
    super(scene, x, y, 'player'); // Call parent Sprite constructor
    scene.add.existing(this); // Add player sprite to current scene
    scene.physics.add.existing(this); // Register body with Arcade Physics

    this.setCollideWorldBounds(true); // Prevent player ship from moving outside screen bounds
    this.setScale(0.7); // Adjust sprite size for ideal visual proportion
    this.lastFired = 0; // Timestamp of previous laser shot fired

    this.cursors = scene.input.keyboard.createCursorKeys(); // Register arrow keys input listener
    this.wasd = scene.input.keyboard.addKeys('A,D,SPACE'); // Register WASD and Space key listeners

    // Set up touch drag controls for responsive mobile gameplay
    scene.input.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        this.x = Phaser.Math.Clamp(pointer.x, 30, GAME_CONFIG.width - 30); // Move ship directly to pointer touch x-position
      }
    });
  }

  // Update loop for handling keyboard inputs and automatic boundaries
  update(time, delta) {
    let velocityX = 0; // Default zero horizontal speed

    // Check left movement key inputs
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -GAME_CONFIG.playerSpeed; // Move ship left
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = GAME_CONFIG.playerSpeed; // Move ship right
    }

    this.setVelocityX(velocityX); // Apply calculated horizontal speed to physics body

    // Check auto-shoot / space key input
    if ((this.cursors.space.isDown || this.wasd.SPACE.isDown || this.scene.input.activePointer.isDown) && time > this.lastFired) {
      this.shoot(time); // Attempt firing laser weapon
    }
  }

  // Shoot laser projectile from player ship
  shoot(time) {
    const bullet = this.scene.playerBullets.get(); // Retrieve available bullet from object pool
    if (bullet) {
      bullet.fire(this.x, this.y - 30, -GAME_CONFIG.bulletSpeed, true); // Launch laser upwards
      this.lastFired = time + GAME_CONFIG.playerFireRate; // Set next allowed fire timestamp
      if (this.scene.audioManager) {
        this.scene.audioManager.playShoot(); // Trigger laser audio effect
      }
    }
  }
}
