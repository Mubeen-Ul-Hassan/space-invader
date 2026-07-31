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

    // Hard caps — enemies are never allowed above these counts on-screen at once
    this.MAX_METEORS = 10;
    this.MAX_SHIPS   = 5;
  }

  // ── Cap helpers ────────────────────────────────────────────────────

  // Count currently active (visible) meteors on screen
  activeMeteorCount() {
    let n = 0;
    this.scene.enemyGroup.group.getChildren().forEach(m => { if (m.active) n++; });
    return n;
  }

  // Count currently active (visible) ships on screen
  activeShipCount() {
    let n = 0;
    this.scene.enemyShipGroup.group.getChildren().forEach(s => { if (s.active) n++; });
    return n;
  }

  // ── Wave control ──────────────────────────────────────────────────

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
     * Wave design — each wave has more stages and denser formations.
     *   Meteor = 20 pts  |  Ship = 50 pts
     *   W1 (6 stages): 4 meteors + 0-1 ship  ≈  500 pts
     *   W2 (7 stages): 5 meteors + 1-2 ships ≈ 1500 pts cumulative
     *   W3 (8 stages): 6 meteors + 2-3 ships ≈ 3000 pts cumulative
     *   W4 (9 stages): 7 meteors + 2-3 ships ≈ 5000 pts cumulative
     *   W5 (10 stages): 8 meteors + 3-4 ships ≈ 7500+ pts cumulative
     *
     * All formation helpers stagger spawns (one enemy every 400 ms) and
     * respect the active-count caps so the screen never overcrowds.
     */
    switch (this.currentWave) {
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

      default: // Wave 5 (Final)
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

  // ── Formation helpers (all use time-staggered spawning + cap checks) ──

  // Spawn meteorites in a V-formation, one every 400 ms
  spawnMeteorVFormation(count) {
    const cx = this.scene.scale.width / 2;
    const spacing = 110;
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 400, () => {
        if (this.activeMeteorCount() >= this.MAX_METEORS) return; // cap guard
        const meteor = this.scene.enemyGroup.group.get();
        if (meteor) {
          meteor.resetMeteor();
          const offsetX = (i - (count - 1) / 2) * spacing;
          const offsetY = -40 - Math.abs(i - (count - 1) / 2) * 45;
          meteor.setPosition(cx + offsetX, offsetY);
        }
      });
    }
  }

  // Spawn meteorites in staggered side-by-side rows, one every 400 ms
  spawnMeteorStaggered(count) {
    const spacing = this.scene.scale.width / (count + 1);
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 400, () => {
        if (this.activeMeteorCount() >= this.MAX_METEORS) return; // cap guard
        const meteor = this.scene.enemyGroup.group.get();
        if (meteor) {
          meteor.resetMeteor();
          const posX = spacing * (i + 1);
          const posY = -50 - (i % 2) * 55;
          meteor.setPosition(posX, posY);
        }
      });
    }
  }

  // Spread meteors evenly across the full screen width, one every 400 ms
  spawnMeteorSpread(count) {
    const margin = 50;
    const usableWidth = this.scene.scale.width - margin * 2;
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 400, () => {
        if (this.activeMeteorCount() >= this.MAX_METEORS) return; // cap guard
        const meteor = this.scene.enemyGroup.group.get();
        if (meteor) {
          meteor.resetMeteor();
          const posX = margin + (usableWidth / (count - 1 || 1)) * i;
          const posY = -60 - (i % 3) * 40;
          meteor.setPosition(posX, posY);
        }
      });
    }
  }

  // Spawn N enemy ships spaced horizontally, one every 600 ms
  spawnEnemyShips(count) {
    const margin = 100;
    const usableWidth = this.scene.scale.width - margin * 2;
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 600, () => {
        if (this.activeShipCount() >= this.MAX_SHIPS) return; // cap guard
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
      });
    }
  }

  // ── Enemy destroyed callback ──────────────────────────────────────

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
