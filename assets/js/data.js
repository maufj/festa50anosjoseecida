/**
 * DATA.JS - Dados Iniciais das Bodas de Ouro (50 Anos de Casamento)
 * Casal: José & Cida (José Ferreira e Maria Aparecida)
 * Jubileu de Ouro: Cinco décadas de amor, fé, cumplicidade e família.
 */

const DEFAULT_WEDDING_DATA = {
  settings: {
    groomName: "José",
    brideName: "Cida",
    coupleInitials: "J & C",
    heroTitle: "Bodas de Ouro • 50 Anos de Amor! 💛",
    heroSubtitle: "Cinco décadas de cumplicidade, fé, família e uma linda história compartilhada.",
    weddingDate: "2026-12-19T18:00:00", // Formato ISO para contagem regressiva precisa
    eventTime: "18:00h",
    venueName: "Parô Eventos",
    venueAddress: "Rua Dolores Peres Garcia, 33 - Jardim Marambaia, Marília - SP",
    venueMapQuery: "Paro Eventos Marilia SP",
    venueGoogleMapsUrl: "https://www.google.com/maps/place/Par%C3%B4+Eventos/@-22.251273,-49.8849399,17z/data=!3m1!4b1!4m6!3m5!1s0x94bfdb80eb15775f:0x2ecaa4eed9b1266b!8m2!3d-22.251278!4d-49.882365!16s%2Fg%2F11vsnvxx7q?entry=tts&g_ep=EgoyMDI2MTAwNC4wIPu8ASoASAFQAw%3D%3D&skid=fe0ebe10-c6ba-4e27-9d27-1c3ac9a5cb0c",
    venueWazeUrl: "https://waze.com/ul?ll=-22.251278,-49.882365&navigate=yes",
    dressCode: "",
    pixKey: "00020126540014BR.GOV.BCB.PIX0111420695178020217Bodas José e Cida5204000053039865802BR5922Aline Piedade da Silva6009SAO PAULO62140510wmFFX92nN263049E4B",
    pixKeyType: "Copia e Cola",
    pixRecipient: "Aline Piedade da Silva",
    musicTitle: "Como É Grande O Meu Amor Por Você",
    musicUrl: "assets/audio/como-e-grande-o-meu-amor-por-voce.mp3",
    whatsappNumber: "5514996712219", // WhatsApp cadastrado para confirmação de presença (com DDD)
    whatsappMessage: "Olá! Gostaria de confirmar minha presença na celebração das Bodas de Ouro de José & Cida (19/12/2026)! 🥂💛",
    activeTheme: "theme-gold", // theme-gold, theme-rose, theme-sage, theme-champagne
    adminPin: "Aline@01",
    sectionsVisibility: {
      hero: true,
      countdown: true,
      story: false,
      moments: false,
      bigDay: true,
      weddingPhotos: true,
      guestPhotos: false,
      attended: true,
      messages: false,
      gifts: true,
      venue: true,
      music: true,
      finalMessage: true
    }
  },

  // Linha do tempo: 50 Anos de História
  storyMilestones: [
    {
      id: "story-1",
      icon: "💑",
      title: "O Primeiro Encontro (1976)",
      date: "14 de Maio de 1976",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
      description: "Foi em uma festa na cidade que nossos olhares se cruzaram pela primeira vez. Uma conversa tímida, um sorriso sincero e a certeza imediata de que Deus estava desenhando o encontro das nossas vidas."
    },
    {
      id: "story-2",
      icon: "💒",
      title: "O Nosso Sagrado 'Sim' no Altar",
      date: "27 de Novembro de 1976",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
      description: "Com a bênção de nossos pais e sob o altar da igreja, juramos amor eterno. Começamos nossa caminhada simples, cheios de sonhos, união e a disposição de vencer qualquer desafio juntos."
    },
    {
      id: "story-3",
      icon: "🏡",
      title: "A Construção do Nosso Lar e a Chegada dos Filhos",
      date: "Anos 80",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
      description: "Nossa casa se encheu de vida e risadas com a chegada dos nossos queridos filhos. Foram anos de trabalho duro, almoços barulhentos de domingo e a construção de valores que guiam nossa família até hoje."
    },
    {
      id: "story-4",
      icon: "✨",
      title: "Bodas de Prata (25 Anos) e a Chegada dos Netos",
      date: "Ano de 2001",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
      description: "Comemoramos 25 anos de amor inabalável! Nessa fase especial, fomos abençoados com o nascimento dos nossos primeiros netos, que renovaram nossos corações com uma doçura sem igual."
    },
    {
      id: "story-5",
      icon: "👑",
      title: "O Jubileu de Ouro: 50 Anos de Bênçãos (2026)",
      date: "2026 - 50 Anos de Casamento!",
      image: "assets/images/hero-elderly-hands.jpg",
      description: "Meio século caminhando de mãos dadas! Hoje olhamos para trás com o coração cheio de gratidão a Deus e contemplamos a nossa maior riqueza: nossa família unida, nossos filhos, netos, bisnetos e amigos."
    }
  ],

  // Nossos Momentos (Memórias de uma Vida Inteira)
  momentsGallery: [
    {
      id: "mom-1",
      title: "Ensaio Comemorativo das Bodas de Ouro",
      category: "momentos",
      image: "assets/images/hero-elderly-hands-table.jpg",
      caption: "O mesmo olhar apaixonado de 50 anos atrás, agora com a sabedoria do tempo."
    },
    {
      id: "mom-2",
      title: "Almoço Tradicional de Domingo",
      category: "familia",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
      caption: "A mesa farta da Dona Cida e as cantorias do Seu José que reúnem todas as gerações."
    },
    {
      id: "mom-3",
      title: "Viagem Inesquecível a Dois",
      category: "viagens",
      image: "https://images.unsplash.com/photo-1510414842594-a61752afb394?auto=format&fit=crop&w=900&q=80",
      caption: "Descobrindo novos horizontes e colecionando paisagens pelo Brasil afora."
    },
    {
      id: "mom-4",
      title: "Alegria e Cumplicidade Diária",
      category: "momentos",
      image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
      caption: "O segredo de 50 anos: rir juntos de tudo e nunca perder a gentileza."
    },
    {
      id: "mom-5",
      title: "Natal e Celebrações em Família",
      category: "datas",
      image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=900&q=80",
      caption: "A verdadeira riqueza da vida: a sala cheia de filhos, netos e bisnetos."
    },
    {
      id: "mom-6",
      title: "Nossas Mãos que Construíram Essa História",
      category: "momentos",
      image: "assets/images/hero-elderly-hands.jpg",
      caption: "Cinco décadas entrelaçadas em oração, apoio mútuo e carinho infindável."
    }
  ],

  // Fotos da Celebração das Bodas de Ouro
  weddingGallery: [
    {
      id: "wed-1",
      title: "A Renovação dos Votos no Altar",
      category: "cerimonia",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
      caption: "Renovando as promessas de 1976 com a mesma emoção e devoção."
    },
    {
      id: "wed-2",
      title: "O Brinde Dourado dos 50 Anos",
      category: "festa",
      image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
      caption: "Brindando ao amor verdadeiro, à saúde e a cada memória compartilhada."
    },
    {
      id: "wed-3",
      title: "José & Cida: Eternos Namorados",
      category: "noivos",
      image: "assets/images/hero-elderly-hands-table.jpg",
      caption: "O brilho nos olhos de quem construiu uma história de honra e união."
    },
    {
      id: "wed-4",
      title: "A Bênção com Filhos e Netos",
      category: "familia",
      image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80",
      caption: "O maior legado de meio século: três gerações abraçadas em amor."
    },
    {
      id: "wed-5",
      title: "A Valsa das Bodas de Ouro",
      category: "danca",
      image: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=900&q=80",
      caption: "Dançando como se fosse o primeiro baile na primavera de 1976."
    },
    {
      id: "wed-6",
      title: "Corte do Bolo Dourado de 50 Anos",
      category: "festa",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
      caption: "Celebrando 50 anos de doçura, respeito e momentos inesquecíveis."
    },
    {
      id: "wed-7",
      title: "Amigos de Uma Vida Inteira",
      category: "padrinhos",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
      caption: "Amizades leais que caminharam ao nosso lado desde a juventude."
    },
    {
      id: "wed-8",
      title: "Chuva de Ouro e Brilhos",
      category: "especiais",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
      caption: "Uma festa abençoada e inesquecível para comemorar o Jubileu de Ouro!"
    }
  ],

  // Fotos enviadas pelos convidados
  guestPhotos: [
    {
      id: "gp-1",
      guestName: "Filhos Marcos e Luciana",
      message: "Pai e mãe, que bênção gigantesca testemunhar esses 50 anos de casamento de vocês! O amor de vocês é o nosso maior farol e orgulho. Parabéns pelas Bodas de Ouro!",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
      date: "2026-12-19 21:40",
      status: "approved"
    },
    {
      id: "gp-2",
      guestName: "Netos Pedro, Júlia e Sofia",
      message: "Vovô José e Vovó Cida, ver vocês dançando a valsa de 50 anos encheu nossos olhos de lágrimas de alegria! Amamos vocês com todo nosso coração!",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      date: "2026-12-19 20:15",
      status: "approved"
    }
  ],

  // Lista de Presenças Confirmadas (inicia vazia para controle real das confirmações)
  attendedGuests: [],

  // Mural de Mensagens de Carinho aos Homenageados
  messages: [
    {
      id: "msg-1",
      name: "Filhos, Noras e Genros",
      text: "Queridos pai e mãe, 50 anos de dedicação, fé, paciência e amor verdadeiro. Vocês nos ensinaram que família é o maior tesouro da terra. Amamos vocês infinitamente!",
      date: "Hoje às 15:30",
      hearts: 28,
      status: "approved"
    },
    {
      id: "msg-2",
      name: "Netos e Bisnetos",
      text: "Vovô Zé e Vovó Cida, obrigado por cada história contada, por cada almoço delicioso e por nos mostrarem que o amor dura a vida inteira! Viva as Bodas de Ouro! 💛👑",
      date: "Hoje às 14:10",
      hearts: 35,
      status: "approved"
    },
    {
      id: "msg-3",
      name: "Amigos de Longa Data",
      text: "Ver o José e a Cida completarem meio século de companheirismo com esse sorriso lindo renova as esperanças de qualquer um. Parabéns ao nosso casal favorito!",
      date: "Ontem às 19:20",
      hearts: 22,
      status: "approved"
    }
  ],

  // Lista de Presentes (Desativada)
  giftRegistry: []
};
