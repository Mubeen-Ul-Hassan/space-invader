// Splash screen displaying company branding 'wrp' and official website URL
class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    // Deep space gradient background card
    this.add.rectangle(cx, cy, W, H, 0x050515);

    // Subtle background glowing particle pulse
    const bgGlow = this.add.circle(cx, cy - 30, 160, 0x00ffcc, 0.12);
    this.tweens.add({
      targets: bgGlow,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 0.12, to: 0.22 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // "wrp" Main Company Logo Text
    const logoText = this.add.text(cx, cy - 60, 'wrp', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '84px',
      color: '#00ffcc',
      align: 'center'
    }).setOrigin(0.5);
    logoText.setStroke('#ffffff', 4);
    logoText.setShadow(0, 0, '#00ffcc', 20, true, true);

    // Subtitle "WE R PLAY"
    const subTitle = this.add.text(cx, cy + 20, 'WE R PLAY', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      letterSpacing: 6
    }).setOrigin(0.5);

    // Clickable Website URL
    const urlText = this.add.text(cx, cy + 70, 'https://www.werplay.com/', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffcc00',
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    urlText.on('pointerover', () => urlText.setStyle({ color: '#ffffff' }));
    urlText.on('pointerout', () => urlText.setStyle({ color: '#ffcc00' }));
    urlText.on('pointerdown', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      window.open('https://www.werplay.com/', '_blank');
    });

    // Tap to continue hint
    const tapHint = this.add.text(cx, H - 40, 'Tap anywhere to continue', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#8888aa'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: tapHint,
      alpha: { from: 0.4, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Auto transition to MainMenuScene after 2.8 seconds
    this.hasTransitioned = false;
    this.time.delayedCall(2800, () => this.gotoMainMenu());

    // Allow user to click anywhere to skip directly to Main Menu
    this.input.on('pointerdown', (pointer) => {
      // Small check so clicking directly on the URL text doesn't get blocked
      if (pointer.y > cy + 50 && pointer.y < cy + 90 && Math.abs(pointer.x - cx) < 150) {
        return;
      }
      this.gotoMainMenu();
    });
  }

  gotoMainMenu() {
    if (this.hasTransitioned) return;
    this.hasTransitioned = true;
    this.scene.start('MainMenuScene');
  }
}
