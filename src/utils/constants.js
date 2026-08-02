// Global game constants
const GAME_CONFIG = {
  playerSpeed: 350,
  playerFireRate: 250,
  bulletSpeed: 500,
  enemyBulletSpeed: 220,
  initialLives: 3,
  ctaUrl: 'https://playables42.com/creative-closet'
};

// Cheat flags — toggled by typing a code on the Main Menu screen
// freeze: slows enemies/bullets to 20% speed (player unaffected)
// enderlein: max firepower, triple bullet spread
// motherlode: full lives + all power-ups active
// boss: skip straight to the boss fight
const ACTIVE_CHEATS = {
  freeze: false,
  enderlein: false,
  motherlode: false,
  boss: false
};
