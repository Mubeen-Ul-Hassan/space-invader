// Procedural Web Audio API sound effect manager for browser playback with Master Volume control and BGM support
class AudioManager {
  // Shared static state across all AudioManager instances
  static ctx = null;
  static masterGain = null;
  static volume = 0.8;
  static bgmBuffer = null;
  static bgmSource = null;
  static bgmPlaying = false;

  constructor() {}

  // Ensure AudioContext and masterGain are instantiated and resumed on gesture
  init() {
    if (!AudioManager.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext; // Fallback support for WebKit browsers
      if (AudioCtx) {
        AudioManager.ctx = new AudioCtx(); // Create native AudioContext instance
        AudioManager.masterGain = AudioManager.ctx.createGain(); // Create master volume gain node
        AudioManager.masterGain.gain.setValueAtTime(AudioManager.volume, AudioManager.ctx.currentTime);
        AudioManager.masterGain.connect(AudioManager.ctx.destination);
      }
    }
    if (AudioManager.ctx && AudioManager.ctx.state === 'suspended') {
      AudioManager.ctx.resume(); // Resume audio context if browser suspended auto-play
    }
  }

  // Set global audio master volume (0.0 to 1.0)
  setVolume(volume) {
    AudioManager.volume = Phaser.Math.Clamp(volume, 0, 1);
    this.init();
    if (AudioManager.masterGain && AudioManager.ctx) {
      AudioManager.masterGain.gain.setValueAtTime(AudioManager.volume, AudioManager.ctx.currentTime);
    }
  }

  // Get current global audio master volume
  getVolume() {
    return AudioManager.volume;
  }

  // Helper destination routing to master gain node
  getDestination() {
    this.init();
    return AudioManager.masterGain || (AudioManager.ctx ? AudioManager.ctx.destination : null);
  }

  // Decode BGM base64 string into AudioBuffer
  async initBgm() {
    if (AudioManager.bgmBuffer || !AudioManager.ctx) return;
    try {
      const base64Data = BASE64_ASSETS.bgm;
      if (!base64Data) return;
      const response = await fetch(base64Data);
      const arrayBuffer = await response.arrayBuffer();
      AudioManager.bgmBuffer = await AudioManager.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error('Failed to load/decode BGM:', e);
    }
  }

  // Start looping background music
  playBgm() {
    this.init();
    if (AudioManager.bgmPlaying) return;

    if (!AudioManager.bgmBuffer) {
      this.initBgm().then(() => {
        this._startBgmSource();
      });
    } else {
      this._startBgmSource();
    }
  }

  _startBgmSource() {
    if (!AudioManager.bgmBuffer || !AudioManager.ctx || AudioManager.bgmPlaying) return;

    AudioManager.bgmSource = AudioManager.ctx.createBufferSource();
    AudioManager.bgmSource.buffer = AudioManager.bgmBuffer;
    AudioManager.bgmSource.loop = true;

    const dest = this.getDestination();
    if (dest) AudioManager.bgmSource.connect(dest);

    AudioManager.bgmSource.start(0);
    AudioManager.bgmPlaying = true;
  }

  // Stop looping background music
  stopBgm() {
    if (AudioManager.bgmSource && AudioManager.bgmPlaying) {
      try {
        AudioManager.bgmSource.stop();
      } catch (e) {}
      AudioManager.bgmSource = null;
      AudioManager.bgmPlaying = false;
    }
  }

  // Play laser shoot synth sound effect
  playShoot() {
    this.init(); // Guarantee audio context is active
    if (!AudioManager.ctx) return; // Guard clause if AudioContext is unavailable

    const osc = AudioManager.ctx.createOscillator(); // Create frequency oscillator node
    const gain = AudioManager.ctx.createGain(); // Create volume control gain node

    osc.type = 'square'; // Use retro square wave tone
    osc.frequency.setValueAtTime(880, AudioManager.ctx.currentTime); // Start at high pitch A5 note
    osc.frequency.exponentialRampToValueAtTime(110, AudioManager.ctx.currentTime + 0.1); // Quick sweep down to low pitch

    gain.gain.setValueAtTime(0.15, AudioManager.ctx.currentTime); // Set moderate initial volume
    gain.gain.linearRampToValueAtTime(0.01, AudioManager.ctx.currentTime + 0.1); // Rapid fade out sound

    osc.connect(gain); // Connect oscillator to gain node
    const dest = this.getDestination();
    if (dest) gain.connect(dest); // Connect gain node to master volume output

    osc.start(); // Start sound generation
    osc.stop(AudioManager.ctx.currentTime + 0.1); // Stop playback after 100 milliseconds
  }

  // Play explosion synth sound effect
  playExplosion() {
    this.init(); // Guarantee audio context is active
    if (!AudioManager.ctx) return; // Guard clause if AudioContext is unavailable

    const bufferSize = AudioManager.ctx.sampleRate * 0.25; // Generate 250 milliseconds white noise buffer
    const buffer = AudioManager.ctx.createBuffer(1, bufferSize, AudioManager.ctx.sampleRate); // Create audio memory buffer
    const output = buffer.getChannelData(0); // Fetch channel PCM data array

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // Fill buffer with random noise values
    }

    const whiteNoise = AudioManager.ctx.createBufferSource(); // Create buffer audio source node
    whiteNoise.buffer = buffer; // Assign generated noise buffer

    const filter = AudioManager.ctx.createBiquadFilter(); // Create low-pass audio filter
    filter.type = 'lowpass'; // Filter out harsh high frequencies
    filter.frequency.setValueAtTime(800, AudioManager.ctx.currentTime); // Lowpass cutoff frequency
    filter.frequency.linearRampToValueAtTime(50, AudioManager.ctx.currentTime + 0.25); // Sweep frequency down for rumble

