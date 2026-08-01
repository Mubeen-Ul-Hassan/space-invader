// Main Menu Scene — Clean, refined retro-space UI with white-bordered chamfered buttons
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
    this._activeModal = null;

    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, W, H, 'background').setOrigin(0, 0);

    // Hero ship floating animation
    const heroShip = this.add.image(cx, cy - 215, 'player').setScale(1.2);
    this.tweens.add({
      targets: heroShip,
      y: cy - 227,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Existing Game Title Style
    const title = this.add.text(cx, cy - 165, 'SPACE INVADERS', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '40px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5);
    title.setStroke('#003344', 6);

    // Subtitle tagline
    this.add.text(cx, cy - 122, 'DEFEND THE GALAXY', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '14px',
      color: '#ffcc00',
      align: 'center',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Menu Buttons with generous vertical spacing (gapY = 60)
    const startY = cy - 54;
    const gapY = 60;

    // 1. PLAY BUTTON
    this.makeSciFiButton(cx, startY, 'PLAY', 'iconPlay', 0x00aa55, 0x00cc66, () => {
      if (this._activeModal) return;
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
        this.scene.start('UIScene');
      });
    });

    // 2. SETTINGS BUTTON
    this.makeSciFiButton(cx, startY + gapY, 'SETTINGS', 'iconSettings', 0x11162b, 0x222a44, () => {
      if (this._activeModal) return;
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('SettingsScene');
      });
    });

    // 3. HIGHSCORE BUTTON
    this.makeSciFiButton(cx, startY + gapY * 2, 'HIGHSCORE', 'iconLeaderboard', 0x11162b, 0x222a44, () => {
      this._showHighScoreModal();
    });

    // 4. HOW TO PLAY BUTTON
    this.makeSciFiButton(cx, startY + gapY * 3, 'HOW TO PLAY', 'iconHowToPlay', 0x11162b, 0x222a44, () => {
      this._showHowToPlayModal();
    });

    // Controls footer
    const isMobile = this.sys.game.device.input.touch;
    const controlsLabel = isMobile
      ? 'Touch & Drag to Move  •  Tap to Shoot'
      : 'WASD / Arrow Keys to Move  •  Space to Shoot';
    this.add.text(cx, H - 18, controlsLabel, {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '12px',
      color: '#556677'
    }).setOrigin(0.5);

    // Cheat status indicator
    this._cheatIndicator = this.add.text(cx, H - 36, '', {
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

    this.input.keyboard.on('keydown', (event) => {
      const char = event.key.toLowerCase();
      if (char.length === 1 && /[a-z]/.test(char)) {
        this._cheatBuffer += char;
        if (this._cheatBuffer.length > 12) {
          this._cheatBuffer = this._cheatBuffer.slice(-12);
        }
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

  // Refined Chamfered Button Factory with Clean White Borders and Vector Asset Icons
  makeSciFiButton(x, y, labelText, iconKey, colorNormal, colorHover, onClick) {
    // Support optional overload when iconKey is omitted
    if (typeof iconKey === 'number') {
      onClick = colorHover;
      colorHover = colorNormal;
      colorNormal = iconKey;
      iconKey = null;
    }

    const W = 250;
    const H = 44;
    const chamfer = 8;
    const container = this.add.container(x, y);

    // Main Chamfered Polygon Body Graphics
    const body = this.add.graphics();
    const drawBody = (fillColor, fillAlpha, strokeColor, strokeAlpha, strokeWidth) => {
      body.clear();
      body.fillStyle(fillColor, fillAlpha);
      body.lineStyle(strokeWidth, strokeColor, strokeAlpha);
      const poly = [
        { x: -W/2 + chamfer, y: -H/2 },
        { x:  W/2 - chamfer, y: -H/2 },
        { x:  W/2,           y: -H/2 + chamfer },
        { x:  W/2,           y:  H/2 - chamfer },
        { x:  W/2 - chamfer, y:  H/2 },
        { x: -W/2 + chamfer, y:  H/2 },
        { x: -W/2,           y:  H/2 - chamfer },
        { x: -W/2,           y: -H/2 + chamfer }
      ];
      body.fillPoints(poly, true);
      body.strokePoints(poly, true);
    };

    // Draw initial button state with clean white border (no outer glow)
    drawBody(colorNormal, 0.92, 0xffffff, 0.8, 2);

    // Vector Icon Image Asset (from assets/PNG/Menu/)
    let iconObj = null;
    let textX = 0;
    if (iconKey && this.textures.exists(iconKey)) {
      iconObj = this.add.image(-68, 0, iconKey).setDisplaySize(22, 22).setTint(0xffffff);
      textX = 10;
    }

    // Button Text Label
    const txt = this.add.text(textX, 0, labelText, {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(iconKey ? 0.4 : 0.5, 0.5);

    // Interactive Chamfered Hit Polygon Area
    const hitArea = new Phaser.Geom.Polygon([
      -W/2 + chamfer, -H/2,
       W/2 - chamfer, -H/2,
       W/2,           -H/2 + chamfer,
       W/2,            H/2 - chamfer,
       W/2 - chamfer,  H/2,
      -W/2 + chamfer,  H/2,
      -W/2,            H/2 - chamfer,
      -W/2,           -H/2 + chamfer
    ]);

    body.setInteractive(hitArea, Phaser.Geom.Polygon.Contains);
    body.input.cursor = 'pointer';

    body.on('pointerover', () => {
      if (this._activeModal) return;
      drawBody(colorHover, 0.98, 0xffffff, 1.0, 2);
      txt.setScale(1.03);
      if (iconObj) iconObj.setScale(1.08);
    });

    body.on('pointerout', () => {
      drawBody(colorNormal, 0.92, 0xffffff, 0.8, 2);
      txt.setScale(1.0);
      if (iconObj) iconObj.setScale(1.0);
      container.setY(y);
    });

    body.on('pointerdown', () => {
      if (this._activeModal) return;
      container.setY(y + 2);
      drawBody(colorHover, 1.0, 0xffffff, 1.0, 2);
    });

    body.on('pointerup', () => {
      container.setY(y);
      if (onClick) onClick();
    });

    const children = [body, txt];
    if (iconObj) children.push(iconObj);
    container.add(children);
    return container;
  }

  // Show Highscore Modal
  _showHighScoreModal() {
    if (this._activeModal) return;

    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    const modal = this.add.container(cx, cy).setDepth(100);
    this._activeModal = modal;

    const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setInteractive();

    const cardW = 380;
    const cardH = 310;
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x11162b, 0.96);
    cardBg.lineStyle(2, 0xffffff, 0.8);
    const p = [
      { x: -cardW/2 + 12, y: -cardH/2 },
      { x:  cardW/2 - 12, y: -cardH/2 },
      { x:  cardW/2,      y: -cardH/2 + 12 },
      { x:  cardW/2,      y:  cardH/2 - 12 },
      { x:  cardW/2 - 12, y:  cardH/2 },
      { x: -cardW/2 + 12, y:  cardH/2 },
      { x: -cardW/2,      y:  cardH/2 - 12 },
      { x: -cardW/2,      y: -cardH/2 + 12 }
    ];
    cardBg.fillPoints(p, true);
    cardBg.strokePoints(p, true);

    const titleText = this.add.text(0, -cardH/2 + 28, '♛  HIGH SCORES', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '20px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    const userHighScore = parseInt(localStorage.getItem('spaceInvadersHighScore') || '0');
    const ranks = [
      { rank: '1ST', name: 'GALAXY ACE', score: Math.max(userHighScore, 50000) },
      { rank: '2ND', name: 'STAR COMMANDER', score: userHighScore > 0 && userHighScore < 50000 ? userHighScore : 35000 },
      { rank: '3RD', name: 'SPACE REAPER', score: 25000 },
      { rank: '4TH', name: 'COSMIC PILOT', score: 15000 },
      { rank: '5TH', name: 'ROOKIE DEFENDER', score: 8000 }
    ];

    const entries = [];
    ranks.forEach((r, idx) => {
      const yPos = -cardH/2 + 75 + idx * 34;
      const isUser = (userHighScore > 0 && r.score === userHighScore);
      const color = isUser ? '#ffcc00' : '#ffffff';

      const rankTxt = this.add.text(-140, yPos, `${r.rank}  ${r.name}`, {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '12px',
        color: color
      }).setOrigin(0, 0.5);

      const scoreTxt = this.add.text(140, yPos, String(r.score).padStart(6, '0'), {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '12px',
        color: color
      }).setOrigin(1, 0.5);

      entries.push(rankTxt, scoreTxt);
    });

    const closeBtn = this.makeSciFiButton(0, cardH/2 - 32, '✖  CLOSE', 0x334466, 0x556688, () => {
      modal.destroy();
      this._activeModal = null;
    });

    modal.add([overlay, cardBg, titleText, ...entries, closeBtn]);
  }

  // Show How To Play Modal
  _showHowToPlayModal() {
    if (this._activeModal) return;

    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    const modal = this.add.container(cx, cy).setDepth(100);
    this._activeModal = modal;

    const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setInteractive();

    const cardW = 400;
    const cardH = 340;
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x11162b, 0.96);
    cardBg.lineStyle(2, 0xffffff, 0.8);
    const p = [
      { x: -cardW/2 + 12, y: -cardH/2 },
      { x:  cardW/2 - 12, y: -cardH/2 },
      { x:  cardW/2,      y: -cardH/2 + 12 },
      { x:  cardW/2,      y:  cardH/2 - 12 },
      { x:  cardW/2 - 12, y:  cardH/2 },
      { x: -cardW/2 + 12, y:  cardH/2 },
      { x: -cardW/2,      y:  cardH/2 - 12 },
      { x: -cardW/2,      y: -cardH/2 + 12 }
    ];
    cardBg.fillPoints(p, true);
    cardBg.strokePoints(p, true);

    const titleText = this.add.text(0, -cardH/2 + 28, '📖  HOW TO PLAY', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '20px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    const isMobile = this.sys.game.device.input.touch;
    const controlsTitle = this.add.text(0, -cardH/2 + 65, 'MISSION CONTROLS', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '13px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    const controlsDesc = isMobile
      ? '• Touch & Drag finger to move ship\n• Automatic / Tap screen to fire lasers'
      : '• WASD / Arrow Keys to move ship\n• Spacebar / Left Click to fire lasers';

    const controlsTxt = this.add.text(0, -cardH/2 + 100, controlsDesc, {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);

    const powerTitle = this.add.text(0, -cardH/2 + 148, 'POWER-UPS & DROPS', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '13px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    const powerDesc = 
      '🛡 SHIELD: Temporal invulnerability barrier\n' +
      '⚡ BOLT: Rapid triple-stream laser cannons\n' +
      '💊 PILL: Emergency starship hull repair\n' +
      '☄ METEORS: Destroy meteors for bonus score';

    const powerTxt = this.add.text(0, -cardH/2 + 208, powerDesc, {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '11px',
      color: '#88ccff',
      align: 'left',
      lineSpacing: 6
    }).setOrigin(0.5);

    const closeBtn = this.makeSciFiButton(0, cardH/2 - 32, '✖  CLOSE', 0x334466, 0x556688, () => {
      modal.destroy();
      this._activeModal = null;
    });

    modal.add([overlay, cardBg, titleText, controlsTitle, controlsTxt, powerTitle, powerTxt, closeBtn]);
  }

  // Show Exit Modal
  _activateCheat(cheatKey, message) {
    ACTIVE_CHEATS[cheatKey] = !ACTIVE_CHEATS[cheatKey];
    const isOn = ACTIVE_CHEATS[cheatKey];

    this._audioManager.playCheatBeep();

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

  update() {
    if (this.bg) {
      this.bg.tilePositionY -= 1.0;
    }
  }
}
