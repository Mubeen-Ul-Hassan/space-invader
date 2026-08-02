// Minimal MRAID v2.0 & WebGL helper for AppLovin Playable Ads
const MRAIDHelper = {
  isInitialized: false,

  init(onReady) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Check if running inside MRAID environment (e.g. AppLovin SDK)
    if (typeof mraid !== 'undefined') {
      if (mraid.getState() === 'loading') {
        mraid.addEventListener('ready', () => {
          this.onMraidReady(onReady);
        });
      } else {
        this.onMraidReady(onReady);
      }
    } else {
      // Standard browser execution
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        onReady();
      } else {
        window.addEventListener('load', onReady);
      }
    }
  },

  onMraidReady(onReady) {
    // Listen to MRAID viewableChange event to handle pause/resume
    if (typeof mraid !== 'undefined' && mraid.addEventListener) {
      mraid.addEventListener('viewableChange', (viewable) => {
        if (window.game && window.game.scene) {
          if (viewable) {
            window.game.resume();
          } else {
            window.game.pause();
          }
        }
      });
    }
    onReady();
  },

  openCTA(url = 'https://apps.apple.com') {
    if (typeof mraid !== 'undefined' && mraid.open) {
      mraid.open(url);
    } else {
      window.open(url, '_blank');
    }
  }
};
