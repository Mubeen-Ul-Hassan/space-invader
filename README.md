<img width="1920" height="1013" alt="Screenshot from 2026-08-01 22-46-57" src="https://github.com/user-attachments/assets/8834d14e-3879-4d70-a250-eda9d19f46a8" />

# Space Invader

This is a 2D space shooter I built with Phaser 3 for a technical assessment. Everything (code, images, sound) is packed into one HTML file, so you can just open it and play, no server needed.

Live preview: https://space-invader-2d.netlify.app/

## The game

You fly a small ship at the bottom of the screen and shoot down whatever comes at you from the top, meteors and enemy ships mostly. There are 5 waves, each one a bit harder than the last, and after you clear all of them a boss ship shows up. Beat the boss and you win. Run out of lives before that and it's game over.

You start with 3 lives, but power-ups drop sometimes when you kill enemies. One gives you an extra life, one gives faster shooting for a while, and one gives a shield so you can't get hit for a bit.

<img width="1920" height="1013" alt="Screenshot from 2026-08-01 23-12-11" src="https://github.com/user-attachments/assets/ab0d6c0e-6d26-43c1-b4e1-c4a2420adf62" />

### Boss fight

<img width="1920" height="1021" alt="Screenshot from 2026-08-02 10-33-35" src="https://github.com/user-attachments/assets/96472906-aab8-4065-b473-1b790d2bba26" />

## Controls

- On desktop you move with the arrow keys or WASD and shoot with space. 
- On mobile you just drag your finger to move and tap to shoot. Mouse click-and-drag also works if you'd rather not use the keyboard. The game shows these controls on the main menu too, so no one has to guess.

## How it's built

The actual game code lives in the `src` folder, split into scenes, entities (player, enemies, bullets, etc.), and a couple of manager classes for waves and audio. Nothing fancy, just plain JavaScript classes that Phaser picks up.

For the final build, every image gets turned into a base64 string and dropped into `src/assets`, so the game never has to fetch an image file from disk. A small build script then glues the Phaser library, the game code, and those assets together into one `index.html`. That file comes out to a bit over 3 MB, so it's well inside the 5 MB limit this assessment asks for. Sound effects aren't audio files either, they're generated in code with the Web Audio API, which keeps things smaller.

## Running it yourself

You'll need Node.js (v16 or newer) and npm.

1. Clone the repo and go into the folder:
```bash
git clone <repository-url>
cd space-invader
```

2. Install dependencies:
```bash
npm install
```

3. Build the game (this regenerates `index.html`):
```bash
npm run build
```

4. Start a local server:
```bash
npm start
```

5. Then open `http://localhost:8080` in your browser.

You don't actually need steps 3-5 to just play it though. Since everything is bundled into `index.html`, you can double-click that file and it'll open straight in your browser.

## Assumptions and trade-offs

- **Single-file bundle**: Packed everything into a single HTML file with base64 assets. It makes the initial payload a bit heavier (~3 MB), but meets ad network requirements (e.g., AppLovin) for self-contained builds with no external asset requests.
- **Procedural audio**: Used Web Audio API synthesized sound effects instead of recorded audio files to keep the total build size minimal, even though it gives the game a retro synth feel rather than realistic sound design.
- **Dynamic wave system**: Moved away from the classic Space Invaders grid to a wave system with dynamic meteor and enemy spawn patterns for better engagement during longer sessions.
- **Beginner grace period**: Provided a ~40-second initial window before enemy ships start firing back, giving new players time to get comfortable with the controls.

## What I'd improve with more time

- **Physics & movement**: Add smoother inertia, vector-based movement, and refined collision dynamics to make ship movement and impacts feel less flat.
- **Visual feedback & damage effects**: Add visual damage states (smoke/sparks) when the player ship gets hit, along with floating score text animations when destroying enemies.
- **Story & context**: Introduce brief mission intros or narrative context between waves so players feel more invested in their progress.
- **Sound design**: Upgrade from synthesized effects to custom recorded audio for punchier explosions and weapon hits.
- **Gameplay depth**: Add more power-up varieties, multiple boss battle phases/variations, and an online leaderboard for competitive replayability.

## Assets

All art comes from Kenney.nl's Space Shooter Redux pack, which is CC0, meaning free to use for anything, no credit required. Nothing paid or copyrighted was used anywhere in this project.
