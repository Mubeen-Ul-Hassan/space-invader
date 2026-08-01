// UIScene managing HUD displays, wave banners, and simple game-over / win dialogs
class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.score = 0;
    this.lives = GAME_CONFIG.initialLives;
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;

    // ── Score display: 6 numeral image sprites (e.g. "000100") ──────
    // Each digit is a numeral0–numeral9 asset image, spaced side by side
    const DIGIT_COUNT = 6;
    const DIGIT_SCALE = 0.75;   // scale each numeral sprite
    const DIGIT_GAP   = 19;     // horizontal gap between digit centres
    const DIGIT_X_START = 18;   // left edge X for the first digit
    const DIGIT_Y     = 20;     // Y centre for all digits

    this.scoreDigits = [];
    for (let i = 0; i < DIGIT_COUNT; i++) {
      const img = this.add.image(
        DIGIT_X_START + i * DIGIT_GAP,
        DIGIT_Y,
        'numeral0'
      ).setScale(DIGIT_SCALE).setOrigin(0, 0.5);
      this.scoreDigits.push(img);
    }

    // Render initial score 000000
    this._renderScoreDigits(0);

    // ── Lives display (top-right): ship icon × count digit ──────────
    this.lifeShipIcon    = this.add.image(W - 90, 22, 'life').setScale(0.85);
    this.numeralXIcon    = this.add.image(W - 65, 22, 'numeralX').setScale(DIGIT_SCALE);
    const initialDigitKey = 'numeral' + Math.min(9, Math.max(0, this.lives));
    this.numeralDigitIcon = this.add.image(W - 40, 22, initialDigitKey).setScale(DIGIT_SCALE);

    // ── Wave Notification Banner (screen centre) ─────────────────────
    this.waveBannerText = this.add.text(cx, H / 2 - 40, '', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", sans-serif',
      fontSize: '36px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    // ── Controls hint footer ─────────────────────────────────────────
    const isMobile = this.sys.game.device.input.touch;
    const controlsLabel = isMobile
      ? 'Touch & Drag to Move  •  Tap to Shoot'
      : 'WASD / Arrow Keys to Move  •  Space to Shoot';
    this.add.text(cx, H - 20, controlsLabel, {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '13px',
      color: '#8888aa',
      align: 'center'
    }).setOrigin(0.5);

    // ── Listen for events from GameScene ─────────────────────────────
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('scoreChanged', this.updateScore, this);
    gameScene.events.on('livesChanged', this.updateLives, this);
    gameScene.events.on('gameOver',     this.showGameOverModal, this);
    gameScene.events.on('gameWin',      this.showWinModal, this);
    gameScene.events.on('waveStarted',  this.showWaveStartedBanner, this);
    gameScene.events.on('waveCleared',  this.showWaveClearedBanner, this);
  }

  // Render current score as 6 individual numeral image sprites
  _renderScoreDigits(score) {
    const str = String(score).padStart(6, '0').slice(-6); // always 6 chars
    for (let i = 0; i < this.scoreDigits.length; i++) {
      this.scoreDigits[i].setTexture('numeral' + str[i]);
    }
  }

  showWaveStartedBanner(waveNum) {
    this.waveBannerText.setText(`WAVE ${waveNum}`).setColor('#00ffcc').setAlpha(1);
    this.tweens.add({
      targets: this.waveBannerText,
      alpha: { from: 1, to: 0 },
      duration: 1500,
      ease: 'Power2'
    });
  }

  showWaveClearedBanner(waveNum) {
    this.waveBannerText.setText(`WAVE ${waveNum} CLEARED!`).setColor('#ffcc00').setAlpha(1);
    this.tweens.add({
      targets: this.waveBannerText,
      alpha: { from: 1, to: 0 },
      duration: 1500,
      ease: 'Power2'
    });
  }

  updateScore(newScore) {
    this.score = newScore;
    this._renderScoreDigits(newScore);
  }

  updateLives(newLives) {
    this.lives = Math.max(0, newLives);
    const digitKey = 'numeral' + Math.min(9, Math.max(0, this.lives));
    if (this.numeralDigitIcon) {
      this.numeralDigitIcon.setTexture(digitKey);
    }
  }

  showGameOverModal() {
    this.showModal('GAME OVER', '#ff4444', false);
  }

  showWinModal() {
    this.showModal('VICTORY!', '#00ffcc', true);
  }

  // Simple, clean game-over and victory dialog modal
  showModal(title, titleColor, isWin) {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Dark semi-transparent background overlay
    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.75);

    // Simple Dialog Card
    const card = this.add.rectangle(cx, cy, 400, 240, 0x11162b, 0.95);
    card.setStrokeStyle(2, titleColor === '#ff4444' ? 0xff4444 : 0x00ffcc);

    // Modal Title
    this.add.text(cx, cy - 70, title, {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '32px',
      color: titleColor
    }).setOrigin(0.5);

    // Final Score
    this.add.text(cx, cy - 15, `FINAL SCORE: ${this.score}`, {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Save High Score
    const hiScore = parseInt(localStorage.getItem('spaceInvadersHighScore') || '0');
    if (this.score > hiScore) {
      localStorage.setItem('spaceInvadersHighScore', this.score);
      this.add.text(cx, cy + 18, 'NEW HIGH SCORE!', {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '14px',
        color: '#ffcc00'
      }).setOrigin(0.5);
    }

    // ── Game-over buttons (pill style matching main menu) ──────────────────
    const btnW = 152, btnH = 44, btnGap = 10;
    const leftBtnX  = cx - btnW / 2 - btnGap / 2;
    const rightBtnX = cx + btnW / 2 + btnGap / 2;
    const btnY = cy + 65;

    const makePillBtn = (x, y, w, h, label, iconKey, fillNormal, fillHover, cb) => {
      const r = 12;
      const bg = this.add.graphics();
      const draw = (col) => {
        bg.clear();
        bg.fillStyle(col, 0.95);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
        bg.lineStyle(2, 0xffffff, col === fillHover ? 1.0 : 0.85);
        bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        bg.lineStyle(1, 0xffffff, col === fillHover ? 0.4 : 0.18);
        bg.lineBetween(x - w / 2 + r, y - h / 2 + 3, x + w / 2 - r, y - h / 2 + 3);
      };
      draw(fillNormal);

      let iconObj = null;
      if (iconKey && this.textures.exists(iconKey)) {
        iconObj = this.add.image(x - w / 2 + 24, y, iconKey)
          .setDisplaySize(22, 22).setTint(0xffffff);
      }
      this.add.text(x + (iconObj ? 10 : 0), y, label, {
        fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
        fontSize: '14px', color: '#ffffff'
      }).setOrigin(iconObj ? 0.4 : 0.5, 0.5);

      bg.setInteractive(new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h), Phaser.Geom.Rectangle.Contains);
      bg.input.cursor = 'pointer';
      bg.on('pointerover', () => { draw(fillHover); if (iconObj) iconObj.setScale(1.08); });
      bg.on('pointerout',  () => { draw(fillNormal); if (iconObj) iconObj.setScale(1); });
      bg.on('pointerdown', () => { draw(fillHover); });
      bg.on('pointerup',   () => cb());
    };

    // PLAY AGAIN
    makePillBtn(leftBtnX, btnY, btnW, btnH, 'PLAY AGAIN', 'iconReplay', 0x007733, 0x00aa55, () => this.restartGame());

    // MAIN MENU
    makePillBtn(rightBtnX, btnY, btnW, btnH, 'MAIN MENU', 'iconMenu', 0x1a2240, 0x2a3460, () => {
      this.scene.stop('GameScene');
      this.scene.stop('UIScene');
      this.scene.start('MainMenuScene');
    });
  }

  restartGame() {
    this.scene.get('GameScene').scene.restart();
    this.scene.restart();
  }
}
