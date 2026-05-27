# NEO.LIVING — Site

Site institucional da NEO.LIVING — arquitetura contemporânea, design & lifestyle.
Construído como site estático (HTML/CSS/JS) com animações cinematográficas via GSAP + Lenis.

---

## Estrutura

```
site/
├── index.html              ← Home
├── work-profile.html       ← Project Portfolio + Conceito + Pilares
├── incorporacoes.html      ← Empreendimentos
├── head-designers.html     ← Sócios + Conceitos editoriais
├── execucao-full.html      ← Sistema Full-Service
├── contact.html            ← Formulário e contatos
├── README.md
├── css/
│   ├── globals.css         ← Tokens (cores, tipografia, spacing) + reset + utilities
│   ├── components.css      ← Header, footer, nav, cards, forms
│   └── pages.css           ← Estilos específicos de seções (hero, processo, highlights...)
├── js/
│   ├── app.js              ← Lenis, GSAP, fade-in observer, hover de highlights, transições
│   └── partials.js         ← Injeta header/footer (single source of truth)
└── assets/
    ├── images/             ← Coloque suas fotos aqui (ver convenção abaixo)
    └── icons/              ← (opcional) ícones extras
```

---

## Como visualizar localmente

O site é **estático** e não exige build. Três opções:

1. **Abrir direto no navegador:** dois cliques em `index.html`. Funciona, mas algumas funcionalidades (fontes Google, Lenis via CDN) exigem internet.
2. **Servidor local rápido (Python):**
   ```bash
   cd site
   python -m http.server 8000
   ```
   Abra `http://localhost:8000`.
3. **Servidor local rápido (Node):**
   ```bash
   cd site
   npx serve
   ```

---

## Como substituir as imagens placeholder pelas fotos reais

Os placeholders estão em CSS (gradiente + label) e identificados em todas as páginas com a classe `.placeholder-img` e um `<span class="placeholder-img__label">_ Nome do projeto</span>`.

### Convenção de nomes (sugerida)

Coloque suas fotos em `assets/images/` com os nomes abaixo (formato `.jpg` ou `.webp`, recomendo **WebP** para performance — tamanho ideal ~1800px no maior lado, comprimido a ~75% qualidade):

| Nome do arquivo | Onde aparece |
|---|---|
| `hero-home.jpg` | Hero da Home |
| `hero-work-profile.jpg` | Hero da página Work Profile |
| `hero-incorporacoes.jpg` | Hero de Incorporações |
| `hero-execucao-full.jpg` | Hero de Execução Full |
| `process-bg.jpg` | Background da seção "Three-Step Process" (home) |
| `teaser-raw.jpg` | Teaser R.A.W. Arquitetos (work-profile) |
| `teaser-office.jpg` | Teaser Office Design (work-profile) |
| `designers-portrait.jpg` | Retrato Ale & Nat (head-designers) |
| `cool-hunters.jpg` | Bloco Cool Hunters |
| `avant-garde.jpg` | Bloco Avant-Garde |
| `visionarios.jpg` | Bloco Visionários |
| `oficina-mobiliario.jpg` | Imagem sticky de Execução Full |
| `proj-horizon-joa.jpg` | Cards de projetos: Horizon Joá |
| `proj-cobertura-costa-del-sol.jpg` | Cobertura Costa del Sol |
| `proj-retrofit-chopin.jpg` | Retrofit Chopin |
| `proj-life-house-itanhanga.jpg` | Life.House Itanhangá |
| `proj-sexy-house.jpg` | Sexy House |
| `proj-office-le-monde.jpg` | Office Le Monde |
| `proj-retrofit-nova-joatinga.jpg` | Retrofit Nova Joatinga |
| `proj-retrofit-epitacio-pessoa.jpg` | Retrofit Epitácio Pessoa 800 |
| `proj-retrofit-nascimento-silva.jpg` | Retrofit Nascimento Silva 543 |
| `proj-club-house-jockey.jpg` | Club House Jockey |
| `proj-retrospectiva-niemeyer.jpg` | Retrospectiva Niemeyer |
| `proj-shopping-citta.jpg` | Shopping Città |
| `proj-forest-life.jpg` | Forest Life |
| `proj-urb-x-hub.jpg` | Urb x Hub |
| `proj-match-point.jpg` | Match.Point Pub |
| `proj-kult-lifestyle.jpg` | KULT Lifestyle Club |
| `proj-kult-kolector.jpg` | KULT Kolector |
| `emp-reserva-pedra-bonita-2.jpg` | Reserva Pedra Bonita 2 Cases |
| `emp-itaipava-office-mall.jpg` | Itaipava Office Mall & Residence |
| `emp-village-ranch.jpg` | Village Ranch |
| `emp-casas-reserva-pedra-bonita.jpg` | Casas Reserva Pedra Bonita |
| `emp-reserva-pedra-bonita-4.jpg` | Reserva Pedra Bonita 4 Cases |

