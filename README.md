# Agnes Millie Portfolio v2.0

![Status do Projeto](https://img.shields.io/badge/status-active-success.svg)
![Licença](https://img.shields.io/badge/license-MIT-blue.svg)

## 📑 Descrição

Este repositório hospeda o código-fonte da versão 2.0 do meu portfólio profissional. O projeto foi arquitetado como uma **Single Page Application (SPA)** estática, focada em demonstrar competências avançadas em **Engenharia de Frontend**, **Segurança da Informação** e **Performance Web**.

Diferente de templates genéricos, esta aplicação foi construída do zero (Vanilla JS) para garantir controle total sobre a renderização, acessibilidade e segurança, sem a sobrecarga de frameworks desnecessários para este escopo.

**Live Demo:** [https://agnesmillie.github.io/agnesmillie-portfolio/](https://agnesmillie.github.io/agnesmillie-portfolio/)

---

## 🚀 Arquitetura e Decisões Técnicas

O desenvolvimento seguiu princípios de **"Cyber-Minimalism"** e **"Security by Design"**.

### 1. Hardening de Frontend & Segurança
* **Content Security Policy (CSP):** Implementação rigorosa de cabeçalhos CSP via meta tags para mitigar riscos de ataques XSS (Cross-Site Scripting) e Injection. A política restringe as origens de scripts, estilos e fontes apenas a domínios confiáveis (Self, Google Fonts, CDN jsDelivr, GitHub API).
* **Sanitização de Dados:** Todo conteúdo dinâmico proveniente da API do GitHub passa por tratamento para evitar injeção de HTML malicioso.

### 2. Performance & Otimização
* **Zero-Dependency Core:** O núcleo da aplicação utiliza **Vanilla JavaScript (ES6+)**, eliminando o "bloat" de bibliotecas como jQuery ou Bootstrap.
* **Intersection Observer API:** Implementação de "Scroll Reveals" (animações de entrada) utilizando a API nativa do navegador, garantindo alta performance na thread principal e evitando reflows desnecessários.
* **Resource Hints:** Uso estratégico de `preconnect` para fontes externas.

### 3. UX/UI Moderno
* **Glassmorphism & Cyber-Estética:** Uso intensivo de `backdrop-filter`, variáveis CSS (Custom Properties) e transparências para criar uma interface profunda e moderna.
* **Temas Dinâmicos:** Suporte nativo a **Dark Mode** (padrão) e Light Mode, com persistência de preferência via `localStorage`.
* **Internacionalização (i18n):** Sistema próprio de tradução JSON-based para suporte instantâneo a Português (pt-BR), Inglês (en) e Espanhol (es).

---

## ✨ Funcionalidades Principais

* **GitHub REST API Integration:** Consumo assíncrono da API pública do GitHub para listar repositórios automaticamente, com paginação client-side.
* **Design Responsivo:** Layout fluido via CSS Grid e Flexbox, adaptável de dispositivos móveis a monitores ultrawide.
* **Animação de Digitação:** Componente "Typewriter" personalizado para o Hero Section.
* **Navegação Inteligente:** Navbar com detecção de scroll e menu mobile otimizado.

---

## 🛠️ Stack Tecnológico

* **Core:** HTML5 Semântico, CSS3 (CSS Variables, Flexbox/Grid), JavaScript (ESModules).
* **Integrações:** GitHub REST API v3.
* **Assets:** Font Awesome 6, Devicon, Google Fonts (Inter & Fira Code).
* **Ferramentas:** Git, VS Code.

---

## 🚀 Executando Localmente

Como o projeto é estático (client-side), não requer compiladores ou backend.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/AgnesMillie/agnesmillie-portfolio.git](https://github.com/AgnesMillie/agnesmillie-portfolio.git)
    ```

2.  **Navegue até a pasta:**
    ```bash
    cd agnesmillie-portfolio
    ```

3.  **Execute:**
    * Opção A: Abra o arquivo `index.html` diretamente no navegador.
    * Opção B (Recomendado para evitar bloqueios de CORS locais): Use uma extensão como "Live Server" no VS Code ou rode um servidor simples Python:
        ```bash
        # Python 3
        python -m http.server 8000
        ```
        Acesse `http://localhost:8000`.

---

## 📂 Estrutura de Pastas

```text
/
├── assets/          # Imagens e recursos estáticos
├── lang/            # Arquivos JSON de tradução (pt-br, en, es)
├── index.html       # Ponto de entrada (com CSP configurada)
├── style.css        # Estilos globais e componentes
├── script.js        # Lógica da aplicação (i18n, API, UI)
└── README.md        # Documentação