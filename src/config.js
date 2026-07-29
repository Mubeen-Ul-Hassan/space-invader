// Main Phaser 3 Game configuration file
const config = {
  type: Phaser.AUTO, // Auto-select WebGL or Canvas renderer
  width: GAME_CONFIG.width, // Virtual design canvas width (800px)
  height: GAME_CONFIG.height, // Virtual design canvas height (600px)
  parent: 'game-container', // HTML parent DOM element ID
  backgroundColor: '#050510', // Deep space dark canvas background color
  scale: {
    mode: Phaser.Scale.FIT, // Scale game canvas to fit screen container while preserving aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH // Automatically center game canvas horizontally and vertically
  },
  physics: {
    default: 'arcade', // Enable Phaser Arcade Physics engine
    arcade: {
      gravity: { y: 0 }, // Zero gravity for space shooter physics
      debug: false // Disable physics collision wireframe bounding boxes
    }
  },
  scene: [BootScene, GameScene, UIScene] // Ordered list of game scenes
};

// Initialize Phaser Game instance on DOM window load event
window.addEventListener('load', () => {
  window.game = new Phaser.Game(config); // Instantiate global Phaser Game object
});
