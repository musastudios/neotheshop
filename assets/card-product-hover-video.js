class CardProductHoverVideo {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      const cardProducts = document.querySelectorAll('.card-wrapper');

      cardProducts.forEach((card) => {
        const videoContainer = card.querySelector('.card-product__hover-video-container');
        if (!videoContainer) return;

        const video = videoContainer.querySelector('video');
        if (!video) return;

        // Load video when card is hovered
        card.addEventListener('mouseenter', () => {
          if (video.preload === 'none') {
            video.preload = 'auto';
          }

          // Start playing only if it's not already playing
          if (video.paused) {
            video.play().catch((error) => {
              console.error('Error playing video:', error);
            });
          }
        });

        // Pause video when mouse leaves
        card.addEventListener('mouseleave', () => {
          if (!video.paused) {
            video.pause();
            // Reset video to beginning for next hover
            video.currentTime = 0;
          }
        });
      });
    });
  }
}

// Initialize the hover video functionality
new CardProductHoverVideo();
