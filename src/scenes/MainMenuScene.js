// Main Menu Scene — Clean, polished retro-space UI
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const cx = GAME_CONFIG.width / 2;
    const cy = GAME_CONFIG.height / 2;
    const W = GAME_CONFIG.width;
    const H = GAME_CONFIG.height;

    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, W, H, 'background').setOrigin(0, 0);

    // Hero ship floating animation
    const heroShip = this.add.image(cx, cy - 150, 'player').setScale(1.4);
    this.tweens.add({
      targets: heroShip,
      y: cy - 162,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Game Title
    const title = this.add.text(cx, cy - 80, 'SPACE INVADERS', {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '40px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5);
    title.setStroke('#003344', 6);

    // Subtitle tagline
    this.add.text(cx, cy - 38, 'DEFEND THE GALAXY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffcc00',
      align: 'center',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Buttons
    this.makeButton(cx, cy + 30, 'PLAY GAME', 0x00aa55, 0x00cc66, () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
        this.scene.start('UIScene');
      });
    });

    this.makeButton(cx, cy + 95, 'SETTINGS', 0x223366, 0x334488, () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SettingsScene');
      });
    });

    // High score display
    const hiScore = localStorage.getItem('spaceInvadersHighScore') || 0;
    if (hiScore > 0) {
      this.add.text(cx, cy + 155, `HIGH SCORE: ${String(hiScore).padStart(6, '0')}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#8899aa'
      }).setOrigin(0.5);
    }

    // Controls footer
    this.add.text(cx, H - 20, 'WASD / Arrow Keys to Move  •  Space to Shoot', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#556677'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  makeButton(x, y, label, colorNormal, colorHover, onClick) {
    const btnWidth = 240;
    const btnHeight = 48;

    const bg = this.add.rectangle(x, y, btnWidth, btnHeight, colorNormal).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(2, 0xffffff, 0.8);

    const txt = this.add.text(x, y, label, {
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setFillStyle(colorHover);
      txt.setScale(1.04);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(colorNormal);
      txt.setScale(1.0);
    });

    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: [bg, txt],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 70,
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
