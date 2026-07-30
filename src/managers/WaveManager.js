// Multi-stage Wave Manager for progressive Chicken Invaders style gameplay
class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.currentStage = 0;
    this.totalStagesInWave = 0;
    this.isWaveActive = false;
    this.stageEnemiesRemaining = 0;
    this.maxWaves = 5;
  }

  // Start next major wave sequence
  startNextWave() {
    this.currentWave += 1;
    this.currentStage = 0;
    this.isWaveActive = true;

    if (this.scene.events) {
      this.scene.events.emit('waveStarted', this.currentWave);
    }

    this.scene.time.delayedCall(1500, () => {
      this.startNextStage();
    });
  }

  // Start next sub-wave formation stage within current major wave
  startNextStage() {
    if (!this.isWaveActive && this.currentStage > 0) return;
    this.currentStage += 1;

    let meteorCount = 0;
    let shipCount = 0;

    switch (this.currentWave) {
      case 1:
        this.totalStagesInWave = 2;
        if (this.currentStage === 1) {
          meteorCount = 4;
          this.spawnMeteorVFormation(meteorCount);
        } else {
          meteorCount = 3;
          this.spawnMeteorStaggered(meteorCount);
        }
        break;

      case 2:
        this.totalStagesInWave = 2;
        if (this.currentStage === 1) {
          shipCount = 2;
          this.spawnShipLineFormation(shipCount);
        } else {
          shipCount = 3;
          this.spawnShipWedgeFormation(shipCount);
        }
        break;

      case 3:
        this.totalStagesInWave = 3;
        if (this.currentStage === 1) {
          meteorCount = 3;
          this.spawnMeteorVFormation(meteorCount);
        } else if (this.currentStage === 2) {
          meteorCount = 2;
          shipCount = 2;
          this.spawnMeteorVFormation(meteorCount);
          this.spawnShipLineFormation(shipCount);
        } else {
          shipCount = 3;
          this.spawnShipWedgeFormation(shipCount);
        }
        break;

      case 4:
        this.totalStagesInWave = 3;
        if (this.currentStage === 1) {
          meteorCount = 4;
          this.spawnMeteorStaggered(meteorCount);
        } else if (this.currentStage === 2) {
          shipCount = 3;
          this.spawnShipLineFormation(shipCount);
        } else {
          meteorCount = 2;
          shipCount = 2;
          this.spawnMeteorVFormation(meteorCount);
          this.spawnShipWedgeFormation(shipCount);
        }
        break;

      default: // Wave 5 (Final Boss Wave)
        this.totalStagesInWave = 3;
        if (this.currentStage === 1) {
          meteorCount = 4;
          this.spawnMeteorVFormation(meteorCount);
        } else if (this.currentStage === 2) {
          shipCount = 3;
          this.spawnShipWedgeFormation(shipCount);
        } else {
          meteorCount = 2;
          shipCount = 3;
          this.spawnMeteorStaggered(meteorCount);
          this.spawnShipLineFormation(shipCount);
        }
        break;
    }

    this.stageEnemiesRemaining = meteorCount + shipCount;
  }

  // Spawn meteorites in a V-formation
  spawnMeteorVFormation(count) {
    const cx = GAME_CONFIG.width / 2;
    const spacing = 120;
    for (let i = 0; i < count; i++) {
      const meteor = this.scene.enemyGroup.group.get();
      if (meteor) {
        meteor.resetMeteor();
        const offsetX = (i - (count - 1) / 2) * spacing;
        const offsetY = -40 - Math.abs(i - (count - 1) / 2) * 50;
        meteor.setPosition(cx + offsetX, offsetY);
      }
    }
  }

  // Spawn meteorites in staggered side-by-side rows
  spawnMeteorStaggered(count) {
    const spacing = GAME_CONFIG.width / (count + 1);
    for (let i = 0; i < count; i++) {
      const meteor = this.scene.enemyGroup.group.get();
      if (meteor) {
        meteor.resetMeteor();
        const posX = spacing * (i + 1);
        const posY = -50 - (i % 2) * 60;
        meteor.setPosition(posX, posY);
      }
    }
  }

  // Spawn enemy ships in a horizontal line
  spawnShipLineFormation(count) {
    const spacing = GAME_CONFIG.width / (count + 1);
    for (let i = 0; i < count; i++) {
      const ship = this.scene.enemyShipGroup.group.get();
      if (ship) {
        ship.resetShip();
        const posX = spacing * (i + 1);
        const posY = -80 - i * 25;
        ship.setPosition(posX, posY);
        ship.startX = posX;
      }
    }
  }

  // Spawn enemy ships in a wedge formation
  spawnShipWedgeFormation(count) {
    const cx = GAME_CONFIG.width / 2;
    const spacing = 110;
    for (let i = 0; i < count; i++) {
      const ship = this.scene.enemyShipGroup.group.get();
      if (ship) {
        ship.resetShip();
        const offsetX = (i - (count - 1) / 2) * spacing;
        const offsetY = -80 - Math.abs(i - (count - 1) / 2) * 45;
        ship.setPosition(cx + offsetX, offsetY);
        ship.startX = cx + offsetX;
      }
    }
  }

  // Called when any enemy (meteor or ship) is destroyed
  onEnemyDestroyed() {
    if (!this.isWaveActive) return;
    this.stageEnemiesRemaining = Math.max(0, this.stageEnemiesRemaining - 1);

    if (this.stageEnemiesRemaining <= 0) {
      if (this.currentStage < this.totalStagesInWave) {
        // Advance to next sub-wave formation after 1.2s delay
        this.scene.time.delayedCall(1200, () => {
          this.startNextStage();
        });
      } else {
        // Complete current major wave
        this.isWaveActive = false;
        if (this.scene.events) {
          this.scene.events.emit('waveCleared', this.currentWave);
        }

        if (this.currentWave >= this.maxWaves) {
          this.scene.time.delayedCall(1500, () => {
            this.scene.triggerWin();
          });
        } else {
          // Pause 2.8s before launching next major wave
          this.scene.time.delayedCall(2800, () => {
            this.startNextWave();
          });
        }
      }
    }
  }
}
