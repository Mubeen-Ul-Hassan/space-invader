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

window.addEventListener('load', () => {
  window.game = new Phaser.Game(config);
});
