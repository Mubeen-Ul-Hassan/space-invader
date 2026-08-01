// Main Menu Scene — Clean, polished retro-space UI with silent cheat code listener
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    this._audioManager = new AudioManager();

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
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '40px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5);
    title.setStroke('#003344', 6);

    // Subtitle tagline
    this.add.text(cx, cy - 38, 'DEFEND THE GALAXY', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
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
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '14px',
        color: '#8899aa'
      }).setOrigin(0.5);
    }

    // Controls footer
    const isMobile = this.sys.game.device.input.touch;
    const controlsLabel = isMobile
      ? 'Touch & Drag to Move  •  Tap to Shoot'
      : 'WASD / Arrow Keys to Move  •  Space to Shoot';
    this.add.text(cx, H - 20, controlsLabel, {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '12px',
      color: '#556677'
    }).setOrigin(0.5);

    // Cheat status indicator (hidden by default, shows when a cheat is active)
    this._cheatIndicator = this.add.text(cx, H - 38, '', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '11px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    // Silent cheat code keyboard buffer listener
    this._cheatBuffer = '';
    this._cheatCodes = {
      'freeze':     () => this._activateCheat('freeze',    'FREEZE MODE: Enemies slowed!'),
      'enderlein':  () => this._activateCheat('enderlein', 'ENDERLEIN: Max firepower!'),
      'motherlode': () => this._activateCheat('motherlode','MOTHERLODE: Full power!')
    };

    // Listen for any keyboard key down silently
    this.input.keyboard.on('keydown', (event) => {
      const char = event.key.toLowerCase();
      if (char.length === 1 && /[a-z]/.test(char)) {
        this._cheatBuffer += char;
        // Keep buffer to max length of longest cheat code to avoid memory growth
        if (this._cheatBuffer.length > 12) {
          this._cheatBuffer = this._cheatBuffer.slice(-12);
        }
        // Check if buffer ends with any known cheat code
        for (const code in this._cheatCodes) {
          if (this._cheatBuffer.endsWith(code)) {
            this._cheatCodes[code]();
            this._cheatBuffer = '';
            break;
          }
        }
      }
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // Activate a cheat, play confirmation beep, show brief indicator
  _activateCheat(cheatKey, message) {
    // Toggle cheat on/off each time the code is entered
    ACTIVE_CHEATS[cheatKey] = !ACTIVE_CHEATS[cheatKey];
    const isOn = ACTIVE_CHEATS[cheatKey];

    // Play triple ascending beep confirmation
    this._audioManager.playCheatBeep();

    // Show brief status flash
    const statusMsg = isOn ? `✓ ${message}` : `✗ ${message.split(':')[0]}: OFF`;
    this._cheatIndicator.setText(statusMsg).setAlpha(1);

    this.tweens.killTweensOf(this._cheatIndicator);
    this.tweens.add({
      targets: this._cheatIndicator,
      alpha: 0,
      delay: 2500,
      duration: 600,
      ease: 'Power2'
    });
  }

  makeButton(x, y, label, colorNormal, colorHover, onClick) {
    const btnWidth = 240;
    const btnHeight = 48;

    const bg = this.add.rectangle(x, y, btnWidth, btnHeight, colorNormal).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(2, 0xffffff, 0.8);

    const txt = this.add.text(x, y, label, {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
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
