// Boot scene responsible for loading base64 texture assets into Phaser memory
class BootScene extends Phaser.Scene {
  // Construct BootScene with unique scene key
  constructor() {
    super({ key: 'BootScene' }); // Initialize scene with key name
  }

  // Preload base64 image data into Phaser texture cache
  preload() {
    // Show simple loading text while assets populate memory
    const loadingText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, 'Loading Game Assets...', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Register all base64 encoded texture images directly into Phaser Loader
    for (const [key, base64Data] of Object.entries(BASE64_ASSETS)) {
      this.load.image(key, base64Data); // Preload base64 image data URL into Loader queue
    }
  }

  // Transition to splash scene once base64 assets are registered
  create() {
    this.scene.start('SplashScene'); // Launch company SplashScene
  }
}
