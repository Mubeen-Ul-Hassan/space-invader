// Pooled bullet used for both player and enemy projectiles
class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey || 'laserPlayer');
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  // Fire from (x, y) with given vertical velocity
  fire(x, y, velocityY, isPlayerBullet = true, customTexture = null) {
    this.setTexture(customTexture || (isPlayerBullet ? 'laserPlayer' : 'laserEnemy'));
    if (this.body) {
      this.body.setSize(this.width, this.height, true);
    }
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(velocityY);
    this.isPlayerBullet = isPlayerBullet;
    this.rotation = 0;
  }

  // Recycle bullet once it leaves the screen
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y <= -50 || this.y >= this.scene.scale.height + 50 || this.x <= -50 || this.x >= this.scene.scale.width + 50) {
      this.kill();
    }
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
  }
}
