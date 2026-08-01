// Boot scene responsible for loading base64 texture assets into Phaser memory
class BootScene extends Phaser.Scene {
  // Construct BootScene with unique scene key
  constructor() {
    super({ key: 'BootScene' }); // Initialize scene with key name
  }

  // Preload base64 image data into Phaser texture cache
  preload() {
    // Show simple loading text while assets populate memory
    const loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Loading Game Assets...', {
      fontFamily: '"EurostileExtendedBlack", Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Register all base64 encoded texture images directly into Phaser Loader (skip BGM audio)
    for (const [key, base64Data] of Object.entries(BASE64_ASSETS)) {
      if (key !== 'bgm' && !base64Data.startsWith('data:audio/')) {
        this.load.image(key, base64Data); // Preload base64 image data URL into Loader queue
      }
    }
  }

  // Transition to main menu scene once base64 assets and custom fonts are ready
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
