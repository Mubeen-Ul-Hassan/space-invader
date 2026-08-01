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

    // Clean up event listeners on shutdown to avoid calling stale/destroyed references
    this.events.once('shutdown', () => {
      if (gameScene && gameScene.events) {
        gameScene.events.off('scoreChanged', this.updateScore, this);
        gameScene.events.off('livesChanged', this.updateLives, this);
        gameScene.events.off('gameOver',     this.showGameOverModal, this);
        gameScene.events.off('gameWin',      this.showWinModal, this);
        gameScene.events.off('waveStarted',  this.showWaveStartedBanner, this);
        gameScene.events.off('waveCleared',  this.showWaveClearedBanner, this);
      }
    });
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

  // Premium Sci-Fi Game-Over and Victory Modal matching the main design system
  showModal(title, titleColor, isWin) {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    // Dark semi-transparent overlay
    this.add.rectangle(cx, cy, W, H, 0x000000, 0.85).setInteractive();

    // ── Pill-Rounded Card (matching Settings & Main Menu modals) ───────────
    const cardW = Math.min(W * 0.90, 380);
    const cardH = 320; // Increased height to fit icon cleanly
    const radius = 18;

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x0d1226, 0.97);
    cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, radius);
    // Glass top bevel highlight
    cardBg.lineStyle(1.5, 0xffffff, 0.2);
    cardBg.lineBetween(cx - cardW / 2 + radius, cy - cardH / 2 + 4, cx + cardW / 2 - radius, cy - cardH / 2 + 4);
    // Outer white border
    cardBg.lineStyle(2, 0xffffff, 0.85);
    cardBg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, radius);

    // ── Icon Header (like Main Menu) ───────────────────────────────────────
    let titleY = cy - cardH / 2 + 32;
    if (!isWin && this.textures.exists('iconGameOver')) {
      const gameOverIcon = this.add.image(cx, cy - cardH / 2 + 42, 'iconGameOver')
        .setDisplaySize(54, 54)
        .setTint(0xff3344);
      titleY = cy - cardH / 2 + 92;
    }

    // Title Header text with high-resolution crisp rendering
    this.add.text(cx, titleY, title, {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '26px',
      color: titleColor
    }).setOrigin(0.5).setResolution(2);

    // Header Divider Y depends on whether we had the icon
    const divY = titleY + 24;
    const divG = this.add.graphics();
    divG.lineStyle(1, 0xffffff, 0.2);
    divG.lineBetween(cx - cardW / 2 + 16, divY, cx + cardW / 2 - 16, divY);

    // ── High Score Logic & Display ──────────────────────────────────────────
    const currentHiScore = parseInt(localStorage.getItem('spaceInvadersHighScore') || '0');
    const isNewHigh = this.score > currentHiScore;
    if (isNewHigh) {
      localStorage.setItem('spaceInvadersHighScore', this.score);
    }
    const displayHiScore = Math.max(this.score, currentHiScore);

    // Score layout elements Y positions
    const scoreLabelY = divY + 22;
    const scoreValY = scoreLabelY + 22;
    const badgeY = scoreValY + 38; // Increased vertical spacing by 12px

    // Score Label
    this.add.text(cx, scoreLabelY, 'FINAL SCORE', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '13px',
      color: '#88aacc'
    }).setOrigin(0.5).setResolution(2);

    // Score Digits Value
    this.add.text(cx, scoreValY, String(this.score).padStart(6, '0'), {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setResolution(2);

    // High Score Badge or Best Score Info
    if (isNewHigh && this.score > 0) {
      // Gold pill badge
      const badgeW = 200, badgeH = 26; // Increased size to fit larger text
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(0xaa7700, 0.9);
      badgeBg.fillRoundedRect(cx - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);
      badgeBg.lineStyle(1, 0xffcc00, 0.8);
      badgeBg.strokeRoundedRect(cx - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 6);

      this.add.text(cx, badgeY, '★ NEW HIGH SCORE! ★', {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '13px', // Increased from 11px
        color: '#ffffff'
      }).setOrigin(0.5).setResolution(2);
    } else {
      this.add.text(cx, badgeY, `BEST SCORE: ${String(displayHiScore).padStart(6, '0')}`, {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '16px', // Increased from 12px
        color: '#ffcc00'
      }).setOrigin(0.5).setResolution(2);
    }

    // ── Pill Buttons Row ──────────────────────────────────────────────────
    const btnW = Math.min(cardW / 2 - 20, 156);
    const btnH = 44;
    const btnY = cy + cardH / 2 - 32;
    const halfGap = cardW / 4 - 2;

    const makePillBtn = (x, y, w, h, label, iconKey, fillNormal, fillHover, cb) => {
      const r = 12;
      const bg = this.add.graphics();
      const draw = (col) => {
        bg.clear();
        bg.fillStyle(col, 0.95);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
        bg.lineStyle(2, 0xffffff, col === fillHover ? 1.0 : 0.85);
        bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        // Bevel highlight
        bg.lineStyle(1, 0xffffff, col === fillHover ? 0.4 : 0.18);
        bg.lineBetween(x - w / 2 + r, y - h / 2 + 3, x + w / 2 - r, y - h / 2 + 3);
      };
      draw(fillNormal);

      let iconObj = null;
      if (iconKey && this.textures.exists(iconKey)) {
        iconObj = this.add.image(x - w / 2 + 22, y, iconKey)
          .setDisplaySize(22, 22).setTint(0xffffff);
      }
      this.add.text(x + (iconObj ? 10 : 0), y, label, {
        fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
        fontSize: '13px',
        color: '#ffffff'
      }).setOrigin(iconObj ? 0.4 : 0.5, 0.5).setResolution(2);

      bg.setInteractive(new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h), Phaser.Geom.Rectangle.Contains);
      bg.input.cursor = 'pointer';
      bg.on('pointerover', () => { draw(fillHover); if (iconObj) iconObj.setScale(1.08); });
      bg.on('pointerout',  () => { draw(fillNormal); if (iconObj) iconObj.setScale(1); });
      bg.on('pointerdown', () => { draw(fillHover); });
      bg.on('pointerup',   () => cb());
    };

    // 1. PLAY AGAIN BUTTON
    makePillBtn(cx - halfGap, btnY, btnW, btnH, 'RETRY', 'iconReplay', 0x007733, 0x00aa55, () => this.restartGame());

    // 2. MAIN MENU BUTTON
    makePillBtn(cx + halfGap, btnY, btnW, btnH, 'MENU', 'iconMenu', 0x1a2240, 0x2a3460, () => {
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
