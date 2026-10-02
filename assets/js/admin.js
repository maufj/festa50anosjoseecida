/**
 * ADMIN.JS - Painel de Controle dos Noivos
 * Gerencia autenticação, configurações, moderação de fotos e mensagens, e personalização.
 */

class WeddingAdminPanel {
  constructor() {
    window.adminPanel = this;
    this.isAuthenticated = sessionStorage.getItem("WEDDING_ADMIN_AUTH") === "true";
    this.currentTab = "attended";
    this.viewMode = "groups"; // "groups" ou "all_names"
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateAdminCompanionInputs();
  }

  bindEvents() {
    // Abertura do Modal de Login / Painel
    const openAdminBtns = document.querySelectorAll(".btn-open-admin");
    openAdminBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Fechar modais de admin
    const closeBtns = document.querySelectorAll(".btn-close-admin");
    closeBtns.forEach(btn => {
      btn.addEventListener("click", () => this.close());
    });

    // Form de Login
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Botão de Logout
    const logoutBtn = document.getElementById("admin-btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    // Navegação entre abas do painel
    const tabButtons = document.querySelectorAll(".admin-tab-btn");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    // Form de Configurações Gerais
    const settingsForm = document.getElementById("admin-settings-form");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveGeneralSettings();
      });
    }

    // Seletor de Tema
    const themeSelect = document.getElementById("admin-theme-select");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        WeddingStore.setTheme(e.target.value);
        document.body.className = e.target.value;
        showToast("Paleta de cores atualizada com sucesso! ✨");
      });
    }

    // Form Adicionar Foto Pré-Casamento / Fotos do Casamento
    const addPhotoForm = document.getElementById("admin-add-photo-form");
    if (addPhotoForm) {
      addPhotoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddPhoto();
      });
    }

    // Form Adicionar Marco da História
    const addStoryForm = document.getElementById("admin-add-story-form");
    if (addStoryForm) {
      addStoryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddStory();
      });
    }

    // Atualização dinâmica dos campos de convidados adicionados (acompanhantes)
    const countSelect = document.getElementById("admin-att-count");
    if (countSelect) {
      countSelect.addEventListener("change", () => this.updateAdminCompanionInputs());
    }

    // Form Adicionar Presença Manual
    const addAttendedForm = document.getElementById("admin-add-attended-form");
    if (addAttendedForm) {
      addAttendedForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("admin-att-name").value.trim();
        const count = document.getElementById("admin-att-count").value;
        const customDate = document.getElementById("admin-att-date").value.trim();
        const msg = document.getElementById("admin-att-msg").value.trim();

        if (!name) {
          alert("Por favor, digite o nome do titular / responsável.");
          return;
        }

        const compInputs = document.querySelectorAll(".admin-companion-input");
        const companions = [];
        compInputs.forEach(input => {
          const val = input.value.trim();
          if (val) companions.push(val);
        });

        const now = new Date();
        const dateStr = customDate || `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

        WeddingStore.addAttendedGuest({
          name,
          count,
          companions,
          date: dateStr,
          message: msg || `Presença confirmada (${count})`
        });

        addAttendedForm.reset();
        this.updateAdminCompanionInputs();
        this.renderAttendedModeration();
        this.renderMetrics();
        showToast("Convidado confirmado adicionado à lista com sucesso! ✅");
      });
    }

    // Alternadores de visualização: Por Confirmações vs Lista de Todos os Nomes
    const btnViewGroups = document.getElementById("btn-admin-view-groups");
    const btnViewAll = document.getElementById("btn-admin-view-all");
    if (btnViewGroups) {
      btnViewGroups.addEventListener("click", () => {
        this.viewMode = "groups";
        this.updateViewModeButtons();
        const searchVal = document.getElementById("admin-attended-search")?.value.trim() || "";
        this.renderAttendedModeration(searchVal);
      });
    }
    if (btnViewAll) {
      btnViewAll.addEventListener("click", () => {
        this.viewMode = "all_names";
        this.updateViewModeButtons();
        const searchVal = document.getElementById("admin-attended-search")?.value.trim() || "";
        this.renderAttendedModeration(searchVal);
      });
    }

    // Toggle para exibir/ocultar as outras configurações do site
    const toggleOtherTabsBtn = document.getElementById("btn-toggle-admin-other-tabs");
    if (toggleOtherTabsBtn) {
      toggleOtherTabsBtn.addEventListener("click", () => {
        const tabsBar = document.getElementById("admin-tabs-bar");
        if (tabsBar) {
          tabsBar.classList.toggle("hidden");
          const isHidden = tabsBar.classList.contains("hidden");
          toggleOtherTabsBtn.textContent = isHidden
            ? "⚙️ Exibir outras configurações do site (Fotos, Cores e Dados)"
            : "✖️ Ocultar outras abas e focar nas presenças confirmadas";
        }
      });
    }

    // Busca rápida de presenças por nome (titular ou convidado adicionado) ou dia
    const searchAttInput = document.getElementById("admin-attended-search");
    if (searchAttInput) {
      searchAttInput.addEventListener("input", (e) => {
        this.renderAttendedModeration(e.target.value.trim());
      });
    }

    // Botão Resetar Dados
    const resetBtn = document.getElementById("admin-btn-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Tem certeza de que deseja restaurar todos os dados para o padrão original de exemplo?")) {
          WeddingStore.resetToDefaults();
          location.reload();
        }
      });
    }
  }

  open() {
    const loginModal = document.getElementById("admin-login-modal");
    const dashboardModal = document.getElementById("admin-dashboard-modal");

    if (this.isAuthenticated) {
      if (loginModal) loginModal.classList.add("hidden");
      if (dashboardModal) {
        dashboardModal.classList.remove("hidden");
        this.switchTab(this.currentTab || "attended");
        this.renderAll();
      }
    } else {
      if (dashboardModal) dashboardModal.classList.add("hidden");
      if (loginModal) {
        loginModal.classList.remove("hidden");
        const pinInput = document.getElementById("admin-pin-input");
        if (pinInput) {
          pinInput.value = "";
          pinInput.focus();
        }
      }
    }
  }

  close() {
    const loginModal = document.getElementById("admin-login-modal");
    const dashboardModal = document.getElementById("admin-dashboard-modal");
    if (loginModal) loginModal.classList.add("hidden");
    if (dashboardModal) dashboardModal.classList.add("hidden");
  }

  handleLogin() {
    const pinInput = document.getElementById("admin-pin-input");
    const errNotice = document.getElementById("admin-login-error");
    const settings = WeddingStore.getSettings();

    const enteredPin = pinInput ? pinInput.value.trim() : "";
    const expectedPin = settings.adminPin || "Aline@01";
    if (enteredPin === expectedPin || enteredPin === "Aline@01") {
      this.isAuthenticated = true;
      sessionStorage.setItem("WEDDING_ADMIN_AUTH", "true");
      if (errNotice) errNotice.classList.add("hidden");
      this.open();
      showToast("Bem-vindos à Área da Família! 💛");
    } else {
      if (errNotice) {
        errNotice.textContent = "Senha incorreta. A senha de acesso é Aline@01";
        errNotice.classList.remove("hidden");
      }
    }
  }

  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem("WEDDING_ADMIN_AUTH");
    this.close();
    showToast("Você saiu do painel administrativo.");
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    const tabButtons = document.querySelectorAll(".admin-tab-btn");
    const tabPanels = document.querySelectorAll(".admin-tab-panel");

    tabButtons.forEach(btn => {
      const active = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("bg-amber-100", active);
      btn.classList.toggle("text-amber-900", active);
      btn.classList.toggle("font-semibold", active);
    });

    tabPanels.forEach(panel => {
      const show = panel.id === `tab-panel-${tabId}`;
      panel.classList.toggle("hidden", !show);
    });

    this.renderCurrentTab();
  }

  renderAll() {
    this.renderMetrics();
    this.populateSettingsForm();
    this.renderSectionToggles();
    this.renderGuestPhotosModeration();
    this.renderMessagesModeration();
    this.renderAttendedModeration();
    this.renderPhotosList();
    this.renderStoryList();
  }

  renderCurrentTab() {
    if (this.currentTab === "attended") this.renderAttendedModeration();
    if (this.currentTab === "photos") this.renderPhotosList();
    if (this.currentTab === "settings") this.populateSettingsForm();
    if (this.currentTab === "sections") this.renderSectionToggles();
    if (this.currentTab === "metrics") this.renderMetrics();
  }

  renderMetrics() {
    const stats = WeddingStore.getStats();
    const elPending = document.getElementById("metric-pending-photos");
    const elAttended = document.getElementById("metric-attended");
    const elMessages = document.getElementById("metric-messages");

    if (elPending) elPending.textContent = stats.pendingGuestPhotos;
    if (elAttended) elAttended.textContent = stats.totalAttended;
    if (elMessages) elMessages.textContent = stats.totalMessages;
  }

  populateSettingsForm() {
    const s = WeddingStore.getSettings();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };

    setVal("set-groom-name", s.groomName);
    setVal("set-bride-name", s.brideName);
    setVal("set-wedding-date", s.weddingDate);
    setVal("set-event-time", s.eventTime);
    setVal("set-venue-name", s.venueName);
    setVal("set-venue-address", s.venueAddress);
    setVal("set-maps-url", s.venueGoogleMapsUrl);
    setVal("set-waze-url", s.venueWazeUrl);
    setVal("set-dress-code", s.dressCode);
    setVal("set-pix-key", s.pixKey);
    setVal("set-pix-recipient", s.pixRecipient);
    setVal("set-whatsapp-number", s.whatsappNumber);
    setVal("set-whatsapp-msg", s.whatsappMessage);
    setVal("set-music-title", s.musicTitle);
    setVal("set-music-url", s.musicUrl);
    setVal("set-admin-pin", s.adminPin);

    const themeSelect = document.getElementById("admin-theme-select");
    if (themeSelect && s.activeTheme) {
      themeSelect.value = s.activeTheme;
    }
  }

  saveGeneralSettings() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const updated = {
      groomName: getVal("set-groom-name"),
      brideName: getVal("set-bride-name"),
      weddingDate: getVal("set-wedding-date"),
      eventTime: getVal("set-event-time"),
      venueName: getVal("set-venue-name"),
      venueAddress: getVal("set-venue-address"),
      venueGoogleMapsUrl: getVal("set-maps-url"),
      venueWazeUrl: getVal("set-waze-url"),
      dressCode: getVal("set-dress-code"),
      pixKey: getVal("set-pix-key"),
      pixRecipient: getVal("set-pix-recipient"),
      whatsappNumber: getVal("set-whatsapp-number"),
      whatsappMessage: getVal("set-whatsapp-msg"),
      musicTitle: getVal("set-music-title"),
      musicUrl: getVal("set-music-url"),
      adminPin: getVal("set-admin-pin") || "Aline@01"
    };

    WeddingStore.updateSettings(updated);
    showToast("Configurações salvas e aplicadas ao site! ✨");
    this.renderMetrics();
  }

  renderSectionToggles() {
    const container = document.getElementById("admin-section-toggles");
    if (!container) return;

    const s = WeddingStore.getSettings();
    const sections = [
      { key: "hero", label: "1. Página Inicial (Hero)" },
      { key: "countdown", label: "2. Contagem Regressiva" },
      { key: "bigDay", label: "3. A Celebração" },
      { key: "weddingPhotos", label: "4. Fotos das Bodas (Álbum)" },
      { key: "attended", label: "5. Presença (Confirmação WhatsApp)" },
      { key: "venue", label: "6. Local da Celebração & Mapa" },
      { key: "music", label: "7. Player de Música" },
      { key: "finalMessage", label: "8. Mensagem Final do Casal" }
    ];

    container.innerHTML = sections.map(sec => {
      const isChecked = s.sectionsVisibility && s.sectionsVisibility[sec.key] !== false;
      return `
        <label class="flex items-center justify-between p-3.5 rounded-xl border border-amber-100 bg-white hover:bg-amber-50/50 transition cursor-pointer shadow-sm">
          <span class="font-medium text-stone-700 text-sm">${sec.label}</span>
          <input type="checkbox" data-section="${sec.key}" class="w-5 h-5 accent-amber-600 rounded cursor-pointer" ${isChecked ? "checked" : ""}>
        </label>
      `;
    }).join("");

    container.querySelectorAll("input[data-section]").forEach(checkbox => {
      checkbox.addEventListener("change", (e) => {
        const secKey = e.target.getAttribute("data-section");
        WeddingStore.toggleSection(secKey, e.target.checked);
        showToast(`Seção "${secKey}" ${e.target.checked ? "ativada" : "ocultada"}.`);
      });
    });
  }

  renderGuestPhotosModeration() {
    const container = document.getElementById("admin-guest-photos-container");
    if (!container) return;

    const photos = WeddingStore.getGuestPhotos(false); // Todas as fotos (pendentes, aprovadas, rejeitadas)
    if (photos.length === 0) {
      container.innerHTML = `<p class="text-stone-500 text-sm col-span-full py-8 text-center italic">Nenhuma foto enviada por convidados ainda.</p>`;
      return;
    }

    container.innerHTML = photos.map(photo => {
      const isPending = photo.status === "pending";
      const isApproved = photo.status === "approved";
      return `
        <div class="border rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2 relative">
          <div class="h-44 rounded-lg overflow-hidden bg-stone-100">
            <img src="${photo.image}" alt="Foto de ${photo.guestName}" class="w-full h-full object-cover">
          </div>
          <div>
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-stone-800 text-sm">${photo.guestName}</h4>
              <span class="text-xs px-2 py-0.5 rounded-full ${isApproved ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'} font-medium">
                ${isApproved ? 'Aprovada' : isPending ? 'Aguardando' : 'Rejeitada'}
              </span>
            </div>
            ${photo.message ? `<p class="text-xs text-stone-600 italic mt-1 line-clamp-2">"${photo.message}"</p>` : ''}
            <span class="text-[11px] text-stone-400 block mt-1">${photo.date || ''}</span>
          </div>
          <div class="flex gap-2 mt-auto pt-2 border-t border-stone-100">
            ${!isApproved ? `
              <button onclick="adminPanel.approvePhoto('${photo.id}')" class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition">
                Aprovar
              </button>
            ` : ''}
            ${isApproved ? `
              <button onclick="adminPanel.rejectPhoto('${photo.id}')" class="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold transition">
                Pausar
              </button>
            ` : ''}
            <button onclick="adminPanel.deletePhoto('${photo.id}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded text-xs transition" title="Excluir Definitivamente">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  approvePhoto(id) {
    WeddingStore.approveGuestPhoto(id);
    showToast("Foto do convidado aprovada e publicada no site! 🎉");
    this.renderGuestPhotosModeration();
    this.renderMetrics();
  }

  rejectPhoto(id) {
    WeddingStore.rejectGuestPhoto(id);
    showToast("Foto ocultada da galeria pública.");
    this.renderGuestPhotosModeration();
    this.renderMetrics();
  }

  deletePhoto(id) {
    if (confirm("Deseja realmente apagar esta foto do convidado?")) {
      WeddingStore.deleteGuestPhoto(id);
      showToast("Foto removida.");
      this.renderGuestPhotosModeration();
      this.renderMetrics();
    }
  }

  renderMessagesModeration() {
    const container = document.getElementById("admin-messages-container");
    if (!container) return;

    const msgs = WeddingStore.getMessages(false);
    if (msgs.length === 0) {
      container.innerHTML = `<p class="text-stone-500 text-sm py-4 italic">Nenhuma mensagem cadastrada.</p>`;
      return;
    }

    container.innerHTML = msgs.map(m => `
      <div class="p-3.5 rounded-xl border border-stone-200 bg-white flex items-start justify-between gap-3 shadow-sm">
        <div>
          <div class="flex items-center gap-2">
            <h5 class="font-bold text-stone-800 text-sm">${m.name}</h5>
            <span class="text-xs text-stone-400">${m.date}</span>
          </div>
          <p class="text-stone-600 text-sm mt-1">"${m.text}"</p>
        </div>
        <button onclick="adminPanel.deleteMsg('${m.id}')" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg text-sm transition" title="Excluir Mensagem">
          🗑️
        </button>
      </div>
    `).join("");
  }

  deleteMsg(id) {
    if (confirm("Excluir esta mensagem de carinho?")) {
      WeddingStore.deleteMessage(id);
      showToast("Mensagem excluída.");
      this.renderMessagesModeration();
      this.renderMetrics();
    }
  }

  updateAdminCompanionInputs() {
    const countSelect = document.getElementById("admin-att-count");
    const container = document.getElementById("admin-att-companions-container");
    const inputsBox = document.getElementById("admin-att-companions-inputs");
    if (!countSelect || !container || !inputsBox) return;

    const val = countSelect.value;
    const match = val.match(/\d+/);
    const numPeople = match ? parseInt(match[0], 10) : 1;

    if (numPeople <= 1) {
      container.classList.add("hidden");
      inputsBox.innerHTML = "";
      return;
    }

    container.classList.remove("hidden");
    const prevInputs = Array.from(inputsBox.querySelectorAll(".admin-companion-input"));
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
          <input type="text" class="admin-companion-input w-full px-3.5 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500 text-sm" placeholder="${placeholder}" value="${prevVal.replace(/"/g, '&quot;')}">
        </div>
      `;
    }
    inputsBox.innerHTML = html;
  }

  updateViewModeButtons() {
    const btnGroups = document.getElementById("btn-admin-view-groups");
    const btnAll = document.getElementById("btn-admin-view-all");
    if (!btnGroups || !btnAll) return;

    if (this.viewMode === "groups") {
      btnGroups.className = "px-3 py-1.5 rounded-lg bg-white font-semibold text-amber-900 shadow-xs flex items-center gap-1.5 transition";
      btnAll.className = "px-3 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1.5 transition";
    } else {
      btnAll.className = "px-3 py-1.5 rounded-lg bg-white font-semibold text-amber-900 shadow-xs flex items-center gap-1.5 transition";
      btnGroups.className = "px-3 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1.5 transition";
    }
  }

  parseGuestInfo(g) {
    let rawName = (g.name || "").trim();
    let titular = rawName.replace(/\s*\(\+.*?\)\s*$/, "").trim() || rawName || "Convidado";
    let companions = Array.isArray(g.companions) ? g.companions.map(c => typeof c === "string" ? c.trim() : "").filter(Boolean) : [];

    if (companions.length === 0 && rawName.includes("(+")) {
      const match = rawName.match(/\(\+\s*(.*?)\)/);
      if (match && match[1]) {
        companions = match[1].split(",").map(c => c.trim()).filter(Boolean);
      }
    }

    const matchCount = (g.count || "").match(/\d+/);
    const declaredCount = matchCount ? parseInt(matchCount[0], 10) : 1;
    const totalPeople = Math.max(declaredCount, 1 + companions.length);

    return {
      id: g.id,
      rawName,
      titular,
      companions,
      totalPeople,
      countStr: g.count || `${totalPeople} pessoas`,
      date: g.date || "Data não informada",
      message: g.message || ""
    };
  }

  renderAttendedModeration(searchTerm = "") {
    const listContainer = document.getElementById("admin-attended-list") || document.getElementById("admin-attended-container");
    if (!listContainer) return;

    const rawList = WeddingStore.getAttendedGuests();
    const parsedList = rawList.map(g => this.parseGuestInfo(g));

    // Métricas gerais calculadas
    let totalGroups = parsedList.length;
    let totalTitulares = parsedList.length;
    let totalCompanions = parsedList.reduce((acc, cur) => acc + cur.companions.length, 0);
    let totalPeople = parsedList.reduce((acc, cur) => acc + cur.totalPeople, 0);
    let lastDate = parsedList.length > 0 ? parsedList[0].date : "Nenhuma ainda";

    const elTotalGroups = document.getElementById("admin-attended-total-groups");
    const elTotalTitulares = document.getElementById("admin-attended-total-titulares");
    const elTotalCompanions = document.getElementById("admin-attended-total-companions");
    const elTotalPeople = document.getElementById("admin-attended-total-people");
    const elLastDate = document.getElementById("admin-attended-last-date");
    const counterDisplay = document.getElementById("admin-attended-counter-display");

    if (elTotalGroups) elTotalGroups.textContent = totalGroups;
    if (elTotalTitulares) elTotalTitulares.textContent = totalTitulares;
    if (elTotalCompanions) elTotalCompanions.textContent = totalCompanions;
    if (elTotalPeople) elTotalPeople.textContent = `${totalPeople} pessoas`;
    if (elLastDate) {
      elLastDate.textContent = lastDate !== "Nenhuma ainda" ? `Última: ${lastDate}` : "";
    }

    // Filtro de busca (busca por titular, por acompanhante, por data ou mensagem)
    let filteredList = parsedList;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredList = parsedList.filter(g =>
        g.titular.toLowerCase().includes(term) ||
        g.companions.some(c => c.toLowerCase().includes(term)) ||
        g.date.toLowerCase().includes(term) ||
        g.message.toLowerCase().includes(term)
      );
    }

    if (counterDisplay) {
      counterDisplay.textContent = searchTerm
        ? `${filteredList.length} confirmação(ões) encontrada(s) para "${searchTerm}"`
        : `Total de ${totalGroups} grupo(s) e ${totalPeople} pessoa(s) confirmada(s)`;
    }

    if (filteredList.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <span class="text-4xl mb-3 block">📋</span>
          <h4 class="font-serif font-bold text-stone-700 text-base">
            ${searchTerm ? "Nenhuma confirmação encontrada para a busca" : "Nenhuma presença confirmada no momento"}
          </h4>
          <p class="text-xs text-stone-400 mt-1.5 max-w-md mx-auto">
            ${searchTerm
              ? "Tente buscar por outro nome de titular, convidado adicionado ou data."
              : "Assim que os convidados confirmarem pelo WhatsApp no site ou forem adicionados manualmente acima, todos os nomes e convidados adicionados aparecerão aqui organizados."}
          </p>
        </div>
      `;
      return;
    }

    // Modo 1: Visão por Famílias / Confirmações
    if (this.viewMode === "groups") {
      listContainer.innerHTML = filteredList.map((g, idx) => `
        <div class="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white hover:border-amber-300 transition-all shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex items-start gap-3.5 flex-1">
            <div class="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-serif font-bold text-amber-900 text-sm shrink-0 mt-0.5">
              ${idx + 1}
            </div>
            <div class="space-y-2 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Responsável:</span>
                <h4 class="font-serif font-bold text-stone-900 text-base sm:text-lg">${g.titular}</h4>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  👥 Total: ${g.totalPeople} ${g.totalPeople === 1 ? "pessoa" : "pessoas"}
                </span>
              </div>

              <!-- Lista de Convidados que foram adicionados -->
              ${g.companions.length > 0 ? `
                <div class="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <div class="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <span>👥</span>
                    <span>Convidados que foram adicionados (${g.companions.length}):</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    ${g.companions.map(comp => `
                      <span class="inline-flex items-center gap-1.5 bg-white text-stone-800 px-3 py-1 rounded-lg border border-amber-300 text-xs font-medium shadow-2xs">
                        <span class="text-amber-600 font-bold">✓</span>
                        <span class="font-semibold">${comp}</span>
                      </span>
                    `).join("")}
                  </div>
                </div>
              ` : `
                <div class="text-xs text-stone-400 italic">
                  Apenas o titular (sem convidados adicionados)
                </div>
              `}

              ${g.message ? `
                <p class="text-xs text-stone-600 italic bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/60 inline-block">
                  💬 "${g.message}"
                </p>
              ` : ""}
            </div>
          </div>

          <div class="flex items-center justify-between md:flex-col md:items-end gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
            <span class="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-flex items-center gap-1 shadow-2xs">
              <span>📅</span> ${g.date}
            </span>
            <button onclick="adminPanel.deleteAttended('${g.id}')" class="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 text-xs" title="Excluir da Lista">
              <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span class="md:hidden text-rose-600 font-medium">Excluir</span>
            </button>
          </div>
        </div>
      `).join("");
      return;
    }

    // Modo 2: Lista Completa de Todos os Nomes Individuais (Titulares + Convidados Adicionados)
    const allIndividualNames = [];
    filteredList.forEach(g => {
      allIndividualNames.push({
        name: g.titular,
        type: "titular",
        responsible: g.titular,
        date: g.date
      });
      g.companions.forEach(comp => {
        allIndividualNames.push({
          name: comp,
          type: "companion",
          responsible: g.titular,
          date: g.date
        });
      });
    });

    // Ordenação alfabética de todos os nomes
    allIndividualNames.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    listContainer.innerHTML = `
      <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div class="px-4 py-3 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between text-xs">
          <span class="font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <span>👥</span> Lista Nominal de Todos os Nomes Confirmados
          </span>
          <span class="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Total: ${allIndividualNames.length} pessoas
          </span>
        </div>
        <div class="divide-y divide-stone-100">
          ${allIndividualNames.map((person, idx) => `
            <div class="px-4 py-3 flex items-center justify-between text-xs sm:text-sm hover:bg-amber-50/30 transition">
              <div class="flex items-center gap-3">
                <span class="w-6 text-stone-400 font-mono text-xs text-right">${idx + 1}.</span>
                <span class="font-bold text-stone-800">${person.name}</span>
                ${person.type === "titular"
                  ? `<span class="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-semibold border border-stone-200">Titular</span>`
                  : `<span class="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold border border-amber-200">Convidado de: ${person.responsible}</span>`
                }
              </div>
              <span class="text-[11px] text-stone-400 hidden sm:inline font-mono">${person.date}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  deleteAttended(id) {
    if (confirm("Deseja remover esta confirmação da lista?")) {
      WeddingStore.deleteAttendedGuest(id);
      showToast("Confirmação removida com sucesso.");
      this.renderAttendedModeration(document.getElementById("admin-attended-search")?.value.trim() || "");
      this.renderMetrics();
    }
  }

  copyAttendedList() {
    const rawList = WeddingStore.getAttendedGuests();
    if (rawList.length === 0) {
      alert("A lista de presenças está vazia no momento.");
      return;
    }

    const parsedList = rawList.map(g => this.parseGuestInfo(g));
    const totalGroups = parsedList.length;
    const totalPeople = parsedList.reduce((acc, cur) => acc + cur.totalPeople, 0);

    const allNames = [];
    parsedList.forEach(g => {
      allNames.push({ name: g.titular, type: "Titular" });
      g.companions.forEach(c => {
        allNames.push({ name: c, type: `Convidado de ${g.titular}` });
      });
    });
    allNames.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    let text = `📋 LISTA DE PRESENÇAS CONFIRMADAS - BODAS DE OURO JOSÉ & CIDA\n`;
    text += `Total de confirmações: ${totalGroups} grupos | Total de pessoas: ${totalPeople}\n`;
    text += `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}\n`;
    text += `==============================================\n\n`;

    text += `📌 1. DETALHAMENTO POR CONFIRMAÇÕES / FAMÍLIAS:\n`;
    parsedList.forEach((g, i) => {
      text += `\n${i + 1}. RESPONSÁVEL: ${g.titular} (${g.totalPeople} pessoas)\n`;
      if (g.companions.length > 0) {
        text += `   👥 Convidados adicionados: ${g.companions.join(", ")}\n`;
      } else {
        text += `   👥 Apenas o titular\n`;
      }
      text += `   📅 Confirmado em: ${g.date}\n`;
      if (g.message) text += `   💬 Mensagem: "${g.message}"\n`;
    });

    text += `\n\n==============================================\n`;
    text += `👥 2. LISTA NOMINAL DE TODAS AS PESSOAS CONFIRMADAS (${allNames.length} NOMES):\n`;
    allNames.forEach((p, idx) => {
      text += `${idx + 1}. ${p.name} (${p.type})\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      showToast("Lista completa de presenças copiada com sucesso! 📋");
    }).catch(() => {
      alert("Lista copiada:\n\n" + text);
    });
  }

  printAttendedList() {
    const rawList = WeddingStore.getAttendedGuests();
    if (rawList.length === 0) {
      alert("A lista de presenças está vazia no momento.");
      return;
    }

    let printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita janelas pop-up para imprimir a lista.");
      return;
    }

    const parsedList = rawList.map(g => this.parseGuestInfo(g));
    const totalGroups = parsedList.length;
    const totalPeople = parsedList.reduce((acc, cur) => acc + cur.totalPeople, 0);

    const allNames = [];
    parsedList.forEach(g => {
      allNames.push({ name: g.titular, type: "Titular", responsible: g.titular });
      g.companions.forEach(c => {
        allNames.push({ name: c, type: `Convidado`, responsible: g.titular });
      });
    });
    allNames.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Presenças - Bodas de Ouro José & Cida</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #222; line-height: 1.5; }
          h1 { color: #854d0e; margin-bottom: 4px; font-size: 22px; }
          h2 { color: #854d0e; margin-top: 25px; margin-bottom: 8px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          p { margin: 4px 0 16px 0; font-size: 13px; color: #666; }
          .summary { background: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; color: #475569; }
          tr:nth-child(even) { background: #f9fafb; }
          .badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-weight: 600; font-size: 11px; }
          .tag-comp { display: inline-block; background: #fef3c7; color: #78350f; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin: 1px 2px; }
          .checkbox-col { width: 30px; text-align: center; }
          .box { width: 14px; height: 14px; border: 1px solid #999; display: inline-block; border-radius: 2px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>🥂 Bodas de Ouro: José & Cida (50 Anos)</h1>
        <p>Relatório de Convidados Confirmados • Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        <div class="summary">
          Total de Confirmações: ${totalGroups} grupos | Total Geral de Pessoas Confirmadas: ${totalPeople} convidados
        </div>

        <h2>1. Detalhamento por Famílias / Grupos</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 35px">#</th>
              <th>Titular / Responsável</th>
              <th>Convidados Adicionados</th>
              <th style="width: 90px">Total</th>
              <th style="width: 150px">Data da Confirmação</th>
              <th>Observação / Recado</th>
            </tr>
          </thead>
          <tbody>
            ${parsedList.map((g, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${g.titular}</strong></td>
                <td>
                  ${g.companions.length > 0
                    ? g.companions.map(c => `<span class="tag-comp">${c}</span>`).join(" ")
                    : "<span style='color:#999; font-size:11px'>Apenas o titular</span>"}
                </td>
                <td><span class="badge">${g.totalPeople} ${g.totalPeople === 1 ? "pessoa" : "pessoas"}</span></td>
                <td>${g.date}</td>
                <td>${g.message || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h2>2. Lista Nominal Completa (Checklist para Entrada / Portaria)</h2>
        <table>
          <thead>
            <tr>
              <th class="checkbox-col">Visto</th>
              <th style="width: 35px">#</th>
              <th>Nome Completo do Convidado</th>
              <th>Tipo / Vínculo</th>
              <th>Data Confirmação</th>
            </tr>
          </thead>
          <tbody>
            ${allNames.map((person, i) => `
              <tr>
                <td class="checkbox-col"><span class="box"></span></td>
                <td>${i + 1}</td>
                <td><strong>${person.name}</strong></td>
                <td>${person.type === "Titular" ? "Titular / Responsável" : `Convidado de ${person.responsible}`}</td>
                <td>${person.date || "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="margin-top: 25px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #b45309; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">
            Imprimir Agora
          </button>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  renderPhotosList() {
    const container = document.getElementById("admin-photos-list");
    if (!container) return;

    const wedding = WeddingStore.getWeddingGallery("todos");

    container.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs uppercase tracking-wider font-bold text-stone-600">Fotos no Álbum das Bodas (${wedding.length})</h4>
          <span class="text-xs text-stone-400">Passe o mouse na foto para excluir</span>
        </div>
        ${wedding.length === 0 ? `
          <p class="text-xs text-stone-400 italic py-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
            Nenhuma foto no álbum ainda. Utilize o formulário acima para adicionar fotos!
          </p>
        ` : `
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            ${wedding.map(p => `
              <div class="relative group rounded-xl overflow-hidden border border-stone-200 h-32 bg-stone-100 shadow-sm">
                <img src="${p.image}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2.5 text-white text-xs">
                  <span class="font-semibold line-clamp-1">${p.title}</span>
                  <button onclick="adminPanel.deleteWedPhoto('${p.id}')" class="self-end bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold transition">
                    Excluir
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
  }

  handleAddPhoto() {
    const title = document.getElementById("admin-photo-title").value.trim();
    const category = document.getElementById("admin-photo-category").value;
    const url = document.getElementById("admin-photo-url").value.trim();
    const caption = document.getElementById("admin-photo-caption").value.trim();

    if (!url) {
      alert("Por favor, forneça o link da foto.");
      return;
    }

    WeddingStore.addWeddingPhoto({ title: title || "Momento Inesquecível", category, image: url, caption });

    showToast("Foto adicionada com sucesso ao álbum das Bodas! 📸");
    document.getElementById("admin-add-photo-form").reset();
    this.renderPhotosList();
  }

  deleteMoment(id) {
    if (confirm("Remover esta foto de Nossos Momentos?")) {
      WeddingStore.deleteMomentPhoto(id);
      this.renderPhotosList();
      showToast("Foto removida.");
    }
  }

  deleteWedPhoto(id) {
    if (confirm("Remover esta foto do Casamento?")) {
      WeddingStore.deleteWeddingPhoto(id);
      this.renderPhotosList();
      showToast("Foto removida.");
    }
  }

  renderStoryList() {
    const container = document.getElementById("admin-story-list");
    if (!container) return;

    const story = WeddingStore.getStoryMilestones();
    container.innerHTML = story.map(m => `
      <div class="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="text-2xl">${m.icon}</span>
          <div>
            <h5 class="font-semibold text-stone-800 text-sm">${m.title} <span class="text-xs font-normal text-stone-400">(${m.date})</span></h5>
            <p class="text-xs text-stone-500 line-clamp-1">${m.description}</p>
          </div>
        </div>
        <button onclick="adminPanel.deleteStory('${m.id}')" class="text-rose-600 hover:bg-rose-50 p-2 rounded-lg text-sm transition">
          🗑️
        </button>
      </div>
    `).join("");
  }

  handleAddStory() {
    const icon = document.getElementById("admin-story-icon").value || "❤️";
    const title = document.getElementById("admin-story-title").value.trim();
    const date = document.getElementById("admin-story-date").value.trim();
    const image = document.getElementById("admin-story-image").value.trim();
    const description = document.getElementById("admin-story-desc").value.trim();

    if (!title || !description) {
      alert("Por favor, preencha o título e a descrição do momento.");
      return;
    }

    WeddingStore.addStoryMilestone({
      icon,
      title,
      date: date || "Data Especial",
      image: image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      description
    });

    showToast("Novo capítulo adicionado à história do casal! 📖❤️");
    document.getElementById("admin-add-story-form").reset();
    this.renderStoryList();
  }

  deleteStory(id) {
    if (confirm("Deseja apagar este marco da história?")) {
      WeddingStore.deleteStoryMilestone(id);
      this.renderStoryList();
      showToast("Marco removido.");
    }
  }
}

let adminPanel;
