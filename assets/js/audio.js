/**
 * AUDIO.JS - Player de Música do Casal
 * Música: "Como É Grande O Meu Amor Por Você"
 * Suporta áudio MP3 local/externo e sintetizador acústico romântico como fallback.
 * Autoplay inteligente: inicia automaticamente ou na primeira interação/rolagem do visitante.
 */

class RomanticAudioPlayer {
  constructor() {
    this.isPlaying = false;
    this.audioElement = null;
    this.synthContext = null;
    this.synthInterval = null;
    this.currentTrackTitle = "Como É Grande O Meu Amor Por Você";
    this.userManuallyPaused = false;
    this.autoplayAttempted = false;

    // Progressão de acordes românticos baseada em "Como É Grande O Meu Amor Por Você" (Tom de Dó Maior)
    this.chords = [
      [261.63, 329.63, 392.00, 523.25], // C  (Eu tenho tanto...)
      [220.00, 261.63, 329.63, 440.00], // Am (pra lhe falar...)
      [146.83, 220.00, 261.63, 349.23], // Dm (Mas com palavras...)
      [196.00, 246.94, 293.66, 392.00], // G7 (não sei dizer...)
      [261.63, 329.63, 392.00, 523.25], // C
      [174.61, 220.00, 261.63, 349.23], // F  (Como é grande...)
      [196.00, 246.94, 293.66, 392.00], // G7 (o meu amor...)
      [261.63, 329.63, 392.00, 523.25]  // C  (por você...)
    ];
    this.chordIndex = 0;
  }

  init() {
    if (!this.audioElement) {
      const bgAudio = document.getElementById("wedding-bg-audio");
      if (bgAudio) {
        this.audioElement = bgAudio;
      } else {
        this.audioElement = new Audio("assets/audio/como-e-grande-o-meu-amor-por-voce.mp3");
        this.audioElement.loop = true;
      }

      this.audioElement.addEventListener("play", () => {
        this.isPlaying = true;
        this.updateUI(true);
      });

      this.audioElement.addEventListener("pause", () => {
        if (!this.synthInterval) {
          this.isPlaying = false;
          this.updateUI(false);
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
        console.warn("Falha ao tocar MP3, acionando sintetizador romântico:", err);
        this.startSynthRomantic();
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

    if (customUrl) {
      const currentSrc = this.audioElement.getAttribute("src") || this.audioElement.src || "";
      if (!currentSrc.includes(customUrl)) {
        this.audioElement.src = customUrl;
      }
      return this.audioElement.play().then(() => {
        this.isPlaying = true;
        this.userManuallyPaused = false;
        this.updateUI(true);
      }).catch(err => {
        console.warn("Autoplay bloqueado pelo navegador ou erro ao reproduzir:", err.name);
        throw err;
      });
    } else {
      this.startSynthRomantic();
      return Promise.resolve();
    }
  }

  pause() {
    this.isPlaying = false;
    this.userManuallyPaused = true;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynthRomantic();
    this.updateUI(false);
  }

  setupAutoplay() {
    if (this.autoplayAttempted) return;
    this.autoplayAttempted = true;

    const startOnInteraction = () => {
      if (!this.isPlaying && !this.userManuallyPaused) {
        this.play().then(() => {
          cleanup();
        }).catch(() => {
          // Continua aguardando interação válida que permita áudio (ex: clique ou toque)
        });
      } else {
        cleanup();
      }
    };

    const cleanup = () => {
      ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, startOnInteraction, { capture: true, passive: true });
        document.removeEventListener(evt, startOnInteraction, { capture: true, passive: true });
      });
    };

    // Tenta reprodução automática imediata
    this.play().then(() => {
      cleanup();
    }).catch(() => {
      // Bloqueado pelo navegador: inicia na primeira rolagem, clique ou toque do visitante
      ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        window.addEventListener(evt, startOnInteraction, { capture: true, passive: true, once: true });
        document.addEventListener(evt, startOnInteraction, { capture: true, passive: true, once: true });
      });
    });
  }

  startSynthRomantic() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.synthContext) {
        this.synthContext = new AudioCtx();
      }
      if (this.synthContext.state === "suspended") {
        this.synthContext.resume();
      }

      this.isPlaying = true;
      this.updateUI(true);

      this.chordIndex = 0;
      this.playRomanticArpeggio();

      if (this.synthInterval) clearInterval(this.synthInterval);
      this.synthInterval = setInterval(() => {
        if (!this.isPlaying) return;
        this.chordIndex = (this.chordIndex + 1) % this.chords.length;
        this.playRomanticArpeggio();
      }, 3400);

    } catch (e) {
      console.error("Web Audio API indisponível:", e);
      this.isPlaying = false;
      this.updateUI(false);
    }
  }

  playRomanticArpeggio() {
    if (!this.synthContext || this.synthContext.state !== "running") return;

    const currentNotes = this.chords[this.chordIndex];
    const now = this.synthContext.currentTime;

    // Arpejo suave de piano / cordas
    currentNotes.forEach((freq, idx) => {
      const noteDelay = idx * 0.45;
      this.playTonedNote(freq, now + noteDelay, 3.2);
    });

    // Baixo fundamental encorpado
    const bassFreq = currentNotes[0] / 2;
    this.playTonedNote(bassFreq, now, 3.4, 0.14, "sine");
  }

  playTonedNote(frequency, startTime, duration, maxVolume = 0.08, waveType = "triangle") {
    const osc = this.synthContext.createOscillator();
    const gainNode = this.synthContext.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(maxVolume, startTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(maxVolume * 0.45, startTime + 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    const filter = this.synthContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, startTime);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.synthContext.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  stopSynthRomantic() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
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

// Iniciar e preparar reprodução automática inteligente
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
}
