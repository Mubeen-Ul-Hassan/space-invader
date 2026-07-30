// Script to convert image assets into base64 JavaScript module
const fs = require('fs');
const path = require('path');

// Base directory for assets
const assetsDir = path.join(__dirname, '../assets');

// List of target image assets to embed
const assetMapping = {
  background: 'Backgrounds/darkPurple.png',
  player: 'PNG/playerShip1_red.png',
  enemyRed: 'PNG/Enemies/enemyRed1.png',
  enemyGreen: 'PNG/Enemies/enemyGreen1.png',
  enemyBlue: 'PNG/Enemies/enemyBlue1.png',
  laserPlayer: 'PNG/Lasers/playerLaserRed01.png',
  laserEnemy: 'PNG/Lasers/enemyLaserBlue01.png',
  shield: 'PNG/Power-ups/shield_gold.png',
  stone: 'PNG/Meteors/meteorGrey_small1.png',
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
  life: 'PNG/playerLife1_red.png'
};

// Convert image file to base64 data URL
function getBase64DataUrl(relativePath) {
  const fullPath = path.join(assetsDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Asset not found: ${fullPath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(fullPath);
  const extension = path.extname(fullPath).replace('.', '');
  const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
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
