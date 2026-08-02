// Main Phaser 3 game configuration
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE, // fill full screen on any device
    parent: 'game-container',
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MainMenuScene, SettingsScene, GameScene, UIScene]
};

// Initialize game when MRAID is ready (or DOM loaded)
MRAIDHelper.init(() => {
  window.game = new Phaser.Game(config);

  // WebGL context loss listener & fallback handler
  window.game.events.once('ready', () => {
    const canvas = window.game.canvas;
    if (canvas) {
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        console.warn('WebGL context lost. Handling gracefully...');
      });
    }
  });
});
