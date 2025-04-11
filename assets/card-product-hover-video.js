class CardProductHoverVideo {
  constructor() {
    // Create fallback storage if needed
    this.setupStorageFallbacks();

    // Wait for DOM to be ready before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  setupStorageFallbacks() {
    // Create fallbacks for sessionStorage and localStorage
    try {
      // Test access
      window.sessionStorage.getItem('test');
      window.localStorage.getItem('test');
    } catch (e) {
      // Create polyfills if access is restricted
      this.createStoragePolyfill();
    }
  }

  createStoragePolyfill() {
    // Memory storage fallbacks
    const memoryStorage = {
      _data: {},
      setItem: function (id, val) {
        this._data[id] = String(val);
      },
      getItem: function (id) {
        return this._data[id] || null;
      },
      removeItem: function (id) {
        delete this._data[id];
      },
      clear: function () {
        this._data = {};
      },
    };

    // Only override if the real storage is inaccessible
    try {
      window.localStorage.getItem('test');
    } catch (e) {
      Object.defineProperty(window, 'localStorage', { value: memoryStorage });
    }

    try {
      window.sessionStorage.getItem('test');
    } catch (e) {
      Object.defineProperty(window, 'sessionStorage', { value: memoryStorage });
    }
  }

  init() {
    // Find all videos
    this.videos = document.querySelectorAll('.card-product__hover-video');
    if (!this.videos.length) {
      console.log('No hover videos found on page');
      return;
    }

    // Load all video metadata but don't autoplay yet
    this.preloadVideos();

    // Add event listeners for hover
    this.addHoverListeners();

    console.log('Hover video functionality initialized');
  }

  preloadVideos() {
    this.videos.forEach((video) => {
      // Set essential attributes
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';

      // Load metadata
      try {
        video.load();
      } catch (e) {
        console.error('Error loading video:', e);
      }
    });
  }

  addHoverListeners() {
    // Find all product cards
    const cards = document.querySelectorAll('.card-wrapper');

    cards.forEach((card) => {
      const videoContainer = card.querySelector('.card-product__hover-video-container');
      if (!videoContainer) return;

      const video = videoContainer.querySelector('video');
      if (!video) return;

      // Add visibility observer to preload when card becomes visible
      this.observeVisibility(card, video);

      // Mouse enter - play video
      card.addEventListener('mouseenter', () => this.playVideo(video));

      // Mouse leave - pause video
      card.addEventListener('mouseleave', () => this.pauseVideo(video));

      // Touch devices - handle taps (first tap loads, second tap plays)
      if ('ontouchstart' in window) {
        let touched = false;
        card.addEventListener('touchstart', (e) => {
          if (!touched) {
            // First touch - prepare video
            touched = true;
            this.prepareVideo(video);
            setTimeout(() => {
              touched = false;
            }, 300);
          } else {
            // Second touch - play
            this.playVideo(video);
          }
        });
      }
    });
  }

  observeVisibility(card, video) {
    // Use Intersection Observer to detect when a card is visible
    if ('IntersectionObserver' in window) {
      try {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Preload video when card becomes visible
                this.prepareVideo(video);
                observer.unobserve(card); // Stop observing once we've preloaded
              }
            });
          },
          { threshold: 0.1 }
        ); // 10% visibility is enough to start preloading

        observer.observe(card);
      } catch (e) {
        // Fallback if IntersectionObserver fails
        this.prepareVideo(video); // Just preload immediately
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      this.prepareVideo(video);
    }
  }

  prepareVideo(video) {
    if (!video.hasAttribute('data-loaded')) {
      try {
        video.load();
        video.setAttribute('data-loaded', 'true');
      } catch (e) {
        console.error('Error preparing video:', e);
      }
    }
  }

  playVideo(video) {
    if (!video) return;

    try {
      // Ensure video is visible
      const container = video.closest('.card-product__hover-video-container');
      if (container) {
        container.style.opacity = '1';
      }

      video.style.opacity = '1';
      video.style.visibility = 'visible';

      // Play the video with error handling
      if (video.paused) {
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Initial play attempt failed:', error.message);

            // Retry with user interaction simulation
            setTimeout(() => {
              video.muted = true; // Ensure muted (autoplay policy)
              try {
                video.play().catch((e) => console.error('Retry play failed:', e.message));
              } catch (e) {
                console.error('Exception during retry play:', e);
              }
            }, 50);
          });
        }
      }
    } catch (error) {
      console.error('Error during video play:', error);
    }
  }

  pauseVideo(video) {
    if (!video) return;

    try {
      // Hide the video
      const container = video.closest('.card-product__hover-video-container');
      if (container) {
        container.style.opacity = '0';
      }

      video.style.opacity = '0';
      video.style.visibility = 'hidden';

      // Pause and reset the video
      if (!video.paused) {
        try {
          video.pause();
        } catch (e) {
          console.error('Error pausing video:', e);
        }
      }

      try {
        video.currentTime = 0;
      } catch (e) {
        console.error('Error resetting video time:', e);
      }
    } catch (error) {
      console.error('Error during video pause:', error);
    }
  }
}

// Safely initialize on window load for best performance
try {
  window.addEventListener('load', () => {
    try {
      new CardProductHoverVideo();
      console.log('CardProductHoverVideo loaded');
    } catch (e) {
      console.error('Error initializing CardProductHoverVideo:', e);
    }
  });
} catch (e) {
  // Last resort - initialize immediately
  try {
    new CardProductHoverVideo();
  } catch (e) {
    console.error('Failed to initialize CardProductHoverVideo:', e);
  }
}
