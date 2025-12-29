/**
 * AGNES MILLIE PORTFOLIO SCRIPT
 * Focus: Performance, Security, & Interaction
 */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  // 1. Configuração de Tema e Idioma
  initTheme();
  const currentLang = getInitialLang();
  await loadTranslations(currentLang);

  // 2. Core Features
  initScrollAnimations();
  initNavbarScroll();
  initMobileMenu();
  fetchGitHubRepos();
}

/* --- 1. Sistema de Animação (Intersection Observer) --- */
function initScrollAnimations() {
  const triggers = document.querySelectorAll(".scroll-trigger");

  const observerOptions = {
    threshold: 0.1, // Dispara quando 10% do elemento está visível
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Para de observar após animar (Performance)
      }
    });
  }, observerOptions);

  triggers.forEach((trigger) => observer.observe(trigger));
}

function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

function initMobileMenu() {
  const navToggleBtn = document.getElementById("nav-toggle-btn");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-menu a");

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

    // Fecha o menu ao clicar em um link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu.classList.contains("nav-menu-mobile-active")) {
          navMenu.classList.remove("nav-menu-mobile-active");
          navToggleBtn
            .querySelector("i")
            .classList.replace("fa-times", "fa-bars");
        }
      });
    });
  }
}

/* --- 2. Sistema de Idiomas (i18n) --- */
function getInitialLang() {
  const savedLang = localStorage.getItem("portfolio_lang");
  if (savedLang) return savedLang;
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith("en")) return "en";
  if (browserLang.startsWith("es")) return "es";
  return "pt-br";
}

async function loadTranslations(lang) {
  try {
    // Cache buster simples para desenvolvimento (CORRIGIDO: S7759)
    const response = await fetch(`lang/${lang}.json?v=${Date.now()}`);
    if (!response.ok) throw new Error("Translation file not found");

    const translations = await response.json();
    applyTranslations(translations, lang);
  } catch (error) {
    console.warn("Fallback to PT-BR due to error:", error);
    // Fallback silencioso
    if (lang !== "pt-br") loadTranslations("pt-br");
  }
}

function applyTranslations(translations, lang) {
  // Atualiza textos estáticos
  document.querySelectorAll("[data-i18n-key]").forEach((element) => {
    const key = element.dataset.i18nKey;
    if (translations[key]) {
      if (key === "footer_text") element.innerHTML = translations[key];
      else element.textContent = translations[key];
    }
  });

  // Atualiza botões de idioma
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Listener para botões
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    // Remove listeners antigos (clone hack) ou verifica se já existe
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", () => {
      localStorage.setItem("portfolio_lang", newBtn.dataset.lang);
      loadTranslations(newBtn.dataset.lang);
    });
  });

  // Typing Effect (Reinicia com novas palavras)
  const wordsKey = document.querySelector("[data-i18n-words]");
  if (wordsKey && translations[wordsKey.dataset.i18nWords]) {
    const words = translations[wordsKey.dataset.i18nWords].split(",");
    initTypingEffect(words);
  }
}

/* --- 3. Typing Effect (Typewriter) --- */
let typeTimeout;
function initTypingEffect(words) {
  const element = document.querySelector(".typing-effect");
  if (!element) return;

  // Limpa estado anterior
  if (typeTimeout) clearTimeout(typeTimeout);

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    element.textContent = currentWord.substring(0, charIndex);
    element.classList.add("typing-cursor");

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000; // Pausa no final da palavra
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500;
    }

    typeTimeout = setTimeout(type, typeSpeed);
  }

  type();
}

/* --- 4. GitHub API & Paginação --- */
const paginationState = {
  allRepos: [],
  currentPage: 1,
  itemsPerPage: 6,
};

