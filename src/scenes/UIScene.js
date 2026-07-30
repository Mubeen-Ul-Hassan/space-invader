// UIScene managing HUD displays, numeric lives, wave banners, and CTA popups
class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.score = 0;
    this.lives = GAME_CONFIG.initialLives;

    // Create score display text
    this.scoreText = this.add.text(20, 15, 'SCORE: 0000', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#00ffcc'
    });

    // Create title banner text
    this.titleText = this.add.text(GAME_CONFIG.width / 2, 20, 'SPACE INVADERS', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#ffcc00'
    }).setOrigin(0.5, 0);

    // Render numeric HUD health display: [ShipIcon] [numeralX] [numeralCount]
    this.lifeShipIcon = this.add.image(GAME_CONFIG.width - 90, 25, 'life').setScale(0.9);
    this.numeralXIcon = this.add.image(GAME_CONFIG.width - 60, 25, 'numeralX').setScale(0.8);
    const initialDigitKey = 'numeral' + Math.min(9, Math.max(0, this.lives));
    this.numeralDigitIcon = this.add.image(GAME_CONFIG.width - 30, 25, initialDigitKey).setScale(0.8);

    // Interactive Settings HUD Button
    const settingsBtn = this.add.rectangle(170, 25, 32, 32, 0x334466).setInteractive({ useHandCursor: true });
    settingsBtn.setStrokeStyle(1, 0x00ffcc);
    this.add.text(170, 25, '⚙', { fontSize: '18px', color: '#00ffcc' }).setOrigin(0.5);

    settingsBtn.on('pointerdown', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      this.scene.pause('GameScene');
      this.scene.start('SettingsScene');
    });

    // Central Wave Banner Text
    this.waveBannerText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 40, '', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '36px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    // Create control instructions hint banner at bottom of screen
    this.controlsHint = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height - 25, 'Drag or Arrow Keys to Move • Space / Auto-Fire to Shoot', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#8888aa',
      align: 'center'
    }).setOrigin(0.5);

    // Listen for events emitted from GameScene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('scoreChanged', this.updateScore, this);
    gameScene.events.on('livesChanged', this.updateLives, this);
    gameScene.events.on('gameOver', this.showGameOverModal, this);
    gameScene.events.on('gameWin', this.showWinModal, this);
    gameScene.events.on('waveStarted', this.showWaveStartedBanner, this);
    gameScene.events.on('waveCleared', this.showWaveClearedBanner, this);
  }

  // Display wave start notification banner
  showWaveStartedBanner(waveNum) {
    this.waveBannerText.setText(`WAVE ${waveNum}`).setColor('#00ffcc').setAlpha(1);
    this.tweens.add({
      targets: this.waveBannerText,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.2 },
      duration: 1600,
      ease: 'Power2'
    });
  }

  // Display wave cleared notification banner
  showWaveClearedBanner(waveNum) {
    this.waveBannerText.setText(`WAVE ${waveNum} CLEARED!`).setColor('#ffcc00').setAlpha(1);
    this.tweens.add({
      targets: this.waveBannerText,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.2 },
      duration: 1600,
      ease: 'Power2'
    });
  }

  // Update score HUD text formatted with leading zeros
  updateScore(newScore) {
    this.score = newScore;
    const formatted = String(newScore).padStart(4, '0');
    this.scoreText.setText(`SCORE: ${formatted}`);
  }

  // Update numeric lives display HUD (ShipIcon * count) using numeric PNG assets
  updateLives(newLives) {
    this.lives = Math.max(0, newLives);
    const digitKey = 'numeral' + Math.min(9, Math.max(0, this.lives));
    if (this.numeralDigitIcon) {
      this.numeralDigitIcon.setTexture(digitKey);
    }
  }

  // Show Game Over dialog modal
  showGameOverModal() {
    this.showModal('MISSION FAILED', '#ff4444', false);
  }

  // Show Game Win dialog modal
  showWinModal() {
    this.showModal('VICTORY ACHIEVED!', '#00ffcc', true);
  }

  // Modal dialog popup container
  showModal(title, titleColor, isWin) {
    const modalBg = this.add.rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.75);

    const card = this.add.rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, 440, 270, 0x111122, 0.95);
    card.setStrokeStyle(3, 0x00ffcc);

    this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 75, title, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '28px',
      color: titleColor
    }).setOrigin(0.5);

    this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 25, `FINAL SCORE: ${this.score}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (!isWin) {
      const retryBtn = this.add.rectangle(GAME_CONFIG.width / 2 - 105, GAME_CONFIG.height / 2 + 45, 180, 48, 0x3344cc).setInteractive({ useHandCursor: true });
      retryBtn.setStrokeStyle(2, 0xffffff);

      this.add.text(GAME_CONFIG.width / 2 - 105, GAME_CONFIG.height / 2 + 45, 'TRY AGAIN', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5);

      retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x5566ff));
      retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x3344cc));
      retryBtn.on('pointerdown', () => this.restartGame());

      const ctaBtn = this.add.rectangle(GAME_CONFIG.width / 2 + 105, GAME_CONFIG.height / 2 + 45, 180, 48, 0x00cc66).setInteractive({ useHandCursor: true });
      ctaBtn.setStrokeStyle(2, 0xffffff);

      this.add.text(GAME_CONFIG.width / 2 + 105, GAME_CONFIG.height / 2 + 45, 'PLAY AGAIN', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5);

      ctaBtn.on('pointerover', () => ctaBtn.setFillStyle(0x00ff88));
      ctaBtn.on('pointerout', () => ctaBtn.setFillStyle(0x00cc66));
      ctaBtn.on('pointerdown', () => this.restartGame());
    } else {
      const ctaBtn = this.add.rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 45, 220, 50, 0x00cc66).setInteractive({ useHandCursor: true });
      ctaBtn.setStrokeStyle(2, 0xffffff);

      this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 45, 'PLAY AGAIN', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '22px',
        color: '#ffffff'
      }).setOrigin(0.5);

      ctaBtn.on('pointerover', () => ctaBtn.setFillStyle(0x00ff88));
      ctaBtn.on('pointerout', () => ctaBtn.setFillStyle(0x00cc66));
      ctaBtn.on('pointerdown', () => this.restartGame());
    }
  }

  restartGame() {
    this.scene.get('GameScene').scene.restart();
    this.scene.restart();
  }
}
