// Script to convert image assets into base64 JavaScript module
const fs = require('fs');
const path = require('path');

// Base directory for assets
const assetsDir = path.join(__dirname, '../assets');

// List of target image assets to embed
const assetMapping = {
  background: 'Backgrounds/darkPurple.png',
  player: 'PNG/playerShip1_red.png',
  enemyRed: 'PNG/Enemies/enemyBlue.png',
  enemyGreen: 'PNG/Enemies/enemyBlue.png',
  enemyBlue: 'PNG/Enemies/enemyBlue.png',
  laserPlayer: 'PNG/Lasers/playerLaserRed01.png',
  laserEnemy: 'PNG/Lasers/enemyLaserBlue01.png',
  shield: 'PNG/Power-ups/shield_gold.png',
  stone: 'PNG/Meteors/meteorBrown_small1.png',
  stoneBig: 'PNG/Meteors/meteorBrown_med1.png',
  blast: 'PNG/Effects/yellowFire.png',
  blast2: 'PNG/Effects/blueFire.png',
  blast3: 'PNG/Effects/yellowFire.png',
  damage1: 'PNG/Damage/playerShip1_damage1.png',
  damage2: 'PNG/Damage/playerShip1_damage2.png',
  damage3: 'PNG/Damage/playerShip1_damage3.png',
  damage4: 'PNG/Damage/playerShip2_damage1.png',
  damage5: 'PNG/Damage/playerShip2_damage2.png',
  damage6: 'PNG/Damage/playerShip2_damage3.png',
  damage7: 'PNG/Damage/playerShip3_damage1.png',
  damage8: 'PNG/Damage/playerShip3_damage2.png',
  damage9: 'PNG/Damage/playerShip3_damage3.png',
  life: 'PNG/playerLife1_red.png',
  pillRed: 'PNG/Power-ups/pill_red.png',
  powerupRed: 'PNG/Power-ups/powerupRed_bolt.png',
  shield: 'PNG/Power-ups/shield_silver.png',
  shield1: 'PNG/Power-ups/shield1.png',
  numeral0: 'PNG/Power-ups/numeral0.png',
  numeral1: 'PNG/Power-ups/numeral1.png',
  numeral2: 'PNG/Power-ups/numeral2.png',
  numeral3: 'PNG/Power-ups/numeral3.png',
  numeral4: 'PNG/Power-ups/numeral4.png',
  numeral5: 'PNG/Power-ups/numeral5.png',
  numeral6: 'PNG/Power-ups/numeral6.png',
  numeral7: 'PNG/Power-ups/numeral7.png',
  numeral8: 'PNG/Power-ups/numeral8.png',
  numeral9: 'PNG/Power-ups/numeral9.png',
  numeralX: 'PNG/Power-ups/numeralX.png',
  iconPlay: 'PNG/Menu/play_arrow_24dp.svg',
  iconSettings: 'PNG/Menu/settings_24dp.svg',
  iconLeaderboard: 'PNG/Menu/leaderboard_24dp.svg',
  iconHowToPlay: 'PNG/Menu/developer_guide_24dp.svg',
  iconMute: 'PNG/Menu/volume_off_24dp.svg',
  iconBack: 'PNG/Menu/keyboard_backspace_24dp.svg',
  iconMenu: 'PNG/Menu/menu_24dp.svg',
  iconReplay: 'PNG/Menu/replay_24dp.svg',
  iconGameOver: 'PNG/Menu/game-over.svg',
  logo: 'chickenInvader.png',
  bgm: 'Backgrounds/starsmix_trimmed.ogg'
};

// Convert image, SVG, or audio file to base64 data URL
function getBase64DataUrl(relativePath) {
  const fullPath = path.join(assetsDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Asset not found: ${fullPath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(fullPath);
  const extension = path.extname(fullPath).replace('.', '').toLowerCase();
  let mimeType = 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
  else if (extension === 'svg') mimeType = 'image/svg+xml';
  else if (extension === 'ogg') mimeType = 'audio/ogg';
  else if (extension === 'mp3') mimeType = 'audio/mp3';
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

// Generate the output object
const base64Assets = {};
for (const [key, relativePath] of Object.entries(assetMapping)) {
  base64Assets[key] = getBase64DataUrl(relativePath);
}

// Ensure target directory exists
const targetDir = path.join(__dirname, '../src/assets');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Write generated file
const fileContent = `// Base64 encoded assets for single-file executable build\nconst BASE64_ASSETS = ${JSON.stringify(base64Assets, null, 2)};\n`;
fs.writeFileSync(path.join(targetDir, 'base64Assets.js'), fileContent);
console.log('Successfully generated src/assets/base64Assets.js');
