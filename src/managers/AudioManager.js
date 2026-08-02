// Procedural Web Audio sound effects with master volume control
class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.volume = 0.8;
  }

  // Create (or resume) the AudioContext on first user gesture
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(volume) {
    this.volume = Phaser.Math.Clamp(volume, 0, 1);
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  getDestination() {
    this.init();
    return this.masterGain || (this.ctx ? this.ctx.destination : null);
  }

  // Laser shoot sound
  playShoot() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    const dest = this.getDestination();
    if (dest) gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Explosion sound (filtered white noise)
  playExplosion() {
    this.init();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    whiteNoise.connect(filter);
    filter.connect(gain);
    const dest = this.getDestination();
    if (dest) gain.connect(dest);

    whiteNoise.start();
    whiteNoise.stop(this.ctx.currentTime + 0.25);
  }

  // Player hit sound
  playHit() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.setValueAtTime(150, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    const dest = this.getDestination();
    if (dest) gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Victory jingle (ascending arpeggio)
  playWin() {
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.2);

      osc.connect(gain);
      const dest = this.getDestination();
      if (dest) gain.connect(dest);

      osc.start(this.ctx.currentTime + idx * 0.1);
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.2);
    });
  }

  // Game over jingle (descending tones)
  playGameOver() {
    this.init();
    if (!this.ctx) return;

    const notes = [400, 350, 300, 250];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.2);

      osc.connect(gain);
      const dest = this.getDestination();
      if (dest) gain.connect(dest);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.2);
    });
  }

  // Cheat code confirmation beep (triple ascending tone)
  playCheatBeep() {
    this.init();
    if (!this.ctx) return;

    const beepFreqs = [440, 660, 880];
    beepFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.1);

      osc.connect(gain);
      const dest = this.getDestination();
      if (dest) gain.connect(dest);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.1);
    });
  }
}
