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

    // ── Responsive Layout ─────────────────────────────────────────────────────
    // Original chickenInvader.png aspect ratio: 1774 × 887 (≈ 2 : 1)
    const LOGO_ASPECT  = 887 / 1774; // rendered height / width
    const FOOTER_H     = 45;         // height reserved at bottom for footer
    const BTN_H        = 46;         // single button height
    const BTN_GAP      = 12;         // vertical gap between buttons
    const BTN_COUNT    = 4;
    const LOGO_BTN_GAP = 22;         // gap between logo bottom and first button

    // Total buttons block height
    const totalBtnH = BTN_COUNT * BTN_H + (BTN_COUNT - 1) * BTN_GAP;

    // Usable vertical space (screen minus footer)
    const usableH = H - FOOTER_H;

    // Max logo height = usable space minus buttons block and gap
    const maxLogoH = usableH - LOGO_BTN_GAP - totalBtnH;

    // Desired logo width (90% of screen, capped at 520px)
    const logoTargetW = Math.min(W * 0.90, 520);
    const logoTargetH = logoTargetW * LOGO_ASPECT;

    // Clamp so buttons always fit
    const clampedLogoH = Math.min(logoTargetH, maxLogoH);
    const clampedLogoW = clampedLogoH / LOGO_ASPECT;

    // Total content block height
    const totalContentH = clampedLogoH + LOGO_BTN_GAP + totalBtnH;

    // Top offset to vertically center the whole block
    const topOffset = (usableH - totalContentH) / 2;

    // Derived positions
    const logoY  = topOffset + clampedLogoH / 2;
    const startY = topOffset + clampedLogoH + LOGO_BTN_GAP + BTN_H / 2;
    const gapY   = BTN_H + BTN_GAP;

    // ── Title Logo ────────────────────────────────────────────────────────────
    if (this.textures.exists('logo')) {
      const logoImg = this.add.image(cx, logoY, 'logo').setOrigin(0.5);
      if (logoImg.width > 0) {
        logoImg.setScale(clampedLogoW / logoImg.width);
      }
    }

    // ── Menu Buttons ──────────────────────────────────────────────────────────
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

    // ── Ship Below Menu ───────────────────────────────────────────────────────
    // Bottom of last button
    const lastBtnBottom = startY + gapY * (BTN_COUNT - 1) + BTN_H / 2;
    // Available space between last button and footer
    const shipZoneH = H - FOOTER_H - lastBtnBottom;
    // Centre the ship vertically in that gap
    const shipY = lastBtnBottom + shipZoneH / 2;

    const heroShip = this.add.image(cx, shipY, 'player')
      .setOrigin(0.5)
      .setScale(0.9);

    // Gentle vertical bob
    this.tweens.add({
      targets: heroShip,
      y: shipY - 10,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Slow horizontal drift left → right → left
    this.tweens.add({
      targets: heroShip,
      x: cx + 28,
      duration: 2800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
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

    this.cameras.main.resetFX();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // Smooth Rounded Sci-Fi Pill Button Factory with Dual Outline & Top-Edge Highlight
  makeSciFiButton(x, y, labelText, iconKey, colorNormal, colorHover, onClick) {
    // Support optional overload when iconKey is omitted
    if (typeof iconKey === 'number') {
      onClick = colorHover;
      colorHover = colorNormal;
      colorNormal = iconKey;
      iconKey = null;
    }

    const W = 252;
    const H = 46;
    const radius = 12; // Smooth rounded corner radius
    const container = this.add.container(x, y);

    // Main Button Body & Frame Graphics
    const body = this.add.graphics();
    const drawBody = (fillColor, fillAlpha, isHovered) => {
      body.clear();

      // 1. Solid Body Fill (Rounded Rectangle)
      body.fillStyle(fillColor, fillAlpha);
      body.fillRoundedRect(-W / 2, -H / 2, W, H, radius);

      // 2. Main White Border
      body.lineStyle(isHovered ? 2.5 : 2, 0xffffff, isHovered ? 1.0 : 0.85);
      body.strokeRoundedRect(-W / 2, -H / 2, W, H, radius);

      // 3. Top-Edge Glass Bevel Highlight Line
      body.lineStyle(1.5, 0xffffff, isHovered ? 0.5 : 0.25);
      body.lineBetween(-W / 2 + radius, -H / 2 + 3, W / 2 - radius, -H / 2 + 3);
    };

    // Initial Button Paint
    drawBody(colorNormal, 0.92, false);

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

    // Interactive Rounded Rectangle Hit Area
    const hitArea = new Phaser.Geom.Rectangle(-W / 2, -H / 2, W, H);
    body.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    body.input.cursor = 'pointer';

    body.on('pointerover', () => {
      if (this._activeModal) return;
      drawBody(colorHover, 0.98, true);
      txt.setScale(1.03);
      if (iconObj) iconObj.setScale(1.08);
    });

    body.on('pointerout', () => {
      drawBody(colorNormal, 0.92, false);
      txt.setScale(1.0);
      if (iconObj) iconObj.setScale(1.0);
      container.setY(y);
    });

    body.on('pointerdown', () => {
      if (this._activeModal) return;
      container.setY(y + 2);
      drawBody(colorHover, 1.0, true);
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

    const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setInteractive();

    // Pill-rounded card matching menu buttons
    const cardW = Math.min(W * 0.88, 380);
    const cardH = 320;
    const radius = 18;
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x0d1226, 0.97);
    cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
    // Top bevel
    cardBg.lineStyle(1.5, 0xffffff, 0.2);
    cardBg.lineBetween(-cardW / 2 + radius, -cardH / 2 + 4, cardW / 2 - radius, -cardH / 2 + 4);
    // Outer border
    cardBg.lineStyle(2, 0xffffff, 0.85);
    cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);

    // Title
    const titleText = this.add.text(0, -cardH / 2 + 30, 'HIGH SCORES', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '22px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    // Divider
    const divG = this.add.graphics();
    divG.lineStyle(1, 0xffffff, 0.2);
    divG.lineBetween(-cardW / 2 + 16, -cardH / 2 + 56, cardW / 2 - 16, -cardH / 2 + 56);

    const userHighScore = parseInt(localStorage.getItem('spaceInvadersHighScore') || '0');
    const ranks = [
      { rank: '#1', name: 'GALAXY ACE',      score: Math.max(userHighScore, 50000) },
      { rank: '#2', name: 'STAR COMMANDER',  score: userHighScore > 0 && userHighScore < 50000 ? userHighScore : 35000 },
      { rank: '#3', name: 'SPACE REAPER',    score: 25000 },
      { rank: '#4', name: 'COSMIC PILOT',    score: 15000 },
      { rank: '#5', name: 'ROOKIE DEFENDER', score: 8000  }
    ];

    const entries = [];
    const rowStartY = -cardH / 2 + 75;
    const rowGap = 33;
    ranks.forEach((r, idx) => {
      const yPos = rowStartY + idx * rowGap;
      const isUser = (userHighScore > 0 && r.score === userHighScore);
      const nameColor = isUser ? '#ffcc00' : '#ccddee';
      const scoreColor = isUser ? '#ffcc00' : '#ffffff';

      // Rank badge pill
      const rankBg = this.add.graphics();
      rankBg.fillStyle(isUser ? 0xaa7700 : 0x1a2240, 0.9);
      rankBg.fillRoundedRect(-cardW / 2 + 12, yPos - 11, 34, 22, 6);
      const rankTxt = this.add.text(-cardW / 2 + 29, yPos, r.rank, {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '13px',
        color: nameColor
      }).setOrigin(0.5);

      const nameTxt = this.add.text(-cardW / 2 + 54, yPos, r.name, {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '14px',
        color: nameColor
      }).setOrigin(0, 0.5);

      const scoreTxt = this.add.text(cardW / 2 - 14, yPos, String(r.score).padStart(6, '0'), {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '14px',
        color: scoreColor
      }).setOrigin(1, 0.5);

      entries.push(rankBg, rankTxt, nameTxt, scoreTxt);
    });

    const closeBtn = this.makeSciFiButton(0, cardH / 2 - 43, 'BACK', 0x1a2240, 0x2a3460, () => {
      modal.destroy();
      this._activeModal = null;
    });

    modal.add([overlay, cardBg, titleText, divG, ...entries, closeBtn]);
  }

  // Show How To Play Modal
  _showHowToPlayModal() {
    if (this._activeModal) return;

    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;

    // Keep all objects in an array to destroy as a group
    const items = [];
    const destroy = () => {
      items.forEach(o => o.destroy());
      this._activeModal = null;
    };

    // Dark overlay
    const overlay = this.add.rectangle(cx, H / 2, W, H, 0x000000, 0.88)
      .setDepth(50).setInteractive();
    items.push(overlay);

    // Card — compact, vertically centered
    const cardW = Math.min(W * 0.90, 390);
    const cardH = Math.min(H * 0.82, 500);
    const cardX = cx - cardW / 2;
    const cardY = (H - cardH) / 2;
    const r = 18;

    const bg = this.add.graphics().setDepth(51);
    bg.fillStyle(0x080e1a, 1);
    bg.fillRoundedRect(cardX, cardY, cardW, cardH, r);
    bg.lineStyle(2, 0xffffff, 1);
    bg.strokeRoundedRect(cardX, cardY, cardW, cardH, r);
    items.push(bg);

    // ── Helper: add text at absolute Y ───────────────────────────────────────
    let cursor = cardY + 36;
    const addText = (str, size, color, indent = 0) => {
      const t = this.add.text(cx + indent, cursor, str, {
        fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
        fontSize: `${size}px`,
        color,
        align: indent !== 0 ? 'left' : 'center'
      }).setOrigin(indent !== 0 ? 0 : 0.5, 0).setDepth(52);
      items.push(t);
      cursor += size * 1.48;
      return t;
    };
    const addGap = (px = 10) => { cursor += px; };
    const addDivider = () => {
      const g = this.add.graphics().setDepth(52);
      g.lineStyle(1, 0xffffff, 0.2);
      g.lineBetween(cardX + 20, cursor, cardX + cardW - 20, cursor);
      items.push(g);
      cursor += 14;
    };

    // ── Title ─────────────────────────────────────────────────────────────────
    addText('HOW TO PLAY', 26, '#00ffcc');
    addDivider();

    // ── Controls ─────────────────────────────────────────────────────────────
    addText('CONTROLS', 17, '#ffcc00');
    addGap(4);
    const isMobile = this.sys.game.device.input.touch;
    if (isMobile) {
      addText('DRAG  →  Move ship', 16, '#ffffff');
      addText('TAP   →  Fire lasers', 16, '#ffffff');
    } else {
      addText('WASD / ARROWS  →  Move', 16, '#ffffff');
      addText('SPACEBAR / CLICK  →  Fire', 16, '#ffffff');
    }
    addGap(4);
    addDivider();

    // ── Power-ups ─────────────────────────────────────────────────────────────
    addText('POWER-UPS', 17, '#ffcc00');
    addGap(4);

    const powerups = [
      { key: 'shield1',    label: 'SHIELD',  desc: 'Invulnerability barrier',   color: '#88ddff' },
      { key: 'powerupRed', label: 'BOLT',    desc: 'Triple rapid-fire cannons', color: '#ffee55' },
      { key: 'pillRed',    label: 'PILL',    desc: 'Restore hull / +1 life',    color: '#ff99bb' },
      { key: 'stone',      label: 'METEOR',  desc: 'Destroy for bonus score',   color: '#ccbbaa' }
    ];

    powerups.forEach(pu => {
      const rowY = cursor;
      // Icon
      if (this.textures.exists(pu.key)) {
        const ico = this.add.image(cardX + 30, rowY + 14, pu.key)
          .setDisplaySize(28, 28).setDepth(52);
        items.push(ico);
      }
      // Label + desc inline
      const lbl = this.add.text(cardX + 62, rowY, pu.label, {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '17px', color: pu.color
      }).setOrigin(0, 0).setDepth(52);
      const dsc = this.add.text(cardX + 62, rowY + 22, pu.desc, {
        fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
        fontSize: '13px', color: '#d0ddf0'
      }).setOrigin(0, 0).setDepth(52);
      items.push(lbl, dsc);
      cursor += 47;
    });

    // ── Back Button ──────────────────────────────────────────────────────────
    const btnW = 160, btnH = 44, btnR = 14;
    const btnX = cx - btnW / 2;
    const btnY = cardY + cardH - 64;

    const btnBg = this.add.graphics().setDepth(52);
    const drawBtn = (hovered) => {
      btnBg.clear();
      btnBg.fillStyle(hovered ? 0x2a3460 : 0x1a2240, 0.95);
      btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, btnR);
      btnBg.lineStyle(hovered ? 2.5 : 2, 0xffffff, hovered ? 1 : 0.85);
      btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, btnR);
      btnBg.lineStyle(1, 0xffffff, hovered ? 0.35 : 0.15);
      btnBg.lineBetween(btnX + btnR, btnY + 3, btnX + btnW - btnR, btnY + 3);
    };
    drawBtn(false);

    const btnTxt = this.add.text(cx, btnY + btnH / 2, 'BACK', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5, 0.5).setDepth(53);

    btnBg.setInteractive(new Phaser.Geom.Rectangle(btnX, btnY, btnW, btnH), Phaser.Geom.Rectangle.Contains);
    btnBg.input.cursor = 'pointer';
    btnBg.on('pointerover',  () => { drawBtn(true); });
    btnBg.on('pointerout',   () => { drawBtn(false); });
    btnBg.on('pointerup',    () => destroy());

    items.push(btnBg, btnTxt);
    if (iconObj) items.push(iconObj);

    // Store as active modal (use a dummy container to satisfy the guard)
    this._activeModal = { destroy };
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
