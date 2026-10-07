# 🥂 Site Oficial das Bodas de Ouro: José & Cida (50 Anos de Amor)

Um site comemorativo de alto padrão, elegante, emocionante e totalmente interativo desenvolvido especialmente para celebrar os **50 anos de casamento (Bodas de Ouro)** do casal **José e Cida**.

Reúne um design sofisticado com estética dourada nobre, tipografia refinada, animações suaves de pétalas e brilhos dourados flutuantes, interatividade completa e um **Painel Administrativo protegido por senha**.

---

## ✨ Destaques Visuais & Experiência

- **Identidade Visual Bodas de Ouro**: Tons de dourado suave reluzente (`theme-gold`), marfim, champagne imperial e toques clássicos.
- **Tipografia Nobre**: Fontes caligráficas refinadas (`Great Vibes`, `Cormorant Garamond`, `Playfair Display`) combinadas com a clareza moderna de `Montserrat`.
- **Animações Suaves**: Pétalas douradas, estrelas e brilhos reluzentes em Canvas 2D flutuando suavemente pelo fundo sem pesar.
- **Microinterações Elegantes**: Chuva suave de corações dourados ao interagir e curtir homenagens, zoom suave ao passar o mouse em fotos.
- **100% Responsivo**: Perfeito em celulares, tablets, notebooks e computadores.
- **Zero Dependência**: Pode ser aberto diretamente com dois cliques no `index.html` em qualquer navegador (Chrome, Edge, Safari, Firefox), ou hospedado no GitHub Pages, Vercel ou Netlify.

---

## 📋 Seções do Site

1. **🏠 Página Inicial (Hero)**: Abertura emocionante com foto do casal José & Cida, monograma comemorativo dourado, caligrafia refinada e botões diretos de navegação e confirmação de presença.
2. **⏳ Contagem Regressiva do Jubileu**: Contagem regressiva precisa em tempo real para **19/12/2026 às 18h** (Dias, Horas, Minutos e Segundos). Quando a data chega, exibe mensagem comemorativa especial.
3. **🥂 A Celebração**: Detalhes completos da comemoração na **Parô Eventos** (Data, Horário, Local e rotas).
4. **📷 Fotos das Bodas**: Álbum comemorativo com os registros dos 50 anos de união e visualizador Lightbox em tela cheia com fotos personalizáveis.
5. **💍 Confirmação de Presença (WhatsApp)**: Confirmação direta e prática pelo WhatsApp com formulário opcional para detalhar número de convidados.
6. **📍 Local das Bodas & Mapa**: Localização da **Parô Eventos**, mapa interativo e botões de rota direta no Waze e Google Maps.
7. **🎵 Música do Casal**: Player flutuante discreto com melodia acústica clássica (*Como É Grande O Meu Amor Por Você*).
8. **💛 Mensagem Final**: Agradecimento carinhoso de José & Cida com foto de encerramento e acesso discreto à administração da família.

---

## 🔐 Painel Administrativo da Família

Acesso através do botão **"Área da Família"** na barra superior ou no rodapé do site.

- **Senha de Acesso**: `Aline@01` *(configurável pelo painel)*.
- **Recursos do Painel**:
  - **👥 Controle de Presenças**: Consulta detalhada de quem confirmou presença, quantas pessoas virão e a data/horário exato ("tal dia") de cada confirmação. Inclui busca rápida, adição manual de convidados e botões para copiar lista e imprimir relatório / salvar em PDF.
  - **📷 Álbum de Fotos**: Adicionar novas fotos ao álbum das Bodas com título, categoria e legenda.
  - **⚙️ Dados Gerais**: Alteração dos nomes do casal, data do evento, horário, local, endereço, link do mapa e música.
  - **🎨 Identidade Visual & Seções**: Seletor de temas e controle de visibilidade das seções ativas.
  - **Persistência Instantânea**: Alterações salvas no `LocalStorage` e refletidas instantaneamente no site.

---

## 📁 Estrutura de Arquivos e Pastas

```text
├── index.html                  # Página principal da celebração
├── README.md                   # Documentação completa
└── assets/                     # Recursos estáticos organizados
    ├── css/                    # Estilos visuais
    │   └── styles.css          # Estilos globais, temas e animações
    ├── js/                     # Scripts modulares
    │   ├── data.js             # Dados padrão das Bodas de Ouro
    │   ├── store.js            # Gerenciador de estado e persistência LocalStorage
    │   ├── particles.js        # Efeito de pétalas e brilhos dourados (Canvas 2D)
    │   ├── audio.js            # Player de música inteligente ("Como É Grande O Meu Amor Por Você")
    │   ├── admin.js            # Painel administrativo da família protegido por senha
    │   └── app.js              # Controlador principal da interface e eventos
    ├── images/                 # Imagens e fotos do casal e do evento
    │   ├── hero-elderly-hands.jpg
    │   ├── hero-elderly-hands-table.jpg
    │   └── rsvp-banner-golden-rings.jpg
    └── audio/                  # Músicas e áudios
        └── como-e-grande-o-meu-amor-por-voce.mp3
```

---

## 🚀 Como Visualizar

1. **Uso Local**: Dê um duplo clique no arquivo `index.html` e visualize diretamente em seu navegador.
2. **Hospedagem Web**: Envie os arquivos para o **GitHub Pages**, **Vercel** ou **Netlify** para compartilhar o link com a família e convidados.
