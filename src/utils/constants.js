// Global game constants and configuration options
const GAME_CONFIG = {
  width: 800, // Virtual game design width
  height: 600, // Virtual game design height
  playerSpeed: 350, // Movement speed of player ship in pixels per second
  playerFireRate: 250, // Minimum delay between player shots in milliseconds
  bulletSpeed: 500, // Speed of bullets in pixels per second
  enemyBulletSpeed: 220, // Speed of enemy bullets in pixels per second
  enemyRows: 4, // Number of enemy rows in the grid
  enemyCols: 8, // Number of enemy columns in the grid
  enemyStepDown: 20, // Downward displacement per row step
  enemyBaseSpeed: 40, // Base horizontal movement speed of enemies
  enemyFireRate: 1500, // Interval between random enemy shots in milliseconds
  initialLives: 3, // Initial player lives
  ctaUrl: 'https://playables42.com/creative-closet' // AppLovin CTA destination link
};
