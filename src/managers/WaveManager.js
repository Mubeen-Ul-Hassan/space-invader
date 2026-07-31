// Multi-stage Wave Manager — score-gated waves for extended gameplay
// Wave clear thresholds: W1≈500  W2≈1500  W3≈3000  W4≈5000  W5≈7500+
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

    // Ships are allowed after a 30-second grace period at game start
    const elapsedMs = this.scene.time.now - this.gameStartTime;
    const shipsAllowed = (elapsedMs >= 30000);

    /*
     * Wave design — each wave has more stages and denser enemy formations
     * so the score accumulates more slowly and gameplay lasts longer.
     *
     * Meteor  = 20 pts each
     * Ship    = 50 pts each
     *
     * Wave 1 (6 stages): 4 meteors + 0-1 ship per stage  ≈ 500 pts to clear
     * Wave 2 (7 stages): 5 meteors + 1-2 ships per stage ≈ 1500 pts cumulative
     * Wave 3 (8 stages): 6 meteors + 2 ships per stage   ≈ 3000 pts cumulative
     * Wave 4 (9 stages): 7 meteors + 2-3 ships per stage ≈ 5000 pts cumulative
     * Wave 5 (10 stages): 8 meteors + 3 ships per stage  ≈ 7500+ pts cumulative
     */
    switch (this.currentWave) {
      // ── Wave 1 ── 6 stages, 4 meteors each, 1 ship when unlocked
      case 1:
        this.totalStagesInWave = 6;
        meteorCount = 4;
        if (this.currentStage % 2 === 0) {
          this.spawnMeteorStaggered(meteorCount);
        } else {
          this.spawnMeteorVFormation(meteorCount);
        }
        if (shipsAllowed && this.currentStage >= 3) {
          shipCount = 1;
          this.spawnEnemyShips(1);
        }
        break;

      // ── Wave 2 ── 7 stages, 5 meteors each, 1-2 ships
      case 2:
        this.totalStagesInWave = 7;
        meteorCount = 5;
        if (this.currentStage % 2 === 0) {
          this.spawnMeteorVFormation(meteorCount);
        } else {
          this.spawnMeteorStaggered(meteorCount);
        }
        if (shipsAllowed) {
          shipCount = (this.currentStage >= 4) ? 2 : 1;
          this.spawnEnemyShips(shipCount);
        }
        break;

      // ── Wave 3 ── 8 stages, 6 meteors each, 2 ships
      case 3:
        this.totalStagesInWave = 8;
        meteorCount = 6;
        if (this.currentStage % 3 === 0) {
          this.spawnMeteorSpread(meteorCount);
        } else if (this.currentStage % 2 === 0) {
          this.spawnMeteorVFormation(meteorCount);
        } else {
          this.spawnMeteorStaggered(meteorCount);
        }
        if (shipsAllowed) {
          shipCount = (this.currentStage >= 5) ? 3 : 2;
          this.spawnEnemyShips(shipCount);
        }
        break;

      // ── Wave 4 ── 9 stages, 7 meteors each, 2-3 ships
      case 4:
        this.totalStagesInWave = 9;
        meteorCount = 7;
        if (this.currentStage % 3 === 0) {
          this.spawnMeteorVFormation(meteorCount);
        } else if (this.currentStage % 2 === 0) {
          this.spawnMeteorSpread(meteorCount);
        } else {
          this.spawnMeteorStaggered(meteorCount);
        }
        if (shipsAllowed) {
          shipCount = (this.currentStage >= 6) ? 3 : 2;
          this.spawnEnemyShips(shipCount);
        }
        break;

      // ── Wave 5 (Final) ── 10 stages, 8 meteors each, 3 ships
      default:
        this.totalStagesInWave = 10;
        meteorCount = 8;
        if (this.currentStage % 3 === 0) {
          this.spawnMeteorStaggered(meteorCount);
        } else if (this.currentStage % 2 === 0) {
          this.spawnMeteorSpread(meteorCount);
        } else {
          this.spawnMeteorVFormation(meteorCount);
        }
        if (shipsAllowed) {
          shipCount = (this.currentStage >= 7) ? 4 : 3;
          this.spawnEnemyShips(shipCount);
        }
        break;
    }

    this.stageEnemiesRemaining = meteorCount + shipCount;
  }

  // ── Formation helpers ──────────────────────────────────────────────

  // Spawn meteorites in a V-formation
  spawnMeteorVFormation(count) {
    const cx = this.scene.scale.width / 2;
    const spacing = 110;
    for (let i = 0; i < count; i++) {
      const meteor = this.scene.enemyGroup.group.get();
      if (meteor) {
        meteor.resetMeteor();
        const offsetX = (i - (count - 1) / 2) * spacing;
        const offsetY = -40 - Math.abs(i - (count - 1) / 2) * 45;
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
        const posY = -50 - (i % 2) * 55;
        meteor.setPosition(posX, posY);
      }
    }
  }

  // Spawn meteorites spread wide across screen (new formation for later waves)
  spawnMeteorSpread(count) {
    const margin = 50;
    const usableWidth = this.scene.scale.width - margin * 2;
    for (let i = 0; i < count; i++) {
      const meteor = this.scene.enemyGroup.group.get();
      if (meteor) {
        meteor.resetMeteor();
        const posX = margin + (usableWidth / (count - 1 || 1)) * i;
        const posY = -60 - (i % 3) * 40;
        meteor.setPosition(posX, posY);
      }
    }
  }

  // Spawn N enemy ships spaced horizontally
  spawnEnemyShips(count) {
    const margin = 100;
    const usableWidth = this.scene.scale.width - margin * 2;
    for (let i = 0; i < count; i++) {
      const ship = this.scene.enemyShipGroup.group.get();
      if (ship) {
        ship.resetShip();
        const posX = (count === 1)
          ? Phaser.Math.Between(margin, this.scene.scale.width - margin)
          : margin + (usableWidth / (count - 1)) * i;
        const posY = -80 - i * 60;
        ship.setPosition(posX, posY);
        ship.startX = posX;
      }
    }
  }

  // Called when any enemy (meteor or ship) is destroyed
  onEnemyDestroyed() {
    if (!this.isWaveActive) return;
    this.stageEnemiesRemaining = Math.max(0, this.stageEnemiesRemaining - 1);

    if (this.stageEnemiesRemaining <= 0) {
      if (this.currentStage < this.totalStagesInWave) {
        // Advance to next sub-wave formation stage after a 1.5s breather
        this.scene.time.delayedCall(1500, () => {
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
          // 3-second pause before launching next major wave
          this.scene.time.delayedCall(3000, () => {
            this.startNextWave();
          });
        }
      }
    }
  }
}
