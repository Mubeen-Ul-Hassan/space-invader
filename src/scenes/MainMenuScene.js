// Main Menu Scene with redesigned clean UI and option navigation
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const cx = GAME_CONFIG.width / 2;
    const cy = GAME_CONFIG.height / 2;

    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'background').setOrigin(0, 0);

    // Decorative floating ship icon
    const heroShip = this.add.image(cx, cy - 140, 'player').setScale(1.2);
    this.tweens.add({
      targets: heroShip,
      y: cy - 150,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Game Main Title
    const titleText = this.add.text(cx, cy - 75, 'SPACE INVADERS', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '38px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5);
    titleText.setStroke('#003344', 6);
    titleText.setShadow(0, 0, '#00ffcc', 16, true, true);

    // Subtitle tagline
    this.add.text(cx, cy - 35, 'DEFEND THE GALAXY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffcc00',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Button 1: PLAY GAME
    this.createButton(cx, cy + 30, 'PLAY GAME', 0x00cc66, 0x00ff88, () => {
      this.scene.start('GameScene');
      this.scene.start('UIScene');
    });

    // Button 2: SETTINGS
    this.createButton(cx, cy + 100, 'SETTINGS', 0x3344cc, 0x5566ff, () => {
      this.scene.start('SettingsScene');
    });
  }

  // Helper to construct interactive polished UI buttons
  createButton(x, y, text, normalColor, hoverColor, onClick) {
    const btn = this.add.rectangle(x, y, 240, 48, normalColor, 0.9).setInteractive({ useHandCursor: true });
    btn.setStrokeStyle(2, 0xffffff);

    const btnText = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(hoverColor);
      btnText.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(normalColor);
      btnText.setScale(1.0);
    });
    btn.on('pointerdown', () => {
      this.tweens.add({
        targets: [btn, btnText],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: onClick
      });
    });
  }

  update() {
    if (this.bg) {
      this.bg.tilePositionY -= 1.0;
    }
  }
}
