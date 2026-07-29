// Procedural Web Audio API sound effect manager for browser playback
class AudioManager {
  // Initialize web audio context on first user interaction
  constructor() {
    this.ctx = null; // Lazy instantiation of AudioContext
  }

  // Ensure AudioContext is instantiated and resumed on gesture
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext; // Fallback support for WebKit browsers
      if (AudioCtx) {
        this.ctx = new AudioCtx(); // Create native AudioContext instance
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume(); // Resume audio context if browser suspended auto-play
    }
  }

  // Play laser shoot synth sound effect
  playShoot() {
    this.init(); // Guarantee audio context is active
    if (!this.ctx) return; // Guard clause if AudioContext is unavailable

    const osc = this.ctx.createOscillator(); // Create frequency oscillator node
    const gain = this.ctx.createGain(); // Create volume control gain node

    osc.type = 'square'; // Use retro square wave tone
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // Start at high pitch A5 note
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1); // Quick sweep down to low pitch

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime); // Set moderate initial volume
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1); // Rapid fade out sound

    osc.connect(gain); // Connect oscillator to gain node
    gain.connect(this.ctx.destination); // Connect gain node to speaker output

    osc.start(); // Start sound generation
    osc.stop(this.ctx.currentTime + 0.1); // Stop playback after 100 milliseconds
  }

  // Play explosion synth sound effect
  playExplosion() {
    this.init(); // Guarantee audio context is active
    if (!this.ctx) return; // Guard clause if AudioContext is unavailable

    const bufferSize = this.ctx.sampleRate * 0.25; // Generate 250 milliseconds white noise buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate); // Create audio memory buffer
    const output = buffer.getChannelData(0); // Fetch channel PCM data array

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // Fill buffer with random noise values
    }

    const whiteNoise = this.ctx.createBufferSource(); // Create buffer audio source node
    whiteNoise.buffer = buffer; // Assign generated noise buffer

    const filter = this.ctx.createBiquadFilter(); // Create low-pass audio filter
    filter.type = 'lowpass'; // Filter out harsh high frequencies
    filter.frequency.setValueAtTime(800, this.ctx.currentTime); // Lowpass cutoff frequency
    filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.25); // Sweep frequency down for rumble

    const gain = this.ctx.createGain(); // Create gain node for volume control
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime); // Set explosion initial volume
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25); // Fade volume down to silence

    whiteNoise.connect(filter); // Connect noise source to filter
    filter.connect(gain); // Connect filter output to volume gain node
    gain.connect(this.ctx.destination); // Connect gain node to speaker output

    whiteNoise.start(); // Play noise blast
    whiteNoise.stop(this.ctx.currentTime + 0.25); // Stop noise blast after duration
  }

  // Play player hit sound effect
  playHit() {
    this.init(); // Guarantee audio context is active
    if (!this.ctx) return; // Guard clause if AudioContext is unavailable

    const osc = this.ctx.createOscillator(); // Create frequency oscillator node
    const gain = this.ctx.createGain(); // Create volume gain node

    osc.type = 'sawtooth'; // Harsh sawtooth wave for damage alert
    osc.frequency.setValueAtTime(300, this.ctx.currentTime); // Set low frequency pitch
    osc.frequency.setValueAtTime(150, this.ctx.currentTime + 0.08); // Drop frequency lower mid-impact

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Set initial volume level
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15); // Fade volume out

    osc.connect(gain); // Connect oscillator to gain node
    gain.connect(this.ctx.destination); // Connect gain node to speakers

    osc.start(); // Start sound playback
    osc.stop(this.ctx.currentTime + 0.15); // Stop playback after 150ms
  }

  // Play victory jingle synth sound effect
  playWin() {
    this.init(); // Guarantee audio context is active
    if (!this.ctx) return; // Guard clause if AudioContext is unavailable

    const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio musical notes (C5, E5, G5, C6)
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator(); // Create note oscillator
      const gain = this.ctx.createGain(); // Create note gain node

      osc.type = 'triangle'; // Smooth triangle wave note tone
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1); // Delay note playback in sequence

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1); // Set note volume
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.2); // Fade note sound out

      osc.connect(gain); // Connect note oscillator to gain node
      gain.connect(this.ctx.destination); // Connect gain node to speakers

      osc.start(this.ctx.currentTime + idx * 0.1); // Start note playing at scheduled offset
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.2); // Stop note playing after 200ms
    });
  }

  // Play game over jingle synth sound effect
  playGameOver() {
    this.init(); // Guarantee audio context is active
    if (!this.ctx) return; // Guard clause if AudioContext is unavailable

    const notes = [400, 350, 300, 250]; // Descending pitch notes for game over
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator(); // Create note oscillator
      const gain = this.ctx.createGain(); // Create note gain node

      osc.type = 'sawtooth'; // Sad tone generator
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12); // Schedule descending pitch sequence

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12); // Set note initial volume
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.2); // Fade volume out

      osc.connect(gain); // Connect oscillator to gain node
      gain.connect(this.ctx.destination); // Connect gain to audio destination

      osc.start(this.ctx.currentTime + idx * 0.12); // Start note at scheduled offset
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.2); // Stop note sound after 200ms
    });
  }
}
