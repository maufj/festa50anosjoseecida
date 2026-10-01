/**
 * STORE.JS - Gerenciador Central de Estado e Persistência
 * Suporta LocalStorage, sincronização em tempo real e moderação de convidados.
 */

const STORAGE_KEY = "BODAS_50_ANOS_JOSE_CIDA_V5";

class WeddingStoreClass {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("BODAS_50_ANOS_JOSE_CIDA_V4");
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedSettings = parsed.settings || {};
        if (!savedSettings.musicUrl) {
          savedSettings.musicUrl = DEFAULT_WEDDING_DATA.settings.musicUrl;
        }
        if (!savedSettings.musicTitle || savedSettings.musicTitle.includes("Thousand Years")) {
          savedSettings.musicTitle = DEFAULT_WEDDING_DATA.settings.musicTitle;
        }

        // Senha de acesso da Área da Família: Aline@01
        savedSettings.adminPin = "Aline@01";

        // Atualiza endereço para Marília - SP caso ainda conste Brasília em cache
        if (!savedSettings.venueAddress || savedSettings.venueAddress.includes("Brasília") || savedSettings.venueAddress.includes("Brasilia")) {
          savedSettings.venueAddress = DEFAULT_WEDDING_DATA.settings.venueAddress;
          savedSettings.venueGoogleMapsUrl = DEFAULT_WEDDING_DATA.settings.venueGoogleMapsUrl;
          savedSettings.venueWazeUrl = DEFAULT_WEDDING_DATA.settings.venueWazeUrl;
          savedSettings.venueMapQuery = DEFAULT_WEDDING_DATA.settings.venueMapQuery;
        }

        // Garante que seções removidas permaneçam desativadas
        const visibility = { ...DEFAULT_WEDDING_DATA.settings.sectionsVisibility, ...(savedSettings.sectionsVisibility || {}) };
        visibility.story = false;
        visibility.moments = false;
        visibility.weddingPhotos = true;
        visibility.guestPhotos = false;
        visibility.messages = false;
        visibility.gifts = true;
        savedSettings.sectionsVisibility = visibility;

