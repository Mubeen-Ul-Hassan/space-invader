// Multi-stage Wave Manager with 40-second initial grace period (no enemy ships) and spaced 3-ship wave limits
class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.currentStage = 0;
    this.totalStagesInWave = 0;
    this.isWaveActive = false;
    this.stageEnemiesRemaining = 0;
    this.maxWaves = 5;
    this.gameStartTime = 0;
  }

  // Start next major wave sequence
  startNextWave() {
    if (this.currentWave === 0) {
      this.gameStartTime = this.scene.time.now;
    }

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

    // Check if 40-second grace period has passed
    const elapsedMs = this.scene.time.now - this.gameStartTime;
    const shipsAllowed = (elapsedMs >= 40000);

    // Each wave has 3 sub-wave stages. If ships are allowed, spawn 1 ship per stage (3 total per wave)
    const shouldSpawnShipInThisStage = shipsAllowed;

    switch (this.currentWave) {
      case 1:
        this.totalStagesInWave = 3;
        meteorCount = 3;
        this.spawnMeteorVFormation(meteorCount);
        if (shouldSpawnShipInThisStage) {
          shipCount = 1;
          this.spawnSingleEnemyShip();
        }
        break;

      case 2:
        this.totalStagesInWave = 3;
        meteorCount = 3;
        this.spawnMeteorStaggered(meteorCount);
        if (shouldSpawnShipInThisStage) {
          shipCount = 1;
          this.spawnSingleEnemyShip();
        }
        break;

      case 3:
        this.totalStagesInWave = 3;
        meteorCount = 3;
        this.spawnMeteorVFormation(meteorCount);
        if (shouldSpawnShipInThisStage) {
          shipCount = 1;
          this.spawnSingleEnemyShip();
        }
        break;

      case 4:
        this.totalStagesInWave = 3;
        meteorCount = 4;
        this.spawnMeteorStaggered(meteorCount);
        if (shouldSpawnShipInThisStage) {
          shipCount = 1;
          this.spawnSingleEnemyShip();
        }
        break;

      default: // Wave 5 (Final Wave)
        this.totalStagesInWave = 3;
        meteorCount = 4;
        this.spawnMeteorVFormation(meteorCount);
        if (shouldSpawnShipInThisStage) {
          shipCount = 1;
          this.spawnSingleEnemyShip();
        }
        break;
    }

    this.stageEnemiesRemaining = meteorCount + shipCount;
  }

  // Spawn meteorites in a V-formation
  spawnMeteorVFormation(count) {
    const cx = this.scene.scale.width / 2;
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
    const spacing = this.scene.scale.width / (count + 1);
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

  // Spawn exactly 1 enemy ship at a spaced interval
  spawnSingleEnemyShip() {
    const ship = this.scene.enemyShipGroup.group.get();
    if (ship) {
      ship.resetShip();
      const posX = Phaser.Math.Between(150, this.scene.scale.width - 150);
      const posY = -80;
      ship.setPosition(posX, posY);
      ship.startX = posX;
    }
  }

  // Called when any enemy (meteor or ship) is destroyed
  onEnemyDestroyed() {
    if (!this.isWaveActive) return;
    this.stageEnemiesRemaining = Math.max(0, this.stageEnemiesRemaining - 1);

    if (this.stageEnemiesRemaining <= 0) {
      if (this.currentStage < this.totalStagesInWave) {
        // Advance to next sub-wave formation stage after 1.2s delay
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
