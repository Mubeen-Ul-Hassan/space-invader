// PowerUp collectible entity class and manager pool
class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const key = type || 'pillRed';
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerUpType = key;
    this.speedY = 130;
    this.setScale(0.9);
    this.setActive(true);
    this.setVisible(true);
  }

  spawn(x, y, type) {
    this.powerUpType = type;
    this.setTexture(type);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    if (this.body) {
      this.body.setSize(this.width, this.height);
    }
  }

  update(time, delta) {
    if (!this.active) return;

    const deltaSec = delta / 1000;
    this.y += this.speedY * deltaSec;

    if (this.y > GAME_CONFIG.height + 40) {
      this.kill();
    }
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.stop();
    }
  }
}

// Manager class handling PowerUp drops and group pooling
class PowerUpGroup {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ classType: PowerUp, runChildUpdate: true });
  }

  // Attempt to drop a power-up at (x, y) with a probability
  dropRandomPowerUp(x, y, chance = 0.3) {
    if (Math.random() < chance) {
      const types = ['pillRed', 'powerupRed', 'shield'];
      const chosenType = Phaser.Utils.Array.GetRandom(types);
      const item = this.group.get(x, y, chosenType);
      if (item) {
        item.spawn(x, y, chosenType);
      }
    }
  }
}