        return {
          settings: { ...DEFAULT_WEDDING_DATA.settings, ...savedSettings },
          storyMilestones: parsed.storyMilestones || DEFAULT_WEDDING_DATA.storyMilestones,
          momentsGallery: parsed.momentsGallery || DEFAULT_WEDDING_DATA.momentsGallery,
          weddingGallery: parsed.weddingGallery || DEFAULT_WEDDING_DATA.weddingGallery,
          guestPhotos: parsed.guestPhotos || DEFAULT_WEDDING_DATA.guestPhotos,
          attendedGuests: parsed.attendedGuests || DEFAULT_WEDDING_DATA.attendedGuests,
          messages: parsed.messages || DEFAULT_WEDDING_DATA.messages,
          giftRegistry: parsed.giftRegistry || DEFAULT_WEDDING_DATA.giftRegistry
        };
      }
    } catch (e) {
      console.warn("Erro ao carregar do localStorage, utilizando valores padrão:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_WEDDING_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error("Erro ao salvar no localStorage (possível limite de cota de fotos):", e);
      throw e;
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.state);
      } catch (err) {
        console.error("Erro em subscriber:", err);
      }
    });
  }

  // Configurações
  getSettings() {
    return this.state.settings;
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveState();
  }

  setTheme(themeName) {
    this.state.settings.activeTheme = themeName;
    this.saveState();
  }

  toggleSection(sectionKey, isVisible) {
    if (!this.state.settings.sectionsVisibility) {
      this.state.settings.sectionsVisibility = {};
    }
    this.state.settings.sectionsVisibility[sectionKey] = isVisible;
    this.saveState();
  }

  // Linha do tempo
  getStoryMilestones() {
    return this.state.storyMilestones;
  }

  addStoryMilestone(milestone) {
    const newItem = {
      id: "story-" + Date.now(),
      ...milestone
    };
    this.state.storyMilestones.push(newItem);
    this.saveState();
    return newItem;
  }

  updateStoryMilestone(id, updated) {
    this.state.storyMilestones = this.state.storyMilestones.map(m => m.id === id ? { ...m, ...updated } : m);
    this.saveState();
  }

  deleteStoryMilestone(id) {
    this.state.storyMilestones = this.state.storyMilestones.filter(m => m.id !== id);
    this.saveState();
  }

  // Nossos Momentos (Pré-casamento)
  getMomentsGallery(category = "todos") {
    if (category === "todos") return this.state.momentsGallery;
    return this.state.momentsGallery.filter(item => item.category === category);
  }

  addMomentPhoto(photo) {
    const newPhoto = {
      id: "mom-" + Date.now(),
      ...photo
    };
    this.state.momentsGallery.unshift(newPhoto);
    this.saveState();
    return newPhoto;
  }

  deleteMomentPhoto(id) {
    this.state.momentsGallery = this.state.momentsGallery.filter(p => p.id !== id);
    this.saveState();
  }

  // Fotos do Casamento
  getWeddingGallery(category = "todos") {
    if (category === "todos") return this.state.weddingGallery;
    return this.state.weddingGallery.filter(item => item.category === category);
  }

  addWeddingPhoto(photo) {
    const newPhoto = {
      id: "wed-" + Date.now(),
      ...photo
    };
    this.state.weddingGallery.unshift(newPhoto);
    this.saveState();
    return newPhoto;
  }

  deleteWeddingPhoto(id) {
    this.state.weddingGallery = this.state.weddingGallery.filter(p => p.id !== id);
    this.saveState();
  }

  // Fotos dos Convidados com Fila de Moderação
  getGuestPhotos(onlyApproved = true) {
    if (onlyApproved) {
      return this.state.guestPhotos.filter(p => p.status === "approved");
    }
    return this.state.guestPhotos;
  }

  addGuestPhoto({ guestName, message, image }) {
    const newPhoto = {
      id: "gp-" + Date.now(),
      guestName: guestName.trim() || "Convidado Especial",
      message: message ? message.trim() : "",
      image,
      date: new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "pending" // Fica aguardando aprovação dos noivos
    };
    this.state.guestPhotos.unshift(newPhoto);
    this.saveState();
    return newPhoto;
  }

  approveGuestPhoto(id) {
    this.state.guestPhotos = this.state.guestPhotos.map(p => p.id === id ? { ...p, status: "approved" } : p);
    this.saveState();
  }

  rejectGuestPhoto(id) {
    this.state.guestPhotos = this.state.guestPhotos.map(p => p.id === id ? { ...p, status: "rejected" } : p);
    this.saveState();
  }

  deleteGuestPhoto(id) {
    this.state.guestPhotos = this.state.guestPhotos.filter(p => p.id !== id);
    this.saveState();
  }

  // Mural: "Eu fui ao casamento! 💍"
  getAttendedGuests() {
    return this.state.attendedGuests;
  }

  addAttendedGuest({ name, photo, message, count, date }) {
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    const newGuest = {
      id: "att-" + Date.now(),
      name: (name || "Amigo Querido").trim(),
      count: count || "1 pessoa",
      photo: photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      message: message ? message.trim() : "Presença confirmada nas Bodas de Ouro! 💛",
      date: date || dateFormatted,
      timestamp: Date.now()
    };
    this.state.attendedGuests.unshift(newGuest);
    this.saveState();
    return newGuest;
  }

  deleteAttendedGuest(id) {
    this.state.attendedGuests = this.state.attendedGuests.filter(g => g.id !== id);
    this.saveState();
  }

  // Mural de Mensagens aos Noivos
  getMessages(onlyApproved = true) {
    if (onlyApproved) {
      return this.state.messages.filter(m => m.status !== "rejected");
    }
    return this.state.messages;
  }

  addMessage({ name, text }) {
    const newMsg = {
      id: "msg-" + Date.now(),
      name: name.trim() || "Anônimo Carinhoso",
      text: text.trim(),
      date: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      hearts: 1,
      status: "approved"
    };
    this.state.messages.unshift(newMsg);
    this.saveState();
    return newMsg;
  }

  likeMessage(id) {
    this.state.messages = this.state.messages.map(m => {
      if (m.id === id) {
        return { ...m, hearts: (m.hearts || 0) + 1 };
      }
      return m;
    });
    this.saveState();
  }

  deleteMessage(id) {
    this.state.messages = this.state.messages.filter(m => m.id !== id);
    this.saveState();
  }

  // Lista de Presentes
  getGiftRegistry() {
    return this.state.giftRegistry;
  }

  addGift(gift) {
    const newGift = {
      id: "gift-" + Date.now(),
      ...gift
    };
    this.state.giftRegistry.push(newGift);
    this.saveState();
    return newGift;
  }

  updateGift(id, updated) {
    this.state.giftRegistry = this.state.giftRegistry.map(g => g.id === id ? { ...g, ...updated } : g);
    this.saveState();
  }

  deleteGift(id) {
    this.state.giftRegistry = this.state.giftRegistry.filter(g => g.id !== id);
    this.saveState();
  }

  // Estatísticas para o painel
  getStats() {
    const totalGuestPhotos = this.state.guestPhotos.length;
    const pendingGuestPhotos = this.state.guestPhotos.filter(p => p.status === "pending").length;
    const totalAttended = this.state.attendedGuests.length;
    const totalMessages = this.state.messages.length;
    const totalGifts = this.state.giftRegistry.length;

    return {
      totalGuestPhotos,
      pendingGuestPhotos,
      totalAttended,
      totalMessages,
      totalGifts
    };
  }

  // Resetar para demonstração original
  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_WEDDING_DATA));
    this.saveState();
  }
}

const WeddingStore = new WeddingStoreClass();
