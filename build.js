// Node.js build script to bundle all game scripts and base64 assets into single index.html for AppLovin
const fs = require('fs');
const path = require('path');

// Ensure node_modules/phaser/dist/phaser.min.js exists
const phaserPath = path.join(__dirname, 'node_modules/phaser/dist/phaser.min.js');
if (!fs.existsSync(phaserPath)) {
  console.error('Error: Phaser library not found at ' + phaserPath);
  process.exit(1);
}

// Read Phaser minified library code
const phaserCode = fs.readFileSync(phaserPath, 'utf8');

// Array of source files in dependency order
const sourceFiles = [
  'src/utils/constants.js',
  'src/utils/mraidHelper.js',
  'src/assets/base64Assets.js',
  'src/managers/AudioManager.js',
  'src/managers/WaveManager.js',
  'src/entities/Bullet.js',
  'src/entities/Player.js',
  'src/entities/Enemy.js',
  'src/entities/EnemyShip.js',
  'src/entities/PowerUp.js',
  'src/entities/Boss.js',
  'src/scenes/BootScene.js',
  'src/scenes/MainMenuScene.js',
  'src/scenes/SettingsScene.js',
  'src/scenes/UIScene.js',
  'src/scenes/GameScene.js',
  'src/config.js'
];

// Concatenate game source code modules into single script block
let combinedGameCode = '';
sourceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    combinedGameCode += `\n/* --- ${file} --- */\n` + fs.readFileSync(filePath, 'utf8') + '\n';
  } else {
    console.warn(`Warning: file not found: ${filePath}`);
  }
});

// Single HTML template content
// Note: mraid is injected by AppLovin SDK at runtime — do not load mraid.js locally
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Space Invaders - Playable Ad</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">
  <style>
    /* Reset body and full viewport canvas centering CSS */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: #050510;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #game-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    #game-container canvas {
      display: block !important;
      margin: auto !important;
      touch-action: none;
    }
  </style>
</head>
<body>
  <!-- Container div for Phaser canvas element -->
  <div id="game-container"></div>

  <!-- Inline Phaser 3 Library -->
  <script type="text/javascript">
    ${phaserCode}
  </script>

  <!-- Inline Space Invaders Game Engine & Code -->
  <script type="text/javascript">
    ${combinedGameCode}
  </script>
</body>
</html>
`;

// Write single-file html output
const outputPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outputPath, htmlContent);

// Output build file size details
const stats = fs.statSync(outputPath);
const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`Successfully built index.html! File size: ${fileSizeInMB} MB (${stats.size} bytes)`);
