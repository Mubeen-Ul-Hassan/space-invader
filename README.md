<img width="1920" height="1013" alt="Screenshot from 2026-08-01 22-46-57" src="https://github.com/user-attachments/assets/8834d14e-3879-4d70-a250-eda9d19f46a8" />


# Space Invader (Phaser 3 Game)

This is a simple 2D space shooter game. It is made with Phaser 3 for a technical assessment. The whole game is built into one HTML file, so it is easy to run and share.

## What is this game about

You control a spaceship at the bottom of the screen. Enemies (meteors and enemy ships) come down from the top. You move your ship and shoot lasers to destroy them.

- Survive 5 waves of enemies, then beat a boss ship to win the game.
- If you lose all your lives, it is game over.
- You start with 3 lives. You can find power-ups that give more lives, faster shooting, or a shield.

<img width="1920" height="1013" alt="Screenshot from 2026-08-01 23-12-11" src="https://github.com/user-attachments/assets/ab0d6c0e-6d26-43c1-b4e1-c4a2420adf62" />

### Boss Fight

<img width="1920" height="1021" alt="Screenshot from 2026-08-02 10-33-35" src="https://github.com/user-attachments/assets/96472906-aab8-4065-b473-1b790d2bba26" />

## Controls

| Key / Action | What it does |
|---|---|
| Arrow keys or WASD | Move the ship |
| Space | Shoot laser |
| Touch and drag (mobile) | Move the ship |
| Click and drag (mouse) | Move the ship |

The game shows these controls on screen, so new players know what to do.

## How the project is built

- The game logic is written in normal JavaScript files inside the `src` folder (scenes, entities, managers, etc).
- All images are turned into base64 text and saved in `src/assets`, so the game does not need to load outside image files.
- A build script (`build.js`) puts everything together (Phaser library, game code, and assets) into one file: `index.html`.
- This final `index.html` file is small (about 3 MB), so it is under the 5 MB limit.
- Sound effects are made using the Web Audio API in code, not separate sound files. This keeps the file size small.

## How to run this project on your computer

### What you need first

- Node.js (version 16 or newer)
- npm (comes with Node.js)

### Steps

1. Clone this repository:
```bash
git clone <repository-url>
cd space-invader
```

2. Install the packages:
```bash
npm install
```

3. Build the game (this creates the final `index.html` file):
```bash
npm run build
```

4. Start a local server to play the game:
```bash
npm start
```

5. Open your browser and go to:
```
http://localhost:8080
```

You can also just open the built `index.html` file directly in a browser, since everything is inside that one file.

## Assumptions and trade-offs

- I put everything (code, images, and Phaser) into one HTML file. This makes the file a bit bigger than normal, but it makes the game very easy to share and run anywhere, which is needed for ad networks like AppLovin.
- I used code-generated sound effects instead of real audio files. This keeps the file size small, but the sounds are simple, not real recordings.
- I made a wave-based enemy system (5 waves) instead of the old classic grid of enemies. This makes the game feel more alive, but it is a bit different from the very old, original Space Invaders style.
- New players get about 40 seconds before enemy ships start shooting. This gives them time to learn the controls first.

## Improvements (if I had more time)

- **Game mechanics** – Add better physics to the game world (for example, more realistic movement, gravity-like effects, or collision responses) so the gameplay feels more real and fun.
- **Story line** – Add a simple story or theme to the game, like a short intro, mission goals, or small cutscenes between waves, so players feel more connected to the game.
- **Sound effects** – Use better, more impressive sound effects (or real recorded sounds) instead of simple code-generated ones, to make the game feel more exciting.
- Other ideas: more types of power-ups, more boss ships with different attacks, and a leaderboard to save top scores from different players.

## Assets used

All images used in this game are free and open for anyone to use. They come from the **Kenney.nl – Space Shooter Redux** pack (CC0 license, which means public domain / free to use). No paid or copyrighted assets were used.
