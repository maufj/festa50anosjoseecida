/**
 * APP.JS - Orquestrador Principal da Aplicação
 * Gerencia renderização das 13 seções, contagem regressiva, modais, Lightbox, PIX e eventos.
 */

// Notificação Toast Flutuante (desativada conforme solicitação do usuário)
function showToast(message, duration = 3500) {
  // Desativado: nenhuma notificação popup é exibida
  return;
}

// Microinteração: Criar coração flutuante
function triggerHeartBurst(e) {
  const heart = document.createElement("div");
  heart.className = "floating-heart";
  heart.textContent = ["❤️", "💖", "✨", "💍", "🌸"][Math.floor(Math.random() * 5)];

  const x = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
  const y = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;

  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;

  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1400);
}

class WeddingApp {
  constructor() {
    window.weddingApp = this;
    this.countdownInterval = null;
    this.currentLightboxList = [];
    this.currentLightboxIndex = 0;
    this.particles = null;

    this.init();
  }

  init() {
    // Inicializa sistema de partículas românticas
    this.particles = new RomanticParticles("particles-canvas");

    // Inicializa Painel Administrativo
    adminPanel = new WeddingAdminPanel();

    // Aplica tema ativo
    this.applyTheme();

    // Renderiza todas as seções
    this.renderAllSections();

    // Inicia Contagem Regressiva
    this.startCountdown();

    // Inicializa observador de scroll para animações suaves
    this.initScrollReveal();

    // Eventos e Modais
    this.bindEvents();

    // Banner de Confirmação de Presença
    this.initRsvpBanner();

    // Campos Dinâmicos de Acompanhantes
    this.updateCompanionFields();

    // Assina mudanças na store para re-renderização em tempo real
    WeddingStore.subscribe(() => {
      this.applyTheme();
      this.renderAllSections();
      this.startCountdown();
      this.updateRsvpBannerNames();
    });
  }

  applyTheme() {
    const s = WeddingStore.getSettings();
    document.body.className = s.activeTheme || "theme-gold";
  }

  renderAllSections() {
    const s = WeddingStore.getSettings();
    const vis = s.sectionsVisibility || {};

    // 1. Hero
    this.toggleSectionElement("sec-hero", vis.hero);
    this.renderHero(s);

    // 2. Countdown
    this.toggleSectionElement("sec-countdown", vis.countdown);

    // 3. A Celebração
    this.toggleSectionElement("sec-big-day", vis.bigDay);
    this.renderBigDay(s);

    // 4. Fotos das Bodas
    this.toggleSectionElement("sec-wedding-photos", vis.weddingPhotos);
    this.renderWeddingGallery();

    // 5. Presença & Confirmação WhatsApp
    this.toggleSectionElement("sec-attended", vis.attended);
    this.renderAttendedGuests();

    // 6. Presentes & PIX
    this.toggleSectionElement("sec-gifts", vis.gifts);
    this.renderGifts(s);

    // 7. Local & Mapa
    this.toggleSectionElement("sec-venue", vis.venue);
    this.renderVenue(s);

    // 6. Música
    this.toggleSectionElement("sec-music-widget", vis.music);
    this.renderMusicWidget(s);

    // 7. Mensagem Final
    this.toggleSectionElement("sec-final-message", vis.finalMessage);
    this.renderFinalMessage(s);
  }

