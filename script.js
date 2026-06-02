/* Agnes Millie Portfolio — script.js v3.0 */

"use strict";

/* ---- Utilities ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   THEME
   ============================================================ */
(function initTheme() {
  const saved = localStorage.getItem("am-theme") || "dark";
  if (saved === "light") document.body.classList.add("theme-light");
  else document.body.classList.remove("theme-light");
})();

document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = $("#theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("theme-light");
      localStorage.setItem("am-theme", isLight ? "light" : "dark");
    });
  }

  /* ============================================================
     I18N
     ============================================================ */
  const translations = {};
  let currentLang = localStorage.getItem("am-lang") || "pt-br";

  async function loadLang(lang) {
    if (!translations[lang]) {
      try {
        const res = await fetch(`lang/${lang}.json`);
        if (!res.ok) throw new Error("fetch failed");
        translations[lang] = await res.json();
      } catch {
        translations[lang] = {};
      }
    }
  }

  function applyLang(lang) {
    const t = translations[lang] || {};
    $$("[data-i18n-key]").forEach(el => {
      const key = el.dataset.i18nKey;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    $$("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key] !== undefined) el.placeholder = t[key];
    });
    document.documentElement.lang = lang;

    /* Update typing words */
    if (t["hero_words"]) {
      typingWords = t["hero_words"].split(",").map(w => w.trim()).filter(Boolean);
      typingIndex = 0;
      typingCharIndex = 0;
      isDeleting = false;
      clearTimeout(typingTimer);
      typeNext();
    }
  }

  async function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("am-lang", lang);
    $$(".lang-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === lang));
    await loadLang(lang);
    applyLang(lang);
  }

  /* Boot i18n */
  (async function() {
    await loadLang(currentLang);
    applyLang(currentLang);
    $$(".lang-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
      btn.addEventListener("click", () => switchLang(btn.dataset.lang));
    });
  })();

  /* ============================================================
     NAVBAR
     ============================================================ */
  const navbar = $("#navbar");

  window.addEventListener("scroll", () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  /* Mobile menu */
  const navToggleBtn = $("#nav-toggle-btn");
  const navMenu = $("#nav-menu");

  function toggleMenu() {
    if (!navMenu) return;
    const open = navMenu.classList.toggle("open");
    if (navToggleBtn) {
      navToggleBtn.querySelector("i").className = open ? "fas fa-times" : "fas fa-bars";
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggleBtn) {
    navToggleBtn.addEventListener("click", toggleMenu);
    navToggleBtn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMenu(); }
    });
  }

  if (navMenu) {
    navMenu.addEventListener("click", e => {
      if (e.target.tagName === "A") {
        navMenu.classList.remove("open");
        if (navToggleBtn) navToggleBtn.querySelector("i").className = "fas fa-bars";
        document.body.style.overflow = "";
      }
    });
  }

  /* Active nav link on scroll */
  const navLinks = $$(".nav-menu a[href^='#']");
  const sectionEls = $$("section[id], header[id]");

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sectionEls.forEach(s => sectionObserver.observe(s));

  /* ============================================================
     TYPING EFFECT
     ============================================================ */
  let typingWords = ["Arquitetura de Software", "Desenvolvimento Full Stack", "Transformação Digital", "Automação de Processos", "Inovação Tecnológica"];
  let typingIndex = 0;
  let typingCharIndex = 0;
  let isDeleting = false;
  let typingTimer = null;
  const typingEl = $("#typing-text");

  function typeNext() {
    if (!typingEl || !typingWords.length) return;
    const word = typingWords[typingIndex];
    const current = isDeleting ? word.slice(0, typingCharIndex - 1) : word.slice(0, typingCharIndex + 1);
    typingEl.textContent = current;
    typingCharIndex = isDeleting ? typingCharIndex - 1 : typingCharIndex + 1;

    let delay = isDeleting ? 55 : 90;

    if (!isDeleting && typingCharIndex > word.length) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && typingCharIndex === 0) {
      isDeleting = false;
      typingIndex = (typingIndex + 1) % typingWords.length;
      delay = 350;
    }

    typingTimer = setTimeout(typeNext, delay);
  }

  typeNext();

  /* ============================================================
     SCROLL ANIMATIONS
     ============================================================ */
  const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$(".scroll-trigger").forEach(el => scrollObserver.observe(el));

  /* ============================================================
     PROJECT FILTER
     ============================================================ */
  const filterBtns = $$(".pf-btn");
  const projCards = $$(".proj-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      projCards.forEach(card => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const step = timestamp => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const counterEls = $$(".counter-num");
  let countersStarted = false;

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counterEls.forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target, 1800);
        });
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const achievementsSection = $("#achievements");
  if (achievementsSection) counterObserver.observe(achievementsSection);

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  const form = $("#contact-form");
  const formSuccess = $("#form-success");

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      if (!btn) return;
      btn.disabled = true;
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fas fa-spinner fa-spin";

      setTimeout(() => {
        btn.disabled = false;
        if (icon) icon.className = "fas fa-paper-plane";
        if (formSuccess) {
          formSuccess.style.display = "block";
          setTimeout(() => { formSuccess.style.display = "none"; }, 5000);
        }
        form.reset();
      }, 1200);
    });
  }
});
