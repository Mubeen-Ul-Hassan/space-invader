// Loads base64 texture assets into Phaser before the menu opens
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading Game Assets...', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    for (const [key, base64Data] of Object.entries(BASE64_ASSETS)) {
      this.load.image(key, base64Data);
    }
  }

  // Wait for the custom font before showing the menu, so text doesn't reflow
  create() {
    if (document.fonts && document.fonts.load) {
      document.fonts.load('16px "EurostileExtendedBlack"').then(() => {
        this.scene.start('MainMenuScene');
      }).catch(() => {
        this.scene.start('MainMenuScene');
      });
    } else {
      this.scene.start('MainMenuScene');
    }
  }
}