async function fetchGitHubRepos() {
  const loader = document.querySelector(".loader-container");
  const errorMsg = document.getElementById("projects-error");
  const excludeRepos = new Set(["agnesmillie-portfolio", "AgnesMillie"]);

  try {
    const response = await fetch(
      "https://api.github.com/users/AgnesMillie/repos?type=owner&sort=pushed&direction=desc&per_page=50"
    );

    if (!response.ok) throw new Error("GitHub API Error");

    const repos = await response.json();
    paginationState.allRepos = repos.filter((r) => !excludeRepos.has(r.name));

    if (loader) loader.style.display = "none";

    if (paginationState.allRepos.length > 0) {
      setupPagination();
      displayProjects(1);
    } else {
      errorMsg.style.display = "block";
      errorMsg.textContent = "No public repositories found.";
    }
  } catch (error) {
    console.error(error);
    if (loader) loader.style.display = "none";
    if (errorMsg) errorMsg.style.display = "block";
  }
}

function displayProjects(page) {
  const grid = document.getElementById("projects-grid");
  // Mantém o loader hidden, limpa cards antigos
  const loader = grid.querySelector(".loader-container");
  grid.innerHTML = "";
  if (loader) loader.style.display = "none";

  const start = (page - 1) * paginationState.itemsPerPage;
  const end = start + paginationState.itemsPerPage;
  const pageRepos = paginationState.allRepos.slice(start, end);

  pageRepos.forEach((repo) => {
    const card = document.createElement("div");
    card.className = "project-card scroll-trigger visible"; // Já nasce visível pois é dinâmico

    // Hardening: Sanitize HTML content setting textContent mostly
    const desc = repo.description || "No description provided.";

    card.innerHTML = `
      <div class="project-header">
        <i class="far fa-folder-open"></i>
        <div class="project-links">
          <a href="${
            repo.html_url
          }" target="_blank" rel="noopener noreferrer" title="GitHub Code">
            <i class="fab fa-github"></i>
          </a>
          ${
            repo.homepage
              ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i></a>`
              : ""
          }
        </div>
      </div>
      <h3 class="project-title">${escapeHTML(repo.name)}</h3>
      <p class="project-description">${escapeHTML(desc)}</p>
      <div class="project-stack">
        ${repo.language ? `<span>${repo.language}</span>` : ""}
        <span>${new Date(repo.updated_at).getFullYear()}</span>
      </div>
    `;
    grid.appendChild(card);
  });

  updatePaginationControls(page);
}

function escapeHTML(str) {
  // CORRIGIDO: S7781 - Prefer String#replaceAll()
  return str.replaceAll(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag])
  );
}

function setupPagination() {
  const totalPages = Math.ceil(
    paginationState.allRepos.length / paginationState.itemsPerPage
  );
  const controls = document.querySelector(".carousel-controls");
  const dotsContainer = document.getElementById("pagination-dots");

  if (totalPages <= 1) {
    controls.style.display = "none";
    return;
  }

  controls.style.display = "flex";
  dotsContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const dot = document.createElement("button");
    dot.className = "pagination-dot";
    dot.addEventListener("click", () => {
      paginationState.currentPage = i;
      displayProjects(i);
    });
    dotsContainer.appendChild(dot);
  }

  document.getElementById("prev-page").addEventListener("click", () => {
    if (paginationState.currentPage > 1) {
      paginationState.currentPage--;
      displayProjects(paginationState.currentPage);
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    if (paginationState.currentPage < totalPages) {
      paginationState.currentPage++;
      displayProjects(paginationState.currentPage);
    }
  });
}

function updatePaginationControls(page) {
  const dots = document.querySelectorAll(".pagination-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index + 1 === page);
  });

  const totalPages = Math.ceil(
    paginationState.allRepos.length / paginationState.itemsPerPage
  );
  document.getElementById("prev-page").style.display =
    page === 1 ? "none" : "block";
  document.getElementById("next-page").style.display =
    page === totalPages ? "none" : "block";
}

/* --- 5. Theme System --- */
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle-btn");
  const body = document.body;
  const savedTheme = localStorage.getItem("portfolio_theme");

  if (savedTheme === "light") {
    body.classList.add("theme-light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("theme-light");
      localStorage.setItem(
        "portfolio_theme",
        body.classList.contains("theme-light") ? "light" : "dark"
      );
    });
  }
}
