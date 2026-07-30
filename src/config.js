// Main Phaser 3 Game configuration file
const config = {
  type: Phaser.AUTO, // Auto-select WebGL or Canvas renderer
  scale: {
    mode: Phaser.Scale.FIT, // Scale game canvas to fit screen container while preserving aspect ratio
    parent: 'game-container', // HTML parent DOM element ID
    autoCenter: Phaser.Scale.CENTER_BOTH, // Automatically center game canvas horizontally and vertically
    width: GAME_CONFIG.width, // Virtual design width (800px)
    height: GAME_CONFIG.height // Virtual design height (600px)
  },
  physics: {
    default: 'arcade', // Enable Phaser Arcade Physics engine
    arcade: {
      gravity: { y: 0 }, // Zero gravity for space shooter physics
      debug: false // Disable physics collision wireframe bounding boxes
    }
  },
  scene: [BootScene, MainMenuScene, SettingsScene, GameScene, UIScene] // Ordered list of game scenes
};

// Initialize Phaser Game instance on DOM window load event
window.addEventListener('load', () => {
  window.game = new Phaser.Game(config); // Instantiate global Phaser Game object
});