  toggleSectionElement(id, isVisible) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isVisible === false) {
      el.classList.add("hidden");
    } else {
      el.classList.remove("hidden");
    }
  }

  // 1. HERO
  renderHero(s) {
    const groomEl = document.getElementById("hero-groom-name");
    const brideEl = document.getElementById("hero-bride-name");
    const titleEl = document.getElementById("hero-title-tag");
    const subtitleEl = document.getElementById("hero-subtitle");
    const navCoupleEl = document.getElementById("nav-couple-names");

    if (groomEl) groomEl.textContent = s.groomName;
    if (brideEl) brideEl.textContent = s.brideName;
    if (titleEl) titleEl.textContent = s.heroTitle || "Nós vamos nos casar! ❤️";
    if (subtitleEl) subtitleEl.textContent = s.heroSubtitle || "Um novo capítulo da nossa história está começando.";
    if (navCoupleEl) navCoupleEl.textContent = `${s.groomName.split(" ")[0]} & ${s.brideName.split(" ")[0]}`;
  }

  // 2. CONTAGEM REGRESSIVA
  startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    const updateTimer = () => {
      const s = WeddingStore.getSettings();
      const targetDate = new Date(s.weddingDate).getTime();
      const now = new Date().getTime();
      const diff = targetDate - now;

      const titleEl = document.getElementById("countdown-title");
      const gridEl = document.getElementById("countdown-grid");
      const celebrateEl = document.getElementById("countdown-celebrate");

      if (diff <= 0) {
        if (gridEl) gridEl.classList.add("hidden");
        if (celebrateEl) {
          celebrateEl.classList.remove("hidden");
          celebrateEl.innerHTML = `
            <div class="text-3xl md:text-5xl font-serif text-amber-800 font-bold mb-3 animate-bounce">
              Hoje é a grande celebração! 🥂💛
            </div>
            <p class="text-stone-600 text-lg">Comemorando 50 anos de amor, fé e uma família abençoada diante de Deus e de todos vocês.</p>
          `;
        }
        return;
      }

      if (gridEl) gridEl.classList.remove("hidden");
      if (celebrateEl) celebrateEl.classList.add("hidden");

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const elDays = document.getElementById("cd-days");
      const elHours = document.getElementById("cd-hours");
      const elMinutes = document.getElementById("cd-minutes");
      const elSeconds = document.getElementById("cd-seconds");

      if (elDays) elDays.textContent = String(days).padStart(2, "0");
      if (elHours) elHours.textContent = String(hours).padStart(2, "0");
      if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, "0");
      if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, "0");
    };

    updateTimer();
    this.countdownInterval = setInterval(updateTimer, 1000);
  }

  // 3. NOSSA HISTÓRIA (TIMELINE)
  renderStory() {
    const container = document.getElementById("story-timeline-container");
    if (!container) return;

    const milestones = WeddingStore.getStoryMilestones();

    container.innerHTML = milestones.map((m, index) => {
      const isEven = index % 2 === 0;
      return `
        <div class="relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''} group mb-10 sm:mb-12 fade-in-on-scroll">
          <!-- Conteúdo / Card -->
          <div class="w-full md:w-[calc(50%-3rem)] pl-14 sm:pl-16 md:pl-0">
            <div class="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-amber-100/80 hover:shadow-xl hover:border-amber-300 transition-all duration-300">
              <div class="photo-zoom-container h-44 sm:h-52 md:h-64 rounded-xl mb-4 sm:mb-5 shadow-inner overflow-hidden">
                <img src="${m.image}" alt="${m.title}" loading="lazy" class="w-full h-full object-cover cursor-pointer" onclick="weddingApp.openSingleLightbox('${m.image}', '${m.title}')">
              </div>
              <div class="wedding-badge mb-2">
                <span>📅</span> ${m.date}
              </div>
              <h3 class="text-lg sm:text-xl md:text-2xl font-serif font-bold text-stone-800 mb-2 sm:mb-3">${m.title}</h3>
              <p class="text-stone-600 leading-relaxed text-sm sm:text-base">${m.description}</p>
            </div>
          </div>

          <!-- Ponto Central / Ícone -->
          <div class="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border-4 border-amber-200 bg-white shadow-md text-lg sm:text-xl z-10 shrink-0">
            ${m.icon || "❤️"}
          </div>

          <!-- Espaçador no Desktop para equilíbrio 50/50 -->
          <div class="hidden md:block md:w-[calc(50%-3rem)]"></div>
        </div>
      `;
    }).join("");

    this.initScrollReveal();
  }

  // 4. NOSSOS MOMENTOS (GALERIA PRÉ-CASAMENTO)
  renderMomentsGallery(category = "todos") {
    const container = document.getElementById("moments-gallery-grid");
    if (!container) return;

    const photos = WeddingStore.getMomentsGallery(category);
    this.currentMomentsList = photos;

    container.innerHTML = photos.map((p, idx) => `
      <div class="photo-zoom-container rounded-2xl shadow-sm border border-stone-200/70 bg-white group cursor-pointer overflow-hidden fade-in-on-scroll" onclick="weddingApp.openGalleryLightbox('moments', ${idx})">
        <div class="h-64 md:h-72 relative">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 text-white">
            <span class="text-xs uppercase tracking-widest text-amber-200 font-semibold mb-1">${p.category}</span>
            <h4 class="font-serif text-lg font-bold">${p.title}</h4>
            <p class="text-xs text-stone-300 mt-1 line-clamp-2">${p.caption || ""}</p>
          </div>
        </div>
      </div>
    `).join("");

    this.initScrollReveal();
  }

  // 5. O GRANDE DIA
  renderBigDay(s) {
    const dateEl = document.getElementById("big-day-date");
    const timeEl = document.getElementById("big-day-time");
    const venueEl = document.getElementById("big-day-venue");
    const addressEl = document.getElementById("big-day-address");
    const dressEl = document.getElementById("big-day-dresscode");

    if (dateEl) {
      const d = new Date(s.weddingDate);
      dateEl.textContent = d.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
    if (timeEl) timeEl.textContent = s.eventTime;
    if (venueEl) venueEl.textContent = s.venueName;
    if (addressEl) addressEl.textContent = s.venueAddress;
    if (dressEl) dressEl.textContent = s.dressCode;

    const btnRoute = document.getElementById("btn-big-day-routes");
    if (btnRoute) {
      btnRoute.href = s.venueGoogleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(s.venueAddress)}`;
    }
  }

  // 6. FOTOS DO CASAMENTO (ÁLBUM DO GRANDE DIA)
  renderWeddingGallery(category = "todos") {
    const container = document.getElementById("wedding-gallery-grid");
    if (!container) return;

    const photos = WeddingStore.getWeddingGallery(category);
    this.currentWeddingList = photos;

    container.innerHTML = photos.map((p, idx) => `
      <div class="photo-zoom-container rounded-2xl shadow-sm border border-stone-200 bg-white group cursor-pointer overflow-hidden fade-in-on-scroll" onclick="weddingApp.openGalleryLightbox('wedding', ${idx})">
        <div class="h-64 md:h-80 relative">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 text-white">
            <span class="text-xs uppercase tracking-widest text-amber-200 font-semibold mb-1">${p.category}</span>
            <h4 class="font-serif text-lg font-bold">${p.title}</h4>
            <p class="text-xs text-stone-300 mt-1">${p.caption || ""}</p>
          </div>
        </div>
      </div>
    `).join("");

    this.initScrollReveal();
  }

  // 7. FOTOS DOS CONVIDADOS
  renderGuestPhotos() {
    const container = document.getElementById("guest-photos-grid");
    if (!container) return;

    const photos = WeddingStore.getGuestPhotos(true); // Apenas fotos aprovadas

    if (photos.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white/60 backdrop-blur rounded-2xl border border-dashed border-amber-200 p-8">
          <p class="text-stone-500 font-serif text-lg mb-2">Ainda não temos fotos aprovadas publicamente.</p>
          <p class="text-stone-400 text-sm">Seja o primeiro a compartilhar o seu clique desse dia inesquecível!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map((p, idx) => {
      const rot = ((idx % 3) - 1) * 2; // Rotação polaroid sutil (-2deg, 0deg, 2deg)
      return `
        <div class="polaroid-card cursor-pointer fade-in-on-scroll" style="--rotation: ${rot}deg;" onclick="weddingApp.openSingleLightbox('${p.image}', 'Foto enviada por ${p.guestName}')">
          <div class="h-56 md:h-64 overflow-hidden rounded mb-3 bg-stone-100">
            <img src="${p.image}" alt="Foto de ${p.guestName}" class="w-full h-full object-cover">
          </div>
          <div class="text-center">
            <h5 class="font-bold text-stone-800 text-sm font-serif">${p.guestName}</h5>
            ${p.message ? `<p class="text-xs text-stone-600 italic mt-1 font-script text-base">"${p.message}"</p>` : ''}
            <span class="text-[10px] text-stone-400 block mt-1">${p.date || ''}</span>
          </div>
        </div>
      `;
    }).join("");

    this.initScrollReveal();
  }

  // 5. CONFIRMAÇÃO DE PRESENÇA (DIRETO NO WHATSAPP CADASTRADO)
  renderAttendedGuests() {
    const countEl = document.getElementById("attended-counter-badge");
    const container = document.getElementById("attended-cards-grid");
    const phoneDisplay = document.getElementById("rsvp-display-phone");

    const s = WeddingStore.getSettings();
    if (phoneDisplay) {
      phoneDisplay.textContent = this.formatPhoneDisplay(s.whatsappNumber) || s.whatsappNumber || "Não cadastrado";
    }

    const guests = WeddingStore.getAttendedGuests();
    if (countEl) {
      countEl.textContent = guests.length > 0 
        ? `Já temos ${guests.length} presenças confirmadas! 💛` 
        : "Seja o primeiro a confirmar presença!";
    }

    if (!container) return;

    container.innerHTML = guests.map(g => `
      <div class="p-5 rounded-2xl bg-white border border-amber-100/90 shadow-sm hover:shadow-md transition-all flex items-start gap-4 fade-in-on-scroll">
        <img src="${g.photo}" alt="${g.name}" class="w-14 h-14 rounded-full object-cover border-2 border-amber-200 shadow-sm shrink-0">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-stone-800 font-serif text-base">${g.name}</h4>
            <span class="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">✨ Presença Confirmada</span>
          </div>
          <p class="text-stone-600 text-sm mt-1.5 leading-relaxed">"${g.message}"</p>
          <span class="text-[11px] text-stone-400 mt-2 block">${g.date}</span>
        </div>
      </div>
    `).join("");

    this.initScrollReveal();
  }

  // ==========================================
  // CONFIRMAÇÃO DE PRESENÇA DIRETO NO WHATSAPP
  // ==========================================
  openWhatsAppRsvp(customMessage) {
    const s = WeddingStore.getSettings();
    let rawPhone = (s.whatsappNumber || "5514996712219").replace(/\D/g, "");
    if (!rawPhone) rawPhone = "5514996712219";
    // Adiciona DDI 55 do Brasil se tiver 10 ou 11 dígitos
    if (rawPhone.length === 10 || rawPhone.length === 11) {
      rawPhone = "55" + rawPhone;
    }

    const defaultMsg = s.whatsappMessage || `Olá! Gostaria de confirmar minha presença nas Bodas de Ouro de ${s.groomName} & ${s.brideName} (19/12/2026)! 🥂💛`;
    const message = customMessage || defaultMsg;
    const url = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  updateCompanionFields() {
    const countSelect = document.getElementById("rsvp-guest-count");
    const container = document.getElementById("rsvp-companions-container");
    const inputsBox = document.getElementById("rsvp-companions-inputs");
    if (!countSelect || !container || !inputsBox) return;

    const val = countSelect.value;
    let numPeople = 1;
    if (val.includes("2")) numPeople = 2;
    else if (val.includes("3")) numPeople = 3;
    else if (val.includes("4")) numPeople = 4;
    else if (val.includes("5")) numPeople = 5;

    // Se for apenas 1 pessoa (apenas eu), oculta a caixa de acompanhantes
    if (numPeople <= 1) {
      container.classList.add("hidden");
      inputsBox.innerHTML = "";
      return;
    }

    container.classList.remove("hidden");

    // Salva valores digitados anteriormente para não apagar caso o usuário troque de opção
    const prevInputs = Array.from(inputsBox.querySelectorAll(".rsvp-companion-input"));
    const prevValues = prevInputs.map(i => i.value);

    let html = "";
    for (let i = 2; i <= numPeople; i++) {
      const prevVal = prevValues[i - 2] || "";
      const label = (i === 5 && val.includes("mais"))
        ? `Nome do 5º Convidado (e demais)`
        : `Nome do ${i}º Convidado / Acompanhante`;
      const placeholder = i === 2 ? "Ex: Maria Silva (Esposa)" : i === 3 ? "Ex: Lucas Silva (Filho)" : "Nome do acompanhante";

      html += `
        <div>
          <label class="block text-[11px] font-semibold text-amber-900 uppercase tracking-wider mb-1">${label}</label>
          <input type="text" class="rsvp-companion-input w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500 text-sm shadow-xs" placeholder="${placeholder}" value="${prevVal.replace(/"/g, '&quot;')}">
        </div>
      `;
    }
    inputsBox.innerHTML = html;
  }

  submitRsvpForm() {
    const nameEl = document.getElementById("rsvp-guest-name");
    const countEl = document.getElementById("rsvp-guest-count");
    const noteEl = document.getElementById("rsvp-guest-note");

    const name = nameEl ? nameEl.value.trim() : "";
    const count = countEl ? countEl.value : "1 pessoa";
    const note = noteEl ? noteEl.value.trim() : "";

    if (!name) {
      alert("Por favor, digite seu nome para confirmar a presença.");
      if (nameEl) nameEl.focus();
      return;
    }

    // Coleta nomes dos acompanhantes
    const companionInputs = document.querySelectorAll(".rsvp-companion-input");
    const companions = [];
    companionInputs.forEach(input => {
      const val = input.value.trim();
      if (val) companions.push(val);
    });

    const s = WeddingStore.getSettings();
    let text = `Olá! Gostaria de confirmar nossa presença na celebração das Bodas de Ouro de ${s.groomName} & ${s.brideName} (19/12/2026)! 🥂💛\n\n`;
    text += `👤 Responsável: ${name}\n`;
    text += `👥 Total de Pessoas: ${count}\n`;

    if (companions.length > 0) {
      text += `\n📋 Quem vai:\n`;
      text += `  1. ${name} (titular)\n`;
      companions.forEach((comp, idx) => {
        text += `  ${idx + 2}. ${comp}\n`;
      });
    }

    if (note) {
      text += `\n💬 Observação / Recado: ${note}\n`;
    }
    text += `\nMuito obrigado pelo convite e carinho! Mal podemos esperar para comemorar juntos esse momento inesquecível! ✨`;

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    let attendeesDisplayName = name;
    if (companions.length > 0) {
      attendeesDisplayName += ` (+ ${companions.join(", ")})`;
    }

    // Registra a presença localmente com o dia e horário exato da confirmação
    WeddingStore.addAttendedGuest({
      name: attendeesDisplayName,
      count: count,
      companions: companions,
      date: dateFormatted,
      message: note ? note : `Presença confirmada (${count})! Parabéns ao casal pelos 50 anos de amor! 💛`,
      photo: `https://images.unsplash.com/photo-${1534528741775 + (Math.floor(Math.random() * 100))}?auto=format&fit=crop&w=200&q=80`
    });

    this.renderAttendedGuests();
    showToast(`Presença confirmada! Abrindo WhatsApp... 📲`);

    if (nameEl) nameEl.value = "";
    if (noteEl) noteEl.value = "";
    companionInputs.forEach(input => input.value = "");
    this.updateCompanionFields();

    this.openWhatsAppRsvp(text);
  }

  formatPhoneDisplay(phone) {
    if (!phone) return "";
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 13 && clean.startsWith("55")) {
      return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
    }
    if (clean.length === 12 && clean.startsWith("55")) {
      return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
    }
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return phone;
  }

  // ==========================================
  // BANNER DE CONFIRMAÇÃO DE PRESENÇA (TEMA BODAS DE OURO)
  // ==========================================
  initRsvpBanner() {
    const banner = document.getElementById("rsvp-reminder-banner");
    if (!banner) return;

    this.updateRsvpBannerNames();

    // Se já foi fechado nesta sessão, não reabrir automaticamente
    if (sessionStorage.getItem("rsvp_banner_dismissed") === "true") {
      return;
    }

    let bannerShown = false;
    const triggerShow = () => {
      if (bannerShown) return;
      bannerShown = true;
      this.showRsvpBanner();
    };

    // Mostra suavemente após 2.5 segundos
    const timer = setTimeout(triggerShow, 2500);

    // Ou mostra imediatamente se o visitante começar a rolar a página (> 180px)
    const onScroll = () => {
      if (window.scrollY > 180) {
        clearTimeout(timer);
        triggerShow();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Eventos dos botões do banner
    const btnClose = document.getElementById("btn-close-rsvp-banner");
    const btnDismiss = document.getElementById("btn-dismiss-rsvp-banner");
    const btnConfirm = document.getElementById("btn-confirm-rsvp-banner");

    if (btnClose) {
      btnClose.addEventListener("click", () => this.closeRsvpBanner());
    }
    if (btnDismiss) {
      btnDismiss.addEventListener("click", () => this.closeRsvpBanner());
    }
    if (btnConfirm) {
      btnConfirm.addEventListener("click", () => {
        this.closeRsvpBanner();
        this.openWhatsAppRsvp();
      });
    }

    // Fechar ao clicar no fundo escurecido (fora do card)
    banner.addEventListener("click", (e) => {
      if (e.target === banner) {
        this.closeRsvpBanner();
      }
    });
  }

  showRsvpBanner() {
    const banner = document.getElementById("rsvp-reminder-banner");
    if (banner) {
      banner.classList.add("banner-visible");
      banner.classList.remove("opacity-0", "pointer-events-none");
    }
  }

  closeRsvpBanner() {
    const banner = document.getElementById("rsvp-reminder-banner");
    if (banner) {
      banner.classList.remove("banner-visible");
      banner.classList.add("opacity-0", "pointer-events-none");
      sessionStorage.setItem("rsvp_banner_dismissed", "true");
    }
  }

  updateRsvpBannerNames() {
    const coupleNames = document.getElementById("banner-couple-names");
    if (coupleNames) {
      const s = WeddingStore.getSettings();
      coupleNames.textContent = `${s.groomName} & ${s.brideName}`;
    }
  }

  toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
      mobileMenu.classList.toggle("hidden");
    }
  }

  // 9. DEIXE UMA MENSAGEM AOS NOIVOS
  renderMessages() {
    const container = document.getElementById("messages-wall-grid");
    if (!container) return;

    const msgs = WeddingStore.getMessages(true);

    container.innerHTML = msgs.map(m => `
      <div class="p-6 md:p-7 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition relative flex flex-col justify-between fade-in-on-scroll">
        <div>
          <div class="text-3xl text-amber-300 font-serif leading-none mb-3">“</div>
          <p class="text-stone-700 text-sm md:text-base leading-relaxed italic mb-4">${m.text}</p>
        </div>
        <div class="flex items-center justify-between border-t border-stone-100 pt-4 mt-auto">
          <div>
            <h5 class="font-bold text-stone-800 text-sm font-serif">${m.name}</h5>
            <span class="text-xs text-stone-400">${m.date}</span>
          </div>
          <button onclick="weddingApp.likeMessage('${m.id}', event)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition">
            <span>❤️</span>
            <span>${m.hearts || 1}</span>
          </button>
        </div>
      </div>
    `).join("");

    this.initScrollReveal();
  }

  likeMessage(id, e) {
    if (e) {
      e.stopPropagation();
      triggerHeartBurst(e);
    }
    WeddingStore.likeMessage(id);
    this.renderMessages();
  }

  // 6. PRESENTES & PIX
  renderGifts(s) {
    const pixKeyEl = document.getElementById("gifts-pix-key");
    const pixRecipientEl = document.getElementById("gifts-pix-recipient");
    if (pixKeyEl) pixKeyEl.textContent = s.pixKey || "bodas.jose.cida@gmail.com";
    if (pixRecipientEl) pixRecipientEl.textContent = s.pixRecipient || "José Ferreira e Maria Aparecida (Cida)";
  }

  copyPixKey() {
    const s = WeddingStore.getSettings();
    const key = s.pixKey || "bodas.jose.cida@gmail.com";
    const onDone = () => {
      const btn = document.getElementById("btn-copy-pix");
      if (btn) {
        const origContent = btn.innerHTML;
        btn.innerHTML = `<span>✓</span><span>Chave Copiada! ✨</span>`;
        btn.classList.add("!bg-emerald-600", "!text-white");
        setTimeout(() => {
          btn.innerHTML = origContent;
          btn.classList.remove("!bg-emerald-600", "!text-white");
        }, 3000);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(key).then(onDone).catch(() => {
        prompt("Copie a Chave PIX:", key);
      });
    } else {
      prompt("Copie a Chave PIX:", key);
    }
  }

  // 10. LOCAL DO CASAMENTO & CALENDÁRIO
  renderVenue(s) {
    const vName = document.getElementById("venue-card-name");
    const vAddr = document.getElementById("venue-card-address");
    const vDate = document.getElementById("venue-card-date");
    const vTime = document.getElementById("venue-card-time");

    if (vName) vName.textContent = s.venueName;
    if (vAddr) vAddr.textContent = s.venueAddress;
    if (vDate) {
      const d = new Date(s.weddingDate);
      vDate.textContent = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    }
    if (vTime) vTime.textContent = s.eventTime;

    const btnRoute = document.getElementById("btn-venue-directions");
    if (btnRoute) {
      btnRoute.href = s.venueGoogleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(s.venueAddress)}`;
    }
  }

  // Adicionar ao Calendário (.ICS e Google Agenda)
  downloadCalendarFile() {
    const s = WeddingStore.getSettings();
    const startDate = new Date(s.weddingDate);
    const endDate = new Date(startDate.getTime() + (6 * 60 * 60 * 1000)); // Duração 6h

    const formatICSDate = (d) => {
      return d.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BodasDeOuro//Jose e Cida//PT",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:Bodas de Ouro de ${s.groomName} & ${s.brideName} (50 Anos) 🥂💛`,
      `DESCRIPTION:Celebração inesquecível das Bodas de Ouro (50 anos de casados) de ${s.groomName} e ${s.brideName}! Venha com o coração aberto para comemorar conosco.`,
      `LOCATION:${s.venueName} - ${s.venueAddress}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `bodas-50-anos-${s.groomName}-${s.brideName}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Arquivo do calendário baixado! Adicione à sua agenda. 📅");
  }

  // 12. MÚSICA
  renderMusicWidget(s) {
    const trackTitle = document.getElementById("music-track-title");
    if (trackTitle) {
      trackTitle.textContent = s.musicTitle || "Nossa Música de Amor";
    }
  }

  // 13. MENSAGEM FINAL
  renderFinalMessage(s) {
    const namesEl = document.getElementById("final-couple-names");
    if (namesEl) {
      namesEl.textContent = `${s.groomName} & ${s.brideName}`;
    }
  }

  // LIGHTBOX
  openGalleryLightbox(galleryType, index) {
    if (galleryType === "moments") {
      this.currentLightboxList = WeddingStore.getMomentsGallery("todos").map(p => ({
        image: p.image,
        title: p.title,
        caption: p.caption
      }));
    } else {
      this.currentLightboxList = WeddingStore.getWeddingGallery("todos").map(p => ({
        image: p.image,
        title: p.title,
        caption: p.caption
      }));
    }
    this.currentLightboxIndex = index;
    this.showLightbox();
  }

  openSingleLightbox(imageUrl, title = "") {
    this.currentLightboxList = [{ image: imageUrl, title, caption: "" }];
    this.currentLightboxIndex = 0;
    this.showLightbox();
  }

  showLightbox() {
    const modal = document.getElementById("lightbox-modal");
    if (!modal || this.currentLightboxList.length === 0) return;

    const item = this.currentLightboxList[this.currentLightboxIndex];
    document.getElementById("lightbox-img").src = item.image;
    document.getElementById("lightbox-title").textContent = item.title || "";
    document.getElementById("lightbox-caption").textContent = item.caption || "";

    modal.classList.remove("hidden");
  }

  nextLightbox() {
    if (this.currentLightboxList.length <= 1) return;
    this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.currentLightboxList.length;
    this.showLightbox();
  }

  prevLightbox() {
    if (this.currentLightboxList.length <= 1) return;
    this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.currentLightboxList.length) % this.currentLightboxList.length;
    this.showLightbox();
  }

  closeLightbox() {
    const modal = document.getElementById("lightbox-modal");
    if (modal) modal.classList.add("hidden");
  }

  // INTERSECTION OBSERVER PARA EFEITOS DE ROLAGEM
  initScrollReveal() {
    const elements = document.querySelectorAll(".fade-in-on-scroll:not(.is-visible)");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      elements.forEach(el => observer.observe(el));
    } else {
      elements.forEach(el => el.classList.add("is-visible"));
    }
  }

  // BIND DE EVENTOS DA INTERFACE
  bindEvents() {
    // Menu Mobile
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
      mobileMenu.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => mobileMenu.classList.add("hidden"));
      });
    }

    // Filtros de Nossos Momentos
    const momentTabs = document.querySelectorAll(".moment-filter-tab");
    momentTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        momentTabs.forEach(t => t.classList.remove("active-filter", "bg-amber-800", "text-white"));
        e.currentTarget.classList.add("active-filter", "bg-amber-800", "text-white");
        const category = e.currentTarget.getAttribute("data-category");
        this.renderMomentsGallery(category);
      });
    });

    // Filtros de Fotos do Casamento
    const weddingTabs = document.querySelectorAll(".wedding-filter-tab");
    weddingTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        weddingTabs.forEach(t => t.classList.remove("active-filter", "bg-amber-800", "text-white"));
        e.currentTarget.classList.add("active-filter", "bg-amber-800", "text-white");
        const category = e.currentTarget.getAttribute("data-category");
        this.renderWeddingGallery(category);
      });
    });

    // Modal de Upload de Foto de Convidado
    const btnOpenGuestPhoto = document.getElementById("btn-open-guest-photo");
    const modalGuestPhoto = document.getElementById("guest-photo-modal");
    const formGuestPhoto = document.getElementById("guest-photo-form");

    if (btnOpenGuestPhoto && modalGuestPhoto) {
      btnOpenGuestPhoto.addEventListener("click", () => {
        modalGuestPhoto.classList.remove("hidden");
      });
    }

    // Upload de foto do convidado com preview
    const guestFileInput = document.getElementById("guest-photo-file");
    const guestPreview = document.getElementById("guest-photo-preview");
    let currentGuestImageBase64 = "";

    if (guestFileInput) {
      guestFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            currentGuestImageBase64 = loadEvt.target.result;
            if (guestPreview) {
              guestPreview.src = currentGuestImageBase64;
              guestPreview.classList.remove("hidden");
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (formGuestPhoto) {
      formGuestPhoto.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("guest-name-input").value.trim();
        const message = document.getElementById("guest-msg-input").value.trim();

        if (!currentGuestImageBase64) {
          alert("Por favor, selecione uma foto para enviar!");
          return;
        }

        WeddingStore.addGuestPhoto({
          guestName: name,
          message,
          image: currentGuestImageBase64
        });

        modalGuestPhoto.classList.add("hidden");
        formGuestPhoto.reset();
        if (guestPreview) guestPreview.classList.add("hidden");
        currentGuestImageBase64 = "";

        showToast("Obrigado por compartilhar esse momento com a gente! ❤️ Sua foto foi enviada para aprovação dos noivos.", 5000);
      });
    }

    // Modal "Eu fui ao casamento!"
    const btnOpenAttended = document.getElementById("btn-open-attended-modal");
    const modalAttended = document.getElementById("attended-modal");
    const formAttended = document.getElementById("attended-form");

    if (btnOpenAttended && modalAttended) {
      btnOpenAttended.addEventListener("click", () => {
        modalAttended.classList.remove("hidden");
      });
    }

    let currentAttendedPhotoBase64 = "";
    const attendedFileInput = document.getElementById("attended-photo-file");
    const attendedPreview = document.getElementById("attended-photo-preview");

    if (attendedFileInput) {
      attendedFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            currentAttendedPhotoBase64 = loadEvt.target.result;
            if (attendedPreview) {
              attendedPreview.src = currentAttendedPhotoBase64;
              attendedPreview.classList.remove("hidden");
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (formAttended) {
      formAttended.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("attended-name-input").value.trim();
        const message = document.getElementById("attended-msg-input").value.trim();

        if (!name) {
          alert("Por favor, informe seu nome!");
          return;
        }

        WeddingStore.addAttendedGuest({
          name,
          photo: currentAttendedPhotoBase64 || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          message
        });

        modalAttended.classList.add("hidden");
        formAttended.reset();
        if (attendedPreview) attendedPreview.classList.add("hidden");
        currentAttendedPhotoBase64 = "";

        this.renderAttendedGuests();
        showToast("Presença confirmada no mural! Foi maravilhoso ter você lá! 💍✨");
      });
    }

    // Formulário de Mensagens aos Noivos
    const formMsg = document.getElementById("form-leave-message");
    if (formMsg) {
      formMsg.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("msg-author-name").value.trim();
        const text = document.getElementById("msg-author-text").value.trim();

        if (!name || !text) {
          alert("Por favor, preencha seu nome e sua mensagem de carinho!");
          return;
        }

        WeddingStore.addMessage({ name, text });
        formMsg.reset();
        this.renderMessages();
        triggerHeartBurst(e);
        showToast("Mensagem enviada com sucesso! Os noivos vão amar ler seu recado! ❤️");
      });
    }

    // Fechar modais genéricos com classe .modal-backdrop
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.add("hidden");
        }
      });
    });

    document.querySelectorAll(".btn-close-modal").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-backdrop");
        if (modal) modal.classList.add("hidden");
      });
    });

    // Lightbox Controls
    const btnNextLb = document.getElementById("lightbox-next");
    const btnPrevLb = document.getElementById("lightbox-prev");
    const btnCloseLb = document.getElementById("lightbox-close");

    if (btnNextLb) btnNextLb.addEventListener("click", () => this.nextLightbox());
    if (btnPrevLb) btnPrevLb.addEventListener("click", () => this.prevLightbox());
    if (btnCloseLb) btnCloseLb.addEventListener("click", () => this.closeLightbox());

    // Teclas do Lightbox
    window.addEventListener("keydown", (e) => {
      const lb = document.getElementById("lightbox-modal");
      if (lb && !lb.classList.contains("hidden")) {
        if (e.key === "Escape") this.closeLightbox();
        if (e.key === "ArrowRight") this.nextLightbox();
        if (e.key === "ArrowLeft") this.prevLightbox();
      }
    });

    // Player de Áudio - Play / Pause
    const musicBtn = document.getElementById("music-play-pause-btn");
    const musicWidget = document.getElementById("music-player-widget");
    if (musicBtn) {
      musicBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        RomanticAudio.togglePlay();
      });
    }
    if (musicWidget) {
      musicWidget.addEventListener("click", () => {
        RomanticAudio.togglePlay();
      });
    }

    // Botão Adicionar ao Calendário
    const btnAddCalendar = document.getElementById("btn-add-calendar");
    if (btnAddCalendar) {
      btnAddCalendar.addEventListener("click", () => {
        this.downloadCalendarFile();
      });
    }
  }
}

// Inicialização após carregamento do DOM
let weddingApp;
document.addEventListener("DOMContentLoaded", () => {
  weddingApp = new WeddingApp();
});
