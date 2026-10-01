/**
 * PARTICLES.JS - Sistema Sutil e Nobre de Pétalas e Brilhos Dourados
 * Produz uma atmosfera romântica e elegante com partículas suaves em Canvas 2D.
 */

class RomanticParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.maxParticles = window.innerWidth < 768 ? 24 : 45;
    this.animationFrame = null;
    this.isRunning = true;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Cria partículas iniciais distribuídas
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    this.animate();

    // Pausar animação quando a aba perder o foco para economizar bateria
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.maxParticles = window.innerWidth < 768 ? 20 : 42;
  }

  createParticle(randomY = false) {
    // Tipos de partículas: pétalas de rosa chá (70%), brilhos dourados sutis (20%), micro-coração translúcido (10%)
    const rand = Math.random();
    let type = "petal";
    if (rand > 0.88) type = "heart";
    else if (rand > 0.68) type = "sparkle";

    const size = type === "sparkle" ? Math.random() * 2.5 + 1.2 : Math.random() * 8 + 6;

    return {
      type,
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -20,
      size,
      speedY: Math.random() * 0.55 + 0.35,
      speedX: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      opacity: Math.random() * 0.55 + 0.25,
      pulse: Math.random() * Math.PI,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01
    };
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    this.ctx.globalAlpha = p.opacity;

    // Gradiente nobre de pétala (ouro suave, marfim e champagne real)
    const gradient = this.ctx.createRadialGradient(0, 0, 1, 0, 0, p.size);
    gradient.addColorStop(0, "rgba(255, 250, 235, 0.95)");
    gradient.addColorStop(0.5, "rgba(245, 224, 168, 0.75)");
    gradient.addColorStop(1, "rgba(212, 175, 55, 0.35)");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -p.size);
    this.ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.7, p.size * 0.8, 0, p.size);
    this.ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.8, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawSparkle(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    const dynamicOpacity = Math.abs(Math.sin(p.pulse)) * p.opacity;
    this.ctx.globalAlpha = dynamicOpacity;
    this.ctx.fillStyle = "#F3D37A"; // Ouro brilhante reluzente

    // Pequena estrela dourada de 4 pontas
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(-p.size * 2, 0);
    this.ctx.lineTo(p.size * 2, 0);
    this.ctx.moveTo(0, -p.size * 2);
    this.ctx.lineTo(0, p.size * 2);
    this.ctx.strokeStyle = "rgba(243, 211, 122, 0.75)";
    this.ctx.lineWidth = 0.9;
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawHeart(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation * 0.4);
    this.ctx.globalAlpha = p.opacity * 0.5;
    this.ctx.fillStyle = "#D4AF37"; // Dourado real para os corações

    const s = p.size * 0.55;
    this.ctx.beginPath();
    this.ctx.moveTo(0, s * 0.3);
    this.ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.5, 0, s * 1.5);
    this.ctx.bezierCurveTo(s * 1.5, s * 0.5, s, -s * 0.5, 0, s * 0.3);
    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.wobble += p.wobbleSpeed;
      p.pulse += 0.03;
      p.rotation += p.rotationSpeed;
      p.y += p.speedY;
      p.x += Math.sin(p.wobble) * 0.45 + p.speedX;

      if (p.type === "petal") {
        this.drawPetal(p);
      } else if (p.type === "sparkle") {
        this.drawSparkle(p);
      } else if (p.type === "heart") {
        this.drawHeart(p);
      }

      // Reinicia ao sair da tela
      if (p.y > this.height + 25 || p.x < -30 || p.x > this.width + 30) {
        this.particles[i] = this.createParticle(false);
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  pause() {
    this.isRunning = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  toggle() {
    if (this.isRunning) this.pause();
    else this.resume();
    return this.isRunning;
  }
}
