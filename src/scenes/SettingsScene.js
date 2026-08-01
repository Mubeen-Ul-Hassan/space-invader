// SettingsScene — Redesigned to match Main Menu pill-button aesthetic
class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    this.audioManager = new AudioManager();
    this.previousVolume = this.audioManager.getVolume();

    // Scrolling background
    this.bg = this.add.tileSprite(0, 0, W, H, 'background').setOrigin(0, 0);

    // ── Card Panel (pill-rounded, same style as menu buttons) ──────────────
    const cardW = Math.min(W * 0.88, 400);
    const cardH = 320;
    const radius = 18;

    const card = this.add.graphics();
    const drawCard = () => {
      card.clear();
      card.fillStyle(0x0d1226, 0.96);
      card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, radius);
      // Top bevel highlight
      card.lineStyle(1.5, 0xffffff, 0.18);
      card.lineBetween(cx - cardW / 2 + radius, cy - cardH / 2 + 4, cx + cardW / 2 - radius, cy - cardH / 2 + 4);
      // Outer border
      card.lineStyle(2, 0xffffff, 0.85);
      card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, radius);
    };
    drawCard();

    // ── Title ──────────────────────────────────────────────────────────────
    this.add.text(cx, cy - cardH / 2 + 30, 'SETTINGS', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '24px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    // Divider line
    const divG = this.add.graphics();
    divG.lineStyle(1, 0xffffff, 0.2);
    divG.lineBetween(cx - cardW / 2 + 20, cy - cardH / 2 + 55, cx + cardW / 2 - 20, cy - cardH / 2 + 55);

    // ── Volume Section ─────────────────────────────────────────────────────
    this.add.text(cx, cy - 85, 'MASTER VOLUME', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '15px',
      color: '#aabbcc'
    }).setOrigin(0.5);

    // Volume percentage
    this.volumeText = this.add.text(cx, cy - 50, `${Math.round(this.audioManager.getVolume() * 100)}%`, {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Slider track
    const trackW = cardW - 136;
    const trackY = cy;
    const trackG = this.add.graphics();
    trackG.fillStyle(0x1e2a44, 1);
    trackG.fillRoundedRect(cx - trackW / 2, trackY - 8, trackW, 16, 8);

    // Slider fill
    this.sliderFill = this.add.graphics();
    this._drawSliderFill(trackW, trackY);

    // Decrement '-' pill button
    this._makePillBtn(cx - trackW / 2 - 30, trackY, 44, 44, '-', 0xaa2233, 0xcc3344, () => this.adjustVolume(-0.1));

    // Increment '+' pill button
    this._makePillBtn(cx + trackW / 2 + 30, trackY, 44, 44, '+', 0x006633, 0x00aa55, () => this.adjustVolume(0.1));

    // ── Mute / Test buttons row ────────────────────────────────────────────
    const btnY = cy + 68;
    const halfGap = cardW / 4 - 10;

    this._makePillBtn(cx - halfGap, btnY, cardW / 2 - 24, 42, 'MUTE', 0x1a2240, 0x2a3460, 'iconMute', () => {
      if (this.audioManager.getVolume() > 0) {
        this.previousVolume = this.audioManager.getVolume();
        this.setVolumeLevel(0);
        this.muteBtnTxt.setText('UNMUTE');
      } else {
        this.setVolumeLevel(this.previousVolume || 0.8);
        this.muteBtnTxt.setText('MUTE');
      }
    });
    this.muteBtnTxt = this._getLastBtnTxt();

    this._makePillBtn(cx + halfGap, btnY, cardW / 2 - 24, 42, 'TEST SOUND', 0x1a2240, 0x2a3460, 'iconPlay', () => {
      this.audioManager.playShoot();
    });

    // ── Back Button ────────────────────────────────────────────────────────
    const backY = cy + cardH / 2 - 42;
    this._makePillBtn(cx, backY, 160, 44, 'BACK', 0x1a2240, 0x2a3460, () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    this._trackW = trackW;
    this._trackY = trackY;
    this._cx = cx;

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  // Helper: draw slider fill
  _drawSliderFill(trackW, trackY) {
    const cx = this._cx !== undefined ? this._cx : this.scale.width / 2;
    this.sliderFill.clear();
    const vol = this.audioManager.getVolume();
    if (vol > 0) {
      this.sliderFill.fillStyle(0x00ffcc, 1);
      this.sliderFill.fillRoundedRect(cx - trackW / 2, trackY - 7, trackW * vol, 14, 7);
    }
  }

  // Helper: create a pill-rounded button with optional icon
  // Signature: _makePillBtn(x, y, w, h, label, normalColor, hoverColor, iconKeyOrCallback, onClick)
  _makePillBtn(x, y, w, h, label, normalColor, hoverColor, iconKeyOrCb, onClick) {
    // Support old 8-arg call (no icon) and new 9-arg call (with icon)
    let iconKey = null;
    let cb = onClick;
    if (typeof iconKeyOrCb === 'function') { cb = iconKeyOrCb; iconKey = null; }
    else if (typeof iconKeyOrCb === 'string') { iconKey = iconKeyOrCb; }

    const r = Math.min(h / 2, 14);
    const bg = this.add.graphics();
    const draw = (col) => {
      bg.clear();
      bg.fillStyle(col, 0.95);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
      bg.lineStyle(1.5, 0xffffff, col === hoverColor ? 1.0 : 0.7);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
      bg.lineStyle(1, 0xffffff, col === hoverColor ? 0.35 : 0.15);
      bg.lineBetween(x - w / 2 + r, y - h / 2 + 3, x + w / 2 - r, y - h / 2 + 3);
    };
    draw(normalColor);

    // Icon (same 22px size as main menu buttons)
    let iconObj = null;
    let textX = 0;
    if (iconKey && this.textures.exists(iconKey)) {
      iconObj = this.add.image(x - w / 2 + 24, y, iconKey)
        .setDisplaySize(22, 22).setTint(0xffffff);
      textX = 10;
    }

    const txt = this.add.text(x + textX, y, label, {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: h >= 44 ? '15px' : '18px',
      color: '#ffffff'
    }).setOrigin(iconKey ? 0.4 : 0.5, 0.5);

    bg.setInteractive(new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    bg.input.cursor = 'pointer';
    bg.on('pointerover',  () => { draw(hoverColor); if (iconObj) iconObj.setScale(1.08); });
    bg.on('pointerout',   () => { draw(normalColor); if (iconObj) iconObj.setScale(1.0); });
    bg.on('pointerdown',  () => { draw(hoverColor); });
    bg.on('pointerup',    () => { draw(normalColor); if (cb) cb(); });

    this._lastBtnTxt = txt;
    return bg;
  }

  _getLastBtnTxt() { return this._lastBtnTxt; }

  adjustVolume(delta) {
    const current = this.audioManager.getVolume();
    this.setVolumeLevel(current + delta);
  }

  setVolumeLevel(val) {
    this.audioManager.setVolume(val);
    const updated = this.audioManager.getVolume();
    this.volumeText.setText(`${Math.round(updated * 100)}%`);
    const tw = this._trackW || 240;
    const ty = this._trackY || this.scale.height / 2;
    this._cx = this._cx || this.scale.width / 2;
    this._drawSliderFill(tw, ty);
    if (this.muteBtnTxt) {
      this.muteBtnTxt.setText(updated === 0 ? 'UNMUTE' : 'MUTE');
    }
  }

  update() {
    if (this.bg) this.bg.tilePositionY -= 0.8;
  }
}
