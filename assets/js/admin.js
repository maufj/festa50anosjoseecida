/**
 * ADMIN.JS - Painel de Controle dos Noivos
 * Gerencia autenticação, configurações, moderação de fotos e mensagens, e personalização.
 */

class WeddingAdminPanel {
  constructor() {
    window.adminPanel = this;
    this.isAuthenticated = sessionStorage.getItem("WEDDING_ADMIN_AUTH") === "true";
    this.currentTab = "attended";
    this.init();
  }

  init() {
    this.bindEvents();
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
          alert("Por favor, digite o nome do convidado.");
          return;
        }

        const now = new Date();
        const dateStr = customDate || `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

        WeddingStore.addAttendedGuest({
          name,
          count,
          date: dateStr,
          message: msg || `Presença confirmada (${count})`
        });

        addAttendedForm.reset();
        this.renderAttendedModeration();
        this.renderMetrics();
        showToast("Convidado confirmado adicionado à lista com sucesso! ✅");
      });
    }

    // Busca rápida de presenças por nome ou dia
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

  renderAttendedModeration(searchTerm = "") {
    const listContainer = document.getElementById("admin-attended-list") || document.getElementById("admin-attended-container");
    if (!listContainer) return;

    let attended = WeddingStore.getAttendedGuests();

    // Atualiza contadores de métricas
    const totalGroupsEl = document.getElementById("admin-attended-total-groups");
    const totalPeopleEl = document.getElementById("admin-attended-total-people");
    const lastDateEl = document.getElementById("admin-attended-last-date");
    const counterDisplay = document.getElementById("admin-attended-counter-display");

    let totalPeopleCount = 0;
    attended.forEach(g => {
      const match = (g.count || "1").match(/\d+/);
      totalPeopleCount += match ? parseInt(match[0], 10) : 1;
    });

    if (totalGroupsEl) totalGroupsEl.textContent = attended.length;
    if (totalPeopleEl) totalPeopleEl.textContent = `${totalPeopleCount} pessoas`;
    if (lastDateEl) {
      lastDateEl.textContent = attended.length > 0 ? (attended[0].date || "Recentemente") : "Nenhuma ainda";
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      attended = attended.filter(g => 
        (g.name && g.name.toLowerCase().includes(term)) ||
        (g.date && g.date.toLowerCase().includes(term)) ||
        (g.message && g.message.toLowerCase().includes(term))
      );
    }

    if (counterDisplay) {
      counterDisplay.textContent = searchTerm 
        ? `${attended.length} resultado(s) para "${searchTerm}"`
        : `Total de ${attended.length} grupo(s) confirmado(s)`;
    }

    if (attended.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-10 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <span class="text-4xl mb-2 block">📋</span>
          <h4 class="font-serif font-bold text-stone-700 text-base">Nenhuma confirmação encontrada</h4>
          <p class="text-xs text-stone-400 mt-1">
            ${searchTerm ? "Tente buscar por outro nome ou dia." : "As confirmações de presença feitas pelos convidados aparecerão aqui com o nome, quantidade de pessoas e dia/horário exato."}
          </p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = attended.map((g, idx) => `
      <div class="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-300 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-serif font-bold text-amber-900 text-sm shrink-0">
            ${idx + 1}
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h5 class="font-bold text-stone-900 text-sm sm:text-base font-serif">${g.name}</h5>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                👥 ${g.count || "1 pessoa"}
              </span>
            </div>
            ${g.message ? `<p class="text-xs text-stone-600 italic mt-1 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">"${g.message}"</p>` : ""}
          </div>
        </div>

        <div class="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
          <div class="text-right">
            <span class="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-flex items-center gap-1 shadow-sm">
              <span>📅</span> ${g.date || "Data não informada"}
            </span>
          </div>
          <button onclick="adminPanel.deleteAttended('${g.id}')" class="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Excluir da Lista">
            <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    `).join("");
  }

  deleteAttended(id) {
    if (confirm("Deseja remover esta confirmação da lista?")) {
      WeddingStore.deleteAttendedGuest(id);
      showToast("Confirmação removida.");
      this.renderAttendedModeration();
      this.renderMetrics();
    }
  }

  copyAttendedList() {
    const attended = WeddingStore.getAttendedGuests();
    if (attended.length === 0) {
      alert("A lista está vazia.");
      return;
    }

    let totalPeople = 0;
    attended.forEach(g => {
      const match = (g.count || "1").match(/\d+/);
      totalPeople += match ? parseInt(match[0], 10) : 1;
    });

    let text = `📋 LISTA DE PRESENÇAS CONFIRMADAS - BODAS DE OURO JOSÉ & CIDA\n`;
    text += `Total de confirmações: ${attended.length} grupos | Total de pessoas: ${totalPeople}\n`;
    text += `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}\n`;
    text += `==============================================\n\n`;

    attended.forEach((g, i) => {
      text += `${i + 1}. ${g.name} - ${g.count || "1 pessoa"}\n`;
      text += `   📅 Confirmado em: ${g.date || "Data não registrada"}\n`;
      if (g.message) text += `   💬 Mensagem: "${g.message}"\n`;
      text += `\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      showToast("Lista de presenças copiada com sucesso! 📋");
    }).catch(() => {
      alert("Lista copiada:\n\n" + text);
    });
  }

  printAttendedList() {
    const attended = WeddingStore.getAttendedGuests();
    let printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita janelas pop-up para imprimir a lista.");
      return;
    }

    let totalPeopleCount = 0;
    attended.forEach(g => {
      const match = (g.count || "1").match(/\d+/);
      totalPeopleCount += match ? parseInt(match[0], 10) : 1;
    });

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Presenças - Bodas de Ouro José & Cida</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #333; line-height: 1.5; }
          h1 { color: #854d0e; margin-bottom: 4px; font-size: 22px; }
          p { margin: 4px 0 16px 0; font-size: 13px; color: #666; }
          .summary { background: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; color: #475569; }
          tr:nth-child(even) { background: #f9fafb; }
          .badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-weight: 600; font-size: 11px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>🥂 Bodas de Ouro: José & Cida (50 Anos)</h1>
        <p>Relatório de Convidados Confirmados • Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        <div class="summary">
          Total de Confirmações: ${attended.length} grupos | Total de Convidados: ${totalPeopleCount} pessoas
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px">#</th>
              <th>Nome / Família</th>
              <th style="width: 130px">Qtd. Pessoas</th>
              <th style="width: 170px">Dia da Confirmação</th>
              <th>Observação / Recado</th>
            </tr>
          </thead>
          <tbody>
            ${attended.map((g, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${g.name}</strong></td>
                <td><span class="badge">${g.count || "1 pessoa"}</span></td>
                <td>${g.date || "-"}</td>
                <td>${g.message || "-"}</td>
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
