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

// Active cheat code flags — toggled by typing cheat codes on main menu screen
// freeze: slows all enemies/bullets to 25% speed (player unaffected)
// enderlein: grants extreme rapid-fire with triple bullet spread
// motherlode: restores full lives (5) and activates all three power-ups
const ACTIVE_CHEATS = {
  freeze: false,     // TRUE = enemy time-slow is active
  enderlein: false,  // TRUE = max firepower mode is active
  motherlode: false, // TRUE = full lives + all power-ups activated
  boss: false        // TRUE = start game directly at boss fight
};

