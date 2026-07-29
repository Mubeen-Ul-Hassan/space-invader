# Space Invaders - Playable Ad 🚀

A responsive, high-performance **Space Invaders** playable ad built with **Phaser 3**. Designed specifically as a single-file executable deliverable for mobile ad networks like **AppLovin**.

---

## 🎮 Game Overview

Players pilot a starship at the bottom of the screen to defend against waves of invading alien anomalies.
- **Controls:** Intuitive touch drag (mobile) or Arrow Keys / WASD + Spacebar (desktop).
- **Destructible Defense Bunkers:** Protective shields block incoming alien fire and degrade upon impact.
- **Win State:** Defeat all 32 alien invaders to trigger victory screen and AppLovin CTA redirect.
- **Game Over State:** Triggered when all 3 ship lives are lost or when alien invaders descend to the bottom line.
- **Audio:** Web Audio API sound generator for retro laser pew, explosion rumble, player hit, victory, and game over sounds.

---

## 🛠️ Technical Specifications & Architecture

- **Engine:** Phaser 3 (`v3.70.0`)
- **Deliverable Target:** Single HTML file (`index.html`) under 5 MB (Actual build size: **1.20 MB**).
- **Asset Encoding:** Base64 data URLs embedded directly to prevent cross-origin or external network requests.
- **Modular Component Design:**
  - `Player.js`: Custom Sprite object managing ship movement bounds, touch input, and weapon firing.
  - `Enemy.js` & `EnemyGroup`: Invader formation grid, edge bounce step-down logic, speed scaling, and random alien firing.
  - `Bullet.js`: Physics object pool for player and enemy projectiles with auto-recycling.
  - `Shield.js`: Destructible static barrier blocks with opacity state degradation.
  - `AudioManager.js`: Synthesized Web Audio API sound effects generator.
  - `BootScene`, `GameScene`, `UIScene`: Separated scene lifecycle logic for preloading, gameplay physics, and HUD/modal overlays.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd space-invader
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build single-file deliverable (`index.html`):**
   ```bash
   npm run build
   ```

4. **Start local development server:**
   ```bash
   npm start
   ```
   Open `http://localhost:8080` in your web browser to play the game.

---

## ⚖️ Trade-offs & Assumptions

1. **Base64 Asset Bundling:**
   - *Trade-off:* Base64 encoding increases asset payload size by ~33% compared to binary files.
   - *Rationale:* Eliminates external network dependencies and ensures instant loading on ad networks.
2. **Procedural Web Audio API vs Audio Files:**
   - *Trade-off:* Synthesized audio tones sound retro compared to real MP3/WAV recordings.
   - *Rationale:* Saves 1-2 MB of payload size and avoids browser audio decoding CORS/missing asset warnings.

---

## 🎨 Asset Credits

- Sprite assets sourced from [Kenney.nl Space Shooter Redux](https://kenney.nl/assets/space-shooter-redux) (CC0 1.0 Universal / Public Domain).
