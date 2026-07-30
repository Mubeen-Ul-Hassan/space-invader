// UIScene managing HUD displays, instructions, and CTA popups
class UIScene extends Phaser.Scene {
  // Construct UIScene with scene key
  constructor() {
    super({ key: 'UIScene' }); // Initialize scene with key identifier
  }

  // Create UI text elements and HUD components
  create() {
    this.score = 0; // Initialize local score tracker
    this.lives = GAME_CONFIG.initialLives; // Initialize local lives tracker

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

    // Render spaceship icon and multiplier text for lives HUD display
    this.lifeShipIcon = this.add.image(GAME_CONFIG.width - 110, 25, 'life').setScale(0.8); // Render spaceship icon
    this.livesText = this.add.text(GAME_CONFIG.width - 90, 15, `* ${GAME_CONFIG.initialLives}`, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }); // Render spaceship multiplier count text (e.g. spaceship * 3)

    // Render individual graphical life icon sprites
    this.lifeIcons = []; // Array storing life ship icons
    for (let i = 0; i < GAME_CONFIG.initialLives; i++) {
      const icon = this.add.image(GAME_CONFIG.width - 45 + i * 18, 25, 'life').setScale(0.6); // Render small life ship icon
      this.lifeIcons.push(icon); // Store icon reference
    }

    // Interactive Settings HUD Button
    const settingsBtn = this.add.rectangle(170, 25, 32, 32, 0x334466).setInteractive({ useHandCursor: true });
    settingsBtn.setStrokeStyle(1, 0x00ffcc);
    this.add.text(170, 25, '⚙', { fontSize: '18px', color: '#00ffcc' }).setOrigin(0.5);

    settingsBtn.on('pointerdown', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      this.scene.pause('GameScene');
      this.scene.start('SettingsScene');
    });

    // Create control instructions hint banner at bottom of screen
    this.controlsHint = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height - 25, 'Drag or Arrow Keys to Move • Space / Auto-Fire to Shoot', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#8888aa',
      align: 'center'
    }).setOrigin(0.5);

    // Listen for events emitted from GameScene
    const gameScene = this.scene.get('GameScene'); // Retrieve GameScene instance reference
    gameScene.events.on('scoreChanged', this.updateScore, this); // Update score listener
    gameScene.events.on('livesChanged', this.updateLives, this); // Update lives listener
    gameScene.events.on('gameOver', this.showGameOverModal, this); // Game over modal listener
    gameScene.events.on('gameWin', this.showWinModal, this); // Game win modal listener
  }

  // Update score HUD text formatted with leading zeros
  updateScore(newScore) {
    this.score = newScore; // Set current score value
    const formatted = String(newScore).padStart(4, '0'); // Pad score number string
    this.scoreText.setText(`SCORE: ${formatted}`); // Update text display
  }

  // Update lives display HUD (spaceship * count) when ship destroyed
  updateLives(newLives) {
    this.lives = Math.max(0, newLives); // Set remaining lives count
    this.livesText.setText(`* ${this.lives}`); // Update spaceship count text (spaceship * count)
    for (let i = 0; i < this.lifeIcons.length; i++) {
      this.lifeIcons[i].setVisible(i < this.lives); // Show or hide life ship icons based on remaining count
    }
  }

  // Show Game Over dialog modal with TRY AGAIN and PLAY NOW buttons
  showGameOverModal() {
    this.showModal('MISSION FAILED', '#ff4444', false); // Render failure modal window
  }

  // Show Game Win dialog modal with PLAY NOW button
  showWinModal() {
    this.showModal('VICTORY ACHIEVED!', '#00ffcc', true); // Render victory modal window
  }

  // Modal dialog popup container separating local TRY AGAIN from AppLovin CTA redirect
  showModal(title, titleColor, isWin) {
    const modalBg = this.add.rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.75); // Dark semi-transparent overlay

    // Modal background card frame
    const card = this.add.rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, 440, 270, 0x111122, 0.95); // Dark blue card container
    card.setStrokeStyle(3, 0x00ffcc); // Add neon cyan frame border

    // Title label on modal dialog card
    this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 75, title, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '28px',
      color: titleColor
    }).setOrigin(0.5);

    // Final score summary display text
    this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 25, `FINAL SCORE: ${this.score}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (!isWin) {
      // 1. Interactive "TRY AGAIN" button (restarts game locally without redirecting)
      const retryBtn = this.add.rectangle(GAME_CONFIG.width / 2 - 105, GAME_CONFIG.height / 2 + 45, 180, 48, 0x3344cc).setInteractive({ useHandCursor: true }); // Blue Try Again button
      retryBtn.setStrokeStyle(2, 0xffffff); // White outline border

      this.add.text(GAME_CONFIG.width / 2 - 105, GAME_CONFIG.height / 2 + 45, 'TRY AGAIN', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5);

      retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x5566ff)); // Hover highlight
      retryBtn.on('pointerout', () => retryBtn.setFillStyle(0x3344cc)); // Normal color
      retryBtn.on('pointerdown', () => this.restartGame()); // Restart game locally on click!

      // 2. Interactive "PLAY NOW" CTA button (ad landing page redirect)
      const ctaBtn = this.add.rectangle(GAME_CONFIG.width / 2 + 105, GAME_CONFIG.height / 2 + 45, 180, 48, 0x00cc66).setInteractive({ useHandCursor: true }); // Green CTA button
      ctaBtn.setStrokeStyle(2, 0xffffff); // White outline border

      this.add.text(GAME_CONFIG.width / 2 + 105, GAME_CONFIG.height / 2 + 45, 'PLAY NOW', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5);

      ctaBtn.on('pointerover', () => ctaBtn.setFillStyle(0x00ff88)); // Hover highlight
      ctaBtn.on('pointerout', () => ctaBtn.setFillStyle(0x00cc66)); // Normal color
      ctaBtn.on('pointerdown', () => this.openCtaUrl()); // Open AppLovin CTA redirect
    } else {
      // Single centered "PLAY NOW" CTA button for Victory modal
      const ctaBtn = this.add.rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 45, 220, 50, 0x00cc66).setInteractive({ useHandCursor: true }); // Green CTA button
      ctaBtn.setStrokeStyle(2, 0xffffff); // White outline border

      this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 45, 'PLAY NOW', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '22px',
        color: '#ffffff'
      }).setOrigin(0.5);

      ctaBtn.on('pointerover', () => ctaBtn.setFillStyle(0x00ff88)); // Hover highlight
      ctaBtn.on('pointerout', () => ctaBtn.setFillStyle(0x00cc66)); // Normal color
      ctaBtn.on('pointerdown', () => this.openCtaUrl()); // Open AppLovin CTA redirect
    }
  }

  // Restart game scenes locally for Try Again replay
  restartGame() {
    this.scene.get('GameScene').scene.restart(); // Restart GameScene
    this.scene.restart(); // Restart UIScene
  }

  // Execute AppLovin CTA redirect action
  openCtaUrl() {
    if (window.mraid && typeof window.mraid.open === 'function') {
      window.mraid.open(GAME_CONFIG.ctaUrl); // Trigger AppLovin MRAID ad click event
    } else {
      window.open(GAME_CONFIG.ctaUrl, '_blank'); // Open CTA landing page in browser window
    }
  }
}
