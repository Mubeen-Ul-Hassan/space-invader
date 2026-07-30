# Space Invaders — Phaser 3 Playable

A responsive, wave-based **Space Invaders** game built with **Phaser 3** as a single-file HTML deliverable.

---

## 🎮 Game Overview

Pilot a starship to defend the galaxy against waves of incoming meteorites and enemy ships. Collect power-ups, survive all 5 waves, and achieve victory.

### Objective
- Survive all 5 enemy waves to win.
- Lose all lives and it's game over.

### Controls
| Input | Action |
|-------|--------|
| `Arrow Keys` / `WASD` | Move ship (Left, Right, Up, Down) |
| `Space` | Fire laser |
| `Click / Touch Drag` | Move ship (mobile & mouse) |

### Features
- **5-Wave Progression** — structured wave system with meteorite formations and enemy ships
- **Enemy Ships** — appear after a 40-second grace period; shoot lasers at the player
- **Power-Ups** (drop randomly with 10% chance):
  - 💊 `pill_red` — +1 extra life (max 5)
  - ⚡ `powerupRed` — 12-second rapid-fire boost
  - 🛡 `shield` — 15-second invincibility shield with visual aura
- **Lives System** — 3 starting lives displayed via ship icon HUD
- **Score Tracking** — high score persisted via `localStorage`
- **Settings** — in-game master volume control with mute toggle
- **Respawn Invincibility** — 2-second flash immunity after taking damage

---

## 🛠 Technical Specifications

- **Engine:** Phaser 3 (`v3.70.0`)
- **Deliverable:** Single HTML file (`index.html`) — **1.24 MB** (well under 5 MB limit)
- **Asset Encoding:** All sprites and backgrounds embedded as base64 data URLs — no external network requests
- **Audio:** Web Audio API procedural sound effects (no audio file dependencies)
- **Responsive Scaling:** `Phaser.Scale.FIT` + `CENTER_BOTH` — scales and centers correctly on all screen sizes

### Architecture
```
src/
├── assets/          # Auto-generated base64 asset strings
├── entities/
│   ├── Player.js    # 4-directional ship movement, shield/rapid-fire boosts
│   ├── Enemy.js     # Meteorite objects with exponential speed scaling
│   ├── EnemyShip.js # Enemy ships with sine-wave movement and laser firing
│   ├── Bullet.js    # Pooled physics projectiles (player & enemy)
│   └── PowerUp.js   # Collectible drop items (pill, powerup, shield)
├── managers/
│   ├── AudioManager.js  # Web Audio API synthesized sound effects
│   └── WaveManager.js   # 5-wave progression with formation spawning
├── scenes/
│   ├── BootScene.js     # Asset preloading
│   ├── MainMenuScene.js # Main menu with title, buttons, high score
│   ├── SettingsScene.js # Volume control settings screen
│   ├── GameScene.js     # Core game physics, collisions, and state
│   └── UIScene.js       # HUD, wave banners, game-over/win modals
└── utils/
    └── constants.js     # Shared game configuration constants
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm

### Installation

```bash
git clone <repository-url>
cd space-invader
npm install
```

### Build

Generates the single-file `index.html` deliverable:

```bash
npm run build
```

### Run Locally

```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## ⚖️ Trade-offs & Assumptions

1. **Single-file bundle over modular server deployment**
   - All assets, Phaser, and game code are inlined into one HTML file for maximum portability and ad-network compatibility.
   - Trade-off: Base64 encoding increases asset size ~33% vs binary — still well within the 5 MB limit at 1.24 MB.

2. **Procedural audio via Web Audio API**
   - Eliminates audio file dependencies and saves 1–2 MB of payload.
   - Trade-off: Synthesized tones have a retro character rather than realistic sound design.

3. **Wave-based enemy system over classic grid formation**
   - Progressive waves with meteorite formations and individually spawned enemy ships feel more dynamic and game-like.
   - Trade-off: Less visually iconic than the classic Space Invaders grid, but more engaging over longer sessions.

4. **40-second grace period before enemy ships appear**
   - Gives new players time to learn controls and game mechanics before enemy ships introduce additional threat.

### Potential Improvements
- Add more power-up types (spread shot, bomb, magnet)
- Leaderboard with multiple named high-score entries
- Animated background parallax layers
- Boss enemy wave at Wave 5
- Sound effects library with recorded audio assets

---

## 🎨 Asset Credits

- Sprite assets from [Kenney.nl — Space Shooter Redux](https://kenney.nl/assets/space-shooter-redux) (CC0 1.0 Universal — Public Domain)
- Background tile from the same Kenney.nl pack
