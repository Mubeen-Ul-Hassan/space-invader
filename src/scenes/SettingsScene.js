// Settings & Options Scene for Master Sound Volume adjustment
class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const cx = GAME_CONFIG.width / 2;
    const cy = GAME_CONFIG.height / 2;

    this.audioManager = new AudioManager();

    // Background tile
    this.bg = this.add.tileSprite(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 'background').setOrigin(0, 0);

    // Title label
    const titleText = this.add.text(cx, cy - 140, 'SETTINGS & OPTIONS', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '32px',
      color: '#00ffcc'
    }).setOrigin(0.5);
    titleText.setStroke('#003344', 4);

    // Card background frame
    const card = this.add.rectangle(cx, cy, 460, 240, 0x111122, 0.95);
    card.setStrokeStyle(3, 0x00ffcc);

    // Volume Section Header
    this.add.text(cx, cy - 80, 'SOUND MASTER VOLUME', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Volume Level Display
    this.volumeText = this.add.text(cx, cy - 35, `${Math.round(this.audioManager.getVolume() * 100)}%`, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '24px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    // Slider track background
    const sliderTrack = this.add.rectangle(cx, cy + 10, 260, 16, 0x333355).setOrigin(0.5);
    sliderTrack.setStrokeStyle(1, 0x666688);

    // Interactive Slider Fill Bar
    this.sliderFill = this.add.rectangle(cx - 130, cy + 10, 260 * this.audioManager.getVolume(), 16, 0x00ffcc).setOrigin(0, 0.5);

    // Interactive Decrement Button '-'
    const decBtn = this.add.rectangle(cx - 165, cy + 10, 36, 36, 0xcc3344).setInteractive({ useHandCursor: true });
    decBtn.setStrokeStyle(2, 0xffffff);
    this.add.text(cx - 165, cy + 10, '-', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    decBtn.on('pointerdown', () => this.adjustVolume(-0.1));

    // Interactive Increment Button '+'
    const incBtn = this.add.rectangle(cx + 165, cy + 10, 36, 36, 0x00cc66).setInteractive({ useHandCursor: true });
    incBtn.setStrokeStyle(2, 0xffffff);
    this.add.text(cx + 165, cy + 10, '+', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    incBtn.on('pointerdown', () => this.adjustVolume(0.1));

    // Mute / Unmute Toggle Button
    const muteBtn = this.add.rectangle(cx - 80, cy + 60, 130, 36, 0x444466).setInteractive({ useHandCursor: true });
    muteBtn.setStrokeStyle(1, 0xffffff);
    const muteText = this.add.text(cx - 80, cy + 60, 'MUTE', { fontFamily: 'Arial Black', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

    muteBtn.on('pointerdown', () => {
      if (this.audioManager.getVolume() > 0) {
        this.previousVolume = this.audioManager.getVolume();
        this.setVolumeLevel(0);
        muteText.setText('UNMUTE');
      } else {
        const restoreVol = this.previousVolume || 0.8;
        this.setVolumeLevel(restoreVol);
        muteText.setText('MUTE');
      }
    });

    // Test Sound Button
    const testBtn = this.add.rectangle(cx + 80, cy + 60, 130, 36, 0x3366cc).setInteractive({ useHandCursor: true });
    testBtn.setStrokeStyle(1, 0xffffff);
    this.add.text(cx + 80, cy + 60, 'TEST SOUND', { fontFamily: 'Arial Black', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);
    testBtn.on('pointerdown', () => this.audioManager.playShoot());

    // Back to Main Menu Button
    const backBtn = this.add.rectangle(cx, cy + 150, 180, 44, 0x666688).setInteractive({ useHandCursor: true });
    backBtn.setStrokeStyle(2, 0xffffff);
    this.add.text(cx, cy + 150, 'BACK', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    backBtn.on('pointerover', () => backBtn.setFillStyle(0x8888aa));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x666688));
    backBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }

  adjustVolume(delta) {
    const current = this.audioManager.getVolume();
    this.setVolumeLevel(current + delta);
  }

  setVolumeLevel(val) {
    this.audioManager.setVolume(val);
    const updated = this.audioManager.getVolume();
    this.volumeText.setText(`${Math.round(updated * 100)}%`);
    this.sliderFill.setSize(260 * updated, 16);
  }

  update() {
    if (this.bg) {
      this.bg.tilePositionY -= 0.8;
    }
  }
}
