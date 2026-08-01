// SettingsScene — Simple, clean master volume controls
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

    // Background tile
    this.bg = this.add.tileSprite(0, 0, W, H, 'background').setOrigin(0, 0);

    // Title
    const titleText = this.add.text(cx, cy - 130, 'SETTINGS', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '32px',
      color: '#00ffcc'
    }).setOrigin(0.5);
    titleText.setStroke('#003344', 4);

    // Main Card Panel
    const card = this.add.rectangle(cx, cy, 440, 220, 0x11162b, 0.95);
    card.setStrokeStyle(2, 0x00ffcc, 0.8);

    // Master Volume Section Label
    this.add.text(cx, cy - 70, 'MASTER VOLUME', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Percentage Display
    this.volumeText = this.add.text(cx, cy - 30, `${Math.round(this.audioManager.getVolume() * 100)}%`, {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '28px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    // Volume Slider Track & Fill
    const trackWidth = 240;
    const trackX = cx - trackWidth / 2;
    const trackY = cy + 15;

    this.add.rectangle(cx, trackY, trackWidth, 14, 0x222a44).setOrigin(0.5);

    this.sliderFill = this.add.rectangle(trackX, trackY, trackWidth * this.audioManager.getVolume(), 14, 0x00ffcc).setOrigin(0, 0.5);

    // Decrement Button '-'
    const decBtn = this.add.rectangle(cx - 150, trackY, 36, 36, 0xcc3344).setInteractive({ useHandCursor: true });
    decBtn.setStrokeStyle(2, 0xffffff);
    this.add.text(cx - 150, trackY, '-', { fontFamily: '"EurostileExtendedBlack", "Arial Black", sans-serif', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    decBtn.on('pointerdown', () => this.adjustVolume(-0.1));

    // Increment Button '+'
    const incBtn = this.add.rectangle(cx + 150, trackY, 36, 36, 0x00cc66).setInteractive({ useHandCursor: true });
    incBtn.setStrokeStyle(2, 0xffffff);
    this.add.text(cx + 150, trackY, '+', { fontFamily: '"EurostileExtendedBlack", "Arial Black", sans-serif', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    incBtn.on('pointerdown', () => this.adjustVolume(0.1));

    // Mute / Unmute Button
    const muteBtn = this.add.rectangle(cx - 75, cy + 65, 120, 36, 0x334466).setInteractive({ useHandCursor: true });
    muteBtn.setStrokeStyle(1, 0xffffff);
    this.muteText = this.add.text(cx - 75, cy + 65, this.audioManager.getVolume() === 0 ? 'UNMUTE' : 'MUTE', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    muteBtn.on('pointerdown', () => {
      if (this.audioManager.getVolume() > 0) {
        this.previousVolume = this.audioManager.getVolume();
        this.setVolumeLevel(0);
        this.muteText.setText('UNMUTE');
      } else {
        const restore = this.previousVolume || 0.8;
        this.setVolumeLevel(restore);
        this.muteText.setText('MUTE');
      }
    });

    // Test Sound Button
    const testBtn = this.add.rectangle(cx + 75, cy + 65, 120, 36, 0x3355aa).setInteractive({ useHandCursor: true });
    testBtn.setStrokeStyle(1, 0xffffff);
    this.add.text(cx + 75, cy + 65, 'TEST SOUND', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    testBtn.on('pointerdown', () => this.audioManager.playShoot());

    // Back to Main Menu Button
    const backBtn = this.add.rectangle(cx, cy + 150, 180, 44, 0x444466).setInteractive({ useHandCursor: true });
    backBtn.setStrokeStyle(2, 0xffffff);
    this.add.text(cx, cy + 150, 'BACK', {
      fontFamily: '"EurostileExtendedBlack", "Arial Black", Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    backBtn.on('pointerover', () => backBtn.setFillStyle(0x666688));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x444466));
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  adjustVolume(delta) {
    const current = this.audioManager.getVolume();
    this.setVolumeLevel(current + delta);
  }

  setVolumeLevel(val) {
    this.audioManager.setVolume(val);
    const updated = this.audioManager.getVolume();
    this.volumeText.setText(`${Math.round(updated * 100)}%`);
    this.sliderFill.setSize(240 * updated, 14);
    if (this.muteText) {
      this.muteText.setText(updated === 0 ? 'UNMUTE' : 'MUTE');
    }
  }

  update() {
    if (this.bg) {
      this.bg.tilePositionY -= 0.8;
    }
  }
}
