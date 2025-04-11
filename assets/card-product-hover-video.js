class CardProductHoverVideo {
  constructor() {
    // Wait for DOM to be ready before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    // Wait a short time to let the page finish rendering
    setTimeout(() => {
      // Find all videos
      this.videos = document.querySelectorAll('.card-product__hover-video');
      if (!this.videos.length) {
        console.log('No hover videos found on page');
        return;
      }

      // Configure videos for autoplay
      this.configureVideos();

      // Add event listeners for hover
      this.addHoverListeners();

      console.log('Hover video functionality initialized with ' + this.videos.length + ' videos');
    }, 100);
  }

  configureVideos() {
    this.videos.forEach((video) => {
      // Set essential attributes
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';

      // Add a custom attribute to mark this as a hover video
      video.setAttribute('data-hover-video', 'true');

      // Force load the video
      try {
        video.load();

        // Create a backup source if needed
        if (!video.src && video.querySelector('source')) {
          video.src = video.querySelector('source').src;
        }

        // Set up simple hover logic directly on the video element as a backup
        const card = video.closest('.card-wrapper');
        if (card) {
          video.dataset.ready = 'true';
        }
      } catch (e) {
        console.error('Error configuring video:', e);
      }
    });
  }

  addHoverListeners() {
    // Find all product cards
    const cards = document.querySelectorAll('.card-wrapper');
    console.log('Found ' + cards.length + ' product cards');

    cards.forEach((card) => {
      const videoContainer = card.querySelector('.card-product__hover-video-container');
      if (!videoContainer) return;

      const video = videoContainer.querySelector('video');
      if (!video) return;

      console.log(
        'Setting up hover for video in product: ' + (card.querySelector('.card__heading a')?.textContent || 'Unknown')
      );

      // Use direct style manipulation for immediate visibility
      videoContainer.style.transition = 'opacity 0.2s ease-in-out';
      video.style.transition = 'opacity 0.2s ease-in-out';

      // Mouse enter - play video
      card.addEventListener('mouseenter', () => {
        videoContainer.style.opacity = '1';
        video.style.opacity = '1';
        video.style.visibility = 'visible';

        this.forcePlay(video);
      });

      // Mouse leave - pause video
      card.addEventListener('mouseleave', () => {
        videoContainer.style.opacity = '0';
        video.style.opacity = '0';
        video.style.visibility = 'hidden';

        try {
          video.pause();
          video.currentTime = 0;
        } catch (e) {
          console.error('Error pausing video:', e);
        }
      });
    });

    // Add global mousemove handler as a fallback
    document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
  }

  handleGlobalMouseMove(event) {
    // This is a fallback method to check if we're hovering over a card
    // and make sure the video is playing
    const cards = document.querySelectorAll('.card-wrapper');

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();

      // Check if mouse is over this card
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        const video = card.querySelector('.card-product__hover-video');
        if (video && video.paused) {
          this.forcePlay(video);
        }
      }
    });
  }

  forcePlay(video) {
    if (!video) return;

    try {
      // First, make sure the video is configured properly
      video.muted = true; // Must be muted for autoplay to work
      video.playsInline = true;

      // If the video never loaded or failed to load, try again
      if (video.readyState === 0) {
        console.log('Video not loaded, attempting to load');
        video.load();
      }

      // Try to play with multiple fallbacks
      const playAttempt = video.play();

      if (playAttempt !== undefined) {
        playAttempt.catch((error) => {
          console.warn('Video play failed:', error);

          // Try a different approach - remove and reattach the video
          setTimeout(() => {
            try {
              // Force a reload by cloning and replacing
              const parent = video.parentNode;
              if (parent) {
                const clone = video.cloneNode(true);
                clone.muted = true;
                clone.playsInline = true;
                clone.loop = true;
                parent.replaceChild(clone, video);
                clone.play().catch((e) => console.error('Clone play failed:', e));
              }
            } catch (e) {
              console.error('Video clone fallback failed:', e);
            }
          }, 10);
        });
      }
    } catch (error) {
      console.error('Force play error:', error);
    }
  }
}

// Create and initialize the hover video functionality
try {
  // Initialize on DOMContentLoaded first for faster response
  document.addEventListener('DOMContentLoaded', () => {
    window.hoverVideoHandler = new CardProductHoverVideo();
  });

  // Also initialize on load as a backup
  window.addEventListener('load', () => {
    if (!window.hoverVideoHandler) {
      window.hoverVideoHandler = new CardProductHoverVideo();
    }
  });
} catch (e) {
  console.error('Error setting up hover video:', e);
}
