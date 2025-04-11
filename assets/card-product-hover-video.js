class CardProductHoverVideo {
  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Initialize videos immediately and set them up for playback
    this.setupVideos();

    // Setup event listeners for hovering
    this.setupEventListeners();
  }

  setupVideos() {
    const videos = document.querySelectorAll('.card-product__hover-video');

    videos.forEach((video) => {
      // Pre-load the video
      video.preload = 'auto';

      // Ensure video has the necessary attributes for autoplay
      video.muted = true;
      video.playsInline = true;
      video.loop = true;

      // Force load the video metadata
      video.load();
    });
  }

  setupEventListeners() {
    const cardProducts = document.querySelectorAll('.card-wrapper');

    cardProducts.forEach((card) => {
      const videoContainer = card.querySelector('.card-product__hover-video-container');
      if (!videoContainer) return;

      const video = videoContainer.querySelector('video');
      if (!video) return;

      // Load video when card is hovered
      card.addEventListener('mouseenter', () => {
        try {
          const playPromise = video.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error('Error playing video:', error);
              // Try again with user interaction simulation
              setTimeout(() => {
                video.play().catch((e) => console.error('Second attempt failed:', e));
              }, 100);
            });
          }
        } catch (error) {
          console.error('Exception when playing video:', error);
        }
      });

      // Pause video when mouse leaves
      card.addEventListener('mouseleave', () => {
        try {
          if (!video.paused) {
            video.pause();
          }
          // Reset video to beginning for next hover
          video.currentTime = 0;
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      });
    });
  }
}

// Wait for window to fully load before initializing
window.addEventListener('load', () => {
  new CardProductHoverVideo();
});
