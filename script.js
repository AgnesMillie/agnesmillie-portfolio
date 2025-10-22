function getInitialLang() {
  const savedLang = localStorage.getItem("portfolio_lang");
  if (savedLang) return savedLang;
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith("en")) return "en";
  if (browserLang.startsWith("es")) return "es";
  return "pt-br";
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const body = document.body;
  const lightThemeClass = "theme-light";
  const themeStorageKey = "portfolio_theme";

  function applyTheme(theme) {
    if (theme === "light") {
      body.classList.add(lightThemeClass);
    } else {
      body.classList.remove(lightThemeClass);
    }
    localStorage.setItem(themeStorageKey, theme);
  }

  function toggleTheme() {
    if (body.classList.contains(lightThemeClass)) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }

  function getInitialTheme() {
    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme) return savedTheme;
    if (
      globalThis.matchMedia &&
      globalThis.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
    return "dark";
  }

  applyTheme(getInitialTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  const langPtBtn = document.getElementById("lang-pt");
  const langEnBtn = document.getElementById("lang-en");
  const langEsBtn = document.getElementById("lang-es");

  let currentTranslations = {};

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) {
        console.warn(
          `Arquivo ${lang}.json não encontrado, tentando fallback para pt-br.`
        );
        const fallbackResponse = await fetch(`lang/pt-br.json`);
        if (!fallbackResponse.ok) {
          throw new Error(
            `Arquivos de tradução não encontrados: ${lang}.json e pt-br.json`
          );
        }
        const fallbackTranslations = await fallbackResponse.json();
        applyTranslations(fallbackTranslations, "pt-br");
        return;
      }
      const translations = await response.json();
      applyTranslations(translations, lang);
    } catch (error) {
      console.error("Erro fatal ao carregar traduções:", error);
    }
  }

  function applyTranslations(translations, lang) {
    currentTranslations = translations;
    document.documentElement.lang = lang;
    document.title = translations.meta_title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", translations.meta_description);
    }

    for (const element of document.querySelectorAll("[data-i18n-key]")) {
      const key = element.dataset.i18nKey;
      if (translations[key]) {
        if (key === "footer_text") {
          element.innerHTML = translations[key];
        } else {
          element.textContent = translations[key];
        }
      }
    }

    langPtBtn.classList.toggle("active", lang === "pt-br");
    langEnBtn.classList.toggle("active", lang === "en");
    langEsBtn.classList.toggle("active", lang === "es");

    const wordsKey = document.querySelector("[data-i18n-words]");
    if (wordsKey) {
      const key = wordsKey.dataset.i18nWords;
      if (translations[key]) {
        initTypingEffect(translations[key].split(","));
      }
    }
  }

  function setLanguage(lang) {
    localStorage.setItem("portfolio_lang", lang);
    loadTranslations(lang);
  }

  langPtBtn.addEventListener("click", () => setLanguage("pt-br"));
  langEnBtn.addEventListener("click", () => setLanguage("en"));
  langEsBtn.addEventListener("click", () => setLanguage("es"));

  const projectsGrid = document.getElementById("projects-grid");
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");
  const dotsContainer = document.getElementById("pagination-dots");
  const controlsContainer = document.querySelector(".carousel-controls");

  const paginationState = {
    allRepos: [],
    currentPage: 1,
    itemsPerPage: 6,
    totalPages: 0,
  };

  async function fetchGitHubRepos() {
    const errorMsg = document.getElementById("projects-error");
    const loader = projectsGrid.querySelector(".loader-container");
    const excludeRepos = new Set(["agnesmillie-portfolio", "AgnesMillie"]);
    const url =
      "https://api.github.com/users/AgnesMillie/repos?type=owner&sort=pushed&direction=desc&per_page=30";

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      if (!response.ok)
        throw new Error(`Erro na API do GitHub: ${response.status}`);
      const repos = await response.json();

      paginationState.allRepos = repos.filter(
        (repo) => !excludeRepos.has(repo.name)
      );
      paginationState.totalPages = Math.ceil(
        paginationState.allRepos.length / paginationState.itemsPerPage
      );

      if (loader) loader.remove();

      if (paginationState.totalPages > 0) {
        setupPagination();
        displayPage(1);
        if (controlsContainer && paginationState.totalPages > 1) {
          controlsContainer.style.display = "flex";
        } else if (controlsContainer) {
          controlsContainer.style.display = "none";
        }
      } else {
        projectsGrid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--color-text-secondary);">Nenhum repositório público encontrado.</p>`;
      }
    } catch (error) {
      console.error("Falha ao buscar repositórios:", error);
      if (loader) loader.remove();
      errorMsg.style.display = "block";
    }
  }

  function displayPage(page) {
    paginationState.currentPage = page;
    const startIndex = (page - 1) * paginationState.itemsPerPage;
    const endIndex = startIndex + paginationState.itemsPerPage;
    const reposToShow = paginationState.allRepos.slice(startIndex, endIndex);
    projectsGrid.innerHTML = generateProjectCardsHTML(reposToShow);
    updatePaginationUI();
  }

  function generateProjectCardsHTML(repos) {
    let html = "";
    for (const repo of repos) {
      const lang = document.documentElement.lang || "pt-br";
      let noDescText;
      if (lang === "en") {
        noDescText = "No description available.";
      } else if (lang === "es") {
        noDescText = "Sin descripción disponible.";
      } else {
        noDescText = "Sem descrição disponível.";
      }

      const description = repo.description || noDescText;
      const langTag = repo.language ? `<li>${repo.language}</li>` : "";
      const demoLink = repo.homepage
        ? `<a href="${repo.homepage}" target="_blank" title="Ver demo"><i class="fas fa-external-link-alt"></i></a>`
        : "";

      html += `
            <div class="project-card">
                <div class="project-header">
                    <i class="far fa-folder-open"></i>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" title="Ver no GitHub"><i class="fab fa-github"></i></a>
                        ${demoLink}
                    </div>
                </div>
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-description">${description}</p>
                <ul class="project-stack">
                    ${langTag}
                </ul>
            </div>`;
    }
    return html;
  }

  function setupPagination() {
    prevButton.addEventListener("click", prevPage);
    nextButton.addEventListener("click", nextPage);
    dotsContainer.innerHTML = "";
    for (let i = 1; i <= paginationState.totalPages; i++) {
      const dot = document.createElement("button");
      dot.classList.add("pagination-dot");
      dot.dataset.page = i;
      dot.addEventListener("click", () => goToPage(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updatePaginationUI() {
    const { currentPage, totalPages } = paginationState;
    prevButton.style.display = currentPage === 1 ? "none" : "block";
    nextButton.style.display = currentPage === totalPages ? "none" : "block";
    const dots = dotsContainer.querySelectorAll(".pagination-dot");
    for (const dot of dots) {
      dot.classList.remove("active");
      if (Number.parseInt(dot.dataset.page) === currentPage) {
        dot.classList.add("active");
      }
    }
  }

  function prevPage() {
    if (paginationState.currentPage > 1)
      displayPage(paginationState.currentPage - 1);
  }
  function nextPage() {
    if (paginationState.currentPage < paginationState.totalPages)
      displayPage(paginationState.currentPage + 1);
  }
  function goToPage(page) {
    displayPage(page);
  }

  const typeState = {
    element: document.querySelector(".typing-effect"),
    words: [],
    wordIndex: 0,
    charIndex: 0,
    isDeleting: false,
    timeoutId: null,
  };
  const typingSpeed = 100,
    erasingSpeed = 50,
    delayBetweenWords = 2000;

  function initTypingEffect(wordsArray) {
    if (!typeState.element) return;
    if (typeState.timeoutId) clearTimeout(typeState.timeoutId);
    typeState.words = wordsArray;
    typeState.wordIndex = 0;
    typeState.charIndex = 0;
    typeState.isDeleting = false;
    type();
  }
  function type() {
    if (!typeState.element || typeState.words.length === 0) return;
    const currentWord = typeState.words[typeState.wordIndex];
    const currentChars = currentWord.substring(0, typeState.charIndex);
    typeState.element.textContent = currentChars;
    typeState.element.classList.add("typing-cursor");
    if (!typeState.isDeleting && typeState.charIndex < currentWord.length) {
      typeState.charIndex++;
      typeState.timeoutId = setTimeout(type, typingSpeed);
    } else if (typeState.isDeleting && typeState.charIndex > 0) {
      typeState.charIndex--;
      typeState.timeoutId = setTimeout(type, erasingSpeed);
    } else {
      typeState.isDeleting = !typeState.isDeleting;
      typeState.element.classList.remove("typing-cursor");
      if (!typeState.isDeleting)
        typeState.wordIndex =
          (typeState.wordIndex + 1) % typeState.words.length;
      typeState.timeoutId = setTimeout(
        type,
        typeState.isDeleting ? erasingSpeed : delayBetweenWords
      );
    }
  }

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-menu a");

  function highlightNav() {
    let currentSection = "hero";
    const scrollY = globalThis.pageYOffset;
    for (const section of sections) {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = sectionId;
        break;
      }
    }
    for (const link of navLinks) {
      const hrefSection = link.getAttribute("href").substring(1);
      const isHomePage =
        link.dataset.i18nKey === "nav_home" && currentSection === "hero";
      const isCurrentSection = hrefSection === currentSection;
      if (isHomePage || isCurrentSection) link.classList.add("active");
      else link.classList.remove("active");
    }
  }
  globalThis.addEventListener("scroll", highlightNav);

  const navToggleBtn = document.getElementById("nav-toggle-btn");
  const navMenu = document.querySelector(".nav-menu");
  if (navToggleBtn && navMenu) {
    navToggleBtn.addEventListener("click", () => {
      navMenu.classList.toggle("nav-menu-mobile-active");
      const icon = navToggleBtn.querySelector("i");
      if (icon.classList.contains("fa-bars")) {
        icon.classList.replace("fa-bars", "fa-times");
      } else {
        icon.classList.replace("fa-times", "fa-bars");
      }
    });
    for (const link of navLinks) {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("nav-menu-mobile-active")) {
          navMenu.classList.remove("nav-menu-mobile-active");
          navToggleBtn
            .querySelector("i")
            .classList.replace("fa-times", "fa-bars");
        }
      });
    }
  }

  async function initializeApp() {
    const lang = getInitialLang();
    await loadTranslations(lang);
    fetchGitHubRepos();
    highlightNav();
  }
  initializeApp();
});
