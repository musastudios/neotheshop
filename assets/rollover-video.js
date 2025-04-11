class RolloverVideo extends HTMLElement {
  connectedCallback() {
    this.video = this.querySelector('video');

    if (this.video) {
      this.video.muted = true;

      const cardWrapper = this.closest('.card-wrapper');

      cardWrapper.addEventListener('mouseenter', () => {
        if (this.video.paused) {
          this.video.play();
        }
      });

      cardWrapper.addEventListener('mouseleave', () => {
        this.video.pause();
        this.video.currentTime = 0; // Reset video to start when mouse leaves
      });
    }
  }
}

customElements.define('rollover-video', RolloverVideo);