### Como aplicar uma foto a um placeholder

Para cada bloco placeholder, **substitua**:

```html
<div class="placeholder-img">
    <span class="placeholder-img__label">_ Horizon Joá</span>
</div>
```

por:

```html
<img src="assets/images/proj-horizon-joa.jpg" alt="Horizon Joá — Residência sobre a Floresta da Tijuca" loading="lazy">
```

> Os contêineres já controlam `aspect-ratio`, `object-fit: cover` e o efeito de zoom no hover via CSS (`.zoom-image`, `.project-card__media`, etc). Você só precisa trocar a tag.

### Otimização recomendada

- **Formato:** WebP (queda de ~30% no tamanho vs JPG sem perda visual)
- **Largura máxima:** 1800px no lado maior (a não ser para hero, que pode ir a 2400px)
- **Compressão:** ~75% de qualidade
- **Responsivo:** se quiser duas versões (mobile/desktop), use `<picture>` com `<source media="...">`

---

## Tokens de design (para edições rápidas)

Editar `css/globals.css`, bloco `:root`. Os principais:

| Token | Valor | Função |
|---|---|---|
| `--bg-deep` | `#0E1410` | Fundo principal |
| `--accent-amber` | `#E9B770` | Cor de destaque (luz quente) |
| `--text-primary` | `#F4F1EA` | Texto principal |
| `--font-display` | `Inter` | Tipografia de títulos |
| `--font-serif` | `Cormorant Garamond` | Acentos editoriais (citações) |

---

## Pontos de atenção / próximos passos

1. **Formulário de contato** está implementado no front (validação, animação de envio), mas precisa ser conectado a um backend (Formspree, Netlify Forms, Supabase, ou endpoint próprio).
2. **Vídeos no Hero** — atualmente é foto fixa. Para usar vídeo loop, troque a div `.hero__media` por:
   ```html
   <video autoplay muted loop playsinline class="hero__video">
       <source src="assets/videos/hero-loop.webm" type="video/webm">
       <source src="assets/videos/hero-loop.mp4" type="video/mp4">
   </video>
   ```
3. **SEO** — Open Graph, Twitter Cards e schema.org JSON-LD não foram implementados; recomendo adicionar.
4. **Analytics** — adicionar GA4 / Plausible / Fathom no `<head>` quando definir provedor.
5. **Domínio + hospedagem** — qualquer host estático serve (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## Tecnologias utilizadas

- **HTML5** semântico
- **CSS3** com variáveis customizadas (sem pré-processador)
- **Vanilla JS** (sem framework)
- **GSAP 3** + **ScrollTrigger** — animações timeline
- **Lenis** — scroll suave cinematográfico
- **Google Fonts** — Inter (display + body) + Cormorant Garamond (serif italic)

Sem bundler, sem `npm install`, sem dependência de Node em produção.

---

NEO.LIVING © 2023 — Rio de Janeiro · BRA
