/**
 * AUDIO.JS - Player de Música do Casal
 * Música: "Como É Grande O Meu Amor Por Você" - Roberto Carlos (Voz Cantada)
 * Autoplay inteligente: inicia automaticamente na abertura ou na primeira interação do visitante.
 */

class RomanticAudioPlayer {
  constructor() {
    this.isPlaying = false;
    this.audioElement = null;
    this.currentTrackTitle = "Como É Grande O Meu Amor Por Você";
    this.userManuallyPaused = false;
    this.autoplayAttempted = false;
  }

  init() {
    if (!this.audioElement) {
      const bgAudio = document.getElementById("wedding-bg-audio");
      if (bgAudio) {
        this.audioElement = bgAudio;
      } else {
        this.audioElement = new Audio("assets/audio/como-e-grande-o-meu-amor-por-voce.mp3");
      }

      this.audioElement.loop = true;
      this.audioElement.volume = 1.0;

      this.audioElement.addEventListener("play", () => {
        this.isPlaying = true;
        this.updateUI(true);
      });

      this.audioElement.addEventListener("playing", () => {
        this.isPlaying = true;
        this.updateUI(true);
      });

      this.audioElement.addEventListener("pause", () => {
        this.isPlaying = false;
        this.updateUI(false);
      });

      this.audioElement.addEventListener("ended", () => {
        if (!this.userManuallyPaused) {
          this.audioElement.currentTime = 0;
          this.audioElement.play().catch(() => {});
        }
      });
    }

    const settings = typeof WeddingStore !== "undefined" ? WeddingStore.getSettings() : null;
    if (settings && settings.musicTitle) {
      this.currentTrackTitle = settings.musicTitle;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.userManuallyPaused = false;
      this.play().catch(err => {
        console.warn("Interação necessária para reproduzir áudio:", err);
      });
    }
    return this.isPlaying;
  }

  play() {
    if (!this.audioElement) {
      this.init();
    }

    const settings = typeof WeddingStore !== "undefined" ? WeddingStore.getSettings() : null;
    let customUrl = (settings && settings.musicUrl) ? settings.musicUrl.trim() : "";
    if (!customUrl) {
      customUrl = "assets/audio/como-e-grande-o-meu-amor-por-voce.mp3";
    }

    const currentSrc = this.audioElement.getAttribute("src") || this.audioElement.src || "";
    if (!currentSrc.includes(customUrl)) {
      this.audioElement.src = customUrl;
    }

    return this.audioElement.play().then(() => {
      this.isPlaying = true;
      this.userManuallyPaused = false;
      this.updateUI(true);
    }).catch(err => {
      throw err;
    });
  }

  pause() {
    this.isPlaying = false;
    this.userManuallyPaused = true;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.updateUI(false);
  }

  setupAutoplay() {
    if (this.autoplayAttempted && this.isPlaying) return;
    this.autoplayAttempted = true;

    const events = ['click', 'pointerdown', 'touchstart', 'touchend', 'keydown', 'scroll'];

    const tryStartAudio = () => {
      if (this.isPlaying || this.userManuallyPaused) {
        cleanup();
        return;
      }
      this.play().then(() => {
        cleanup();
      }).catch(() => {
        // Se o navegador ainda requerer gesto direto, mantém os ouvintes ativos
      });
    };

    const cleanup = () => {
      events.forEach(evt => {
        window.removeEventListener(evt, tryStartAudio, { capture: true });
        document.removeEventListener(evt, tryStartAudio, { capture: true });
      });
    };

    // 1. Tenta iniciar imediatamente assim que a página é aberta
    this.play().then(() => {
      cleanup();
    }).catch(() => {
      // 2. Se bloqueado pela política de áudio do navegador, inicia no primeiríssimo gesto do visitante
      events.forEach(evt => {
        window.addEventListener(evt, tryStartAudio, { capture: true, passive: true });
        document.addEventListener(evt, tryStartAudio, { capture: true, passive: true });
      });
    });
  }

  updateUI(playing) {
    const playerWidget = document.getElementById("music-player-widget");
    const playIcon = document.getElementById("music-play-icon");
    const pauseIcon = document.getElementById("music-pause-icon");
    const eqBars = document.getElementById("music-eq-bars");

    if (playIcon && pauseIcon) {
      if (playing) {
        playIcon.classList.add("hidden");
        pauseIcon.classList.remove("hidden");
      } else {
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
      }
    }

    if (eqBars) {
      if (playing) {
        eqBars.classList.remove("paused");
      } else {
        eqBars.classList.add("paused");
      }
    }

    if (playerWidget) {
      if (playing) {
        playerWidget.classList.add("is-playing");
      } else {
        playerWidget.classList.remove("is-playing");
      }
    }
  }
}

const RomanticAudio = new RomanticAudioPlayer();

// Iniciar e tentar autoplay imediatamente ao carregar a página
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      RomanticAudio.init();
      RomanticAudio.setupAutoplay();
    });
  } else {
    RomanticAudio.init();
    RomanticAudio.setupAutoplay();
  }

  window.addEventListener("load", () => {
    RomanticAudio.init();
    RomanticAudio.setupAutoplay();
  });
}