    const gain = AudioManager.ctx.createGain(); // Create gain node for volume control
    gain.gain.setValueAtTime(0.3, AudioManager.ctx.currentTime); // Set explosion initial volume
    gain.gain.linearRampToValueAtTime(0.01, AudioManager.ctx.currentTime + 0.25); // Fade volume down to silence

    whiteNoise.connect(filter); // Connect noise source to filter
    filter.connect(gain); // Connect filter output to volume gain node
    const dest = this.getDestination();
    if (dest) gain.connect(dest); // Connect gain node to master volume output

    whiteNoise.start(); // Play noise blast
    whiteNoise.stop(AudioManager.ctx.currentTime + 0.25); // Stop noise blast after duration
  }

  // Play player hit sound effect
  playHit() {
    this.init(); // Guarantee audio context is active
    if (!AudioManager.ctx) return; // Guard clause if AudioContext is unavailable

    const osc = AudioManager.ctx.createOscillator(); // Create frequency oscillator node
    const gain = AudioManager.ctx.createGain(); // Create volume gain node

    osc.type = 'sawtooth'; // Harsh sawtooth wave for damage alert
    osc.frequency.setValueAtTime(300, AudioManager.ctx.currentTime); // Set low frequency pitch
    osc.frequency.setValueAtTime(150, AudioManager.ctx.currentTime + 0.08); // Drop frequency lower mid-impact

    gain.gain.setValueAtTime(0.2, AudioManager.ctx.currentTime); // Set initial volume level
    gain.gain.linearRampToValueAtTime(0.01, AudioManager.ctx.currentTime + 0.15); // Fade volume out

    osc.connect(gain); // Connect oscillator to gain node
    const dest = this.getDestination();
    if (dest) gain.connect(dest); // Connect gain node to master volume output

    osc.start(); // Start sound playback
    osc.stop(AudioManager.ctx.currentTime + 0.15); // Stop playback after 150ms
  }

  // Play victory jingle synth sound effect
  playWin() {
    this.init(); // Guarantee audio context is active
    if (!AudioManager.ctx) return; // Guard clause if AudioContext is unavailable

    const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio musical notes (C5, E5, G5, C6)
    notes.forEach((freq, idx) => {
      const osc = AudioManager.ctx.createOscillator(); // Create note oscillator
      const gain = AudioManager.ctx.createGain(); // Create note gain node

      osc.type = 'triangle'; // Smooth triangle wave note tone
      osc.frequency.setValueAtTime(freq, AudioManager.ctx.currentTime + idx * 0.1); // Delay note playback in sequence

      gain.gain.setValueAtTime(0.2, AudioManager.ctx.currentTime + idx * 0.1); // Set note volume
      gain.gain.linearRampToValueAtTime(0.01, AudioManager.ctx.currentTime + idx * 0.1 + 0.2); // Fade note sound out

      osc.connect(gain); // Connect note oscillator to gain node
      const dest = this.getDestination();
      if (dest) gain.connect(dest); // Connect gain node to master volume output

      osc.start(AudioManager.ctx.currentTime + idx * 0.1); // Start note playing at scheduled offset
      osc.stop(AudioManager.ctx.currentTime + idx * 0.1 + 0.2); // Stop note playing after 200ms
    });
  }

  // Play game over jingle synth sound effect
  playGameOver() {
    this.init(); // Guarantee audio context is active
    if (!AudioManager.ctx) return; // Guard clause if AudioContext is unavailable

    const notes = [400, 350, 300, 250]; // Descending pitch notes for game over
    notes.forEach((freq, idx) => {
      const osc = AudioManager.ctx.createOscillator(); // Create note oscillator
      const gain = AudioManager.ctx.createGain(); // Create note gain node

      osc.type = 'sawtooth'; // Sad tone generator
      osc.frequency.setValueAtTime(freq, AudioManager.ctx.currentTime + idx * 0.12); // Schedule descending pitch sequence

      gain.gain.setValueAtTime(0.2, AudioManager.ctx.currentTime + idx * 0.12); // Set note initial volume

      gain.gain.linearRampToValueAtTime(0.01, AudioManager.ctx.currentTime + idx * 0.12 + 0.2); // Fade volume out

      osc.connect(gain); // Connect oscillator to gain node
      const dest = this.getDestination();
      if (dest) gain.connect(dest); // Connect gain node to master volume output

      osc.start(AudioManager.ctx.currentTime + idx * 0.12); // Start note at scheduled offset
      osc.stop(AudioManager.ctx.currentTime + idx * 0.12 + 0.2); // Stop note sound after 200ms
    });
  }

  // Play cheat code confirmation triple ascending beep
  playCheatBeep() {
    this.init();
    if (!AudioManager.ctx) return;

    const beepFreqs = [440, 660, 880]; // Ascending three-tone confirmation beep sequence
    beepFreqs.forEach((freq, idx) => {
      const osc = AudioManager.ctx.createOscillator();
      const gain = AudioManager.ctx.createGain();

      osc.type = 'sine'; // Clean sine beep tone
      osc.frequency.setValueAtTime(freq, AudioManager.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.25, AudioManager.ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.001, AudioManager.ctx.currentTime + idx * 0.12 + 0.1);

      osc.connect(gain);
      const dest = this.getDestination();
      if (dest) gain.connect(dest);

      osc.start(AudioManager.ctx.currentTime + idx * 0.12);
      osc.stop(AudioManager.ctx.currentTime + idx * 0.12 + 0.1);
    });
  }
}
