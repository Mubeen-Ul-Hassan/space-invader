// Falling meteorite obstacle sprite
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, points) {
    const key = (typeof textureKey === 'string' && textureKey) ? textureKey : 'stone';
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.points = points || 20;
    this.resetMeteor();
  }

  // Reset meteorite for spawning/recycling
  resetMeteor() {
    const textures = ['stone', 'stoneBig'];
    this.setTexture(Phaser.Utils.Array.GetRandom(textures));
    if (this.body) {
      this.body.setSize(this.width, this.height);
    }

    const x = Phaser.Math.Between(40, this.scene.scale.width - 40);
    const y = Phaser.Math.Between(-80, -40);
    this.setPosition(x, y);
    this.setScale(Phaser.Math.FloatBetween(0.7, 1.2));

    // Gentle 0.8% compounding speed increase per destroyed meteorite, capped at 1.35x
    const destroyedCount = this.scene.enemyGroup ? this.scene.enemyGroup.destroyedCount : 0;
    const speedMultiplier = Math.min(1.35, Math.pow(1.008, destroyedCount));

    this.speedY = Phaser.Math.Between(120, 200) * speedMultiplier;
    this.speedX = Phaser.Math.Between(-25, 25) * speedMultiplier;
    this.rotationSpeed = Phaser.Math.FloatBetween(-0.04, 0.04) * speedMultiplier;

    this.setActive(true);
    this.setVisible(true);
  }

  update(time, delta) {
    if (!this.active) return;

    // CHEAT: freeze slows all enemies to 20% speed
    const freezeMult = (ACTIVE_CHEATS && ACTIVE_CHEATS.freeze) ? 0.20 : 1.0;
    const deltaSec = delta / 1000;

    this.y += this.speedY * deltaSec * freezeMult;
    this.x += this.speedX * deltaSec * freezeMult;
    this.rotation += this.rotationSpeed * freezeMult;

    if (ACTIVE_CHEATS && ACTIVE_CHEATS.freeze) {
      this.setTint(0x88ccff);
    } else {
      this.clearTint();
    }

    if (this.y > this.scene.scale.height + 60) {
      this.resetMeteor();
    }
  }
}

// Manages meteorite spawning and pooling
class EnemyGroup {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.nextSpawnTime = 0;
    this.spawnInterval = 1800;
    this.destroyedCount = 0;
    this.targetCount = 25;

    this.initialSpawn();
  }

  // Spawn initial meteorites staggered above the screen
  initialSpawn() {
    for (let i = 0; i < 2; i++) {
      const meteor = this.group.get();
      if (meteor) {
        meteor.resetMeteor();
        meteor.y -= i * 120;
      }
    }
  }

  // Slow ambient spawning, respecting the max on-screen cap
  update(time, delta) {
    if (time > this.nextSpawnTime) {
      const cap = this.scene.waveManager ? this.scene.waveManager.MAX_METEORS : 10;
      const activeCount = this.group.getChildren().filter(m => m.active).length;
      if (activeCount < cap) {
        const meteor = this.group.get();
        if (meteor) {
          meteor.resetMeteor();
        }
      }
      this.nextSpawnTime = time + Phaser.Math.Between(2800, 4500);
    }
  }
}
