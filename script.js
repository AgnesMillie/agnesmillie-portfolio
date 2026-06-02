/* Agnes Millie — Biblioteca de Soluções Digitais | script.js */

"use strict";

(function initTheme() {
  const saved = localStorage.getItem("am-theme") || "light";
  if (saved === "dark") document.body.classList.add("theme-dark");
  else document.body.classList.remove("theme-dark");
})();

document.addEventListener("DOMContentLoaded", () => {

  /* ---- Theme ---- */
  const themeBtn = document.querySelector("#theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("theme-dark");
      localStorage.setItem("am-theme", isDark ? "dark" : "light");
    });
  }

  /* ---- i18n ---- */
  const translations = {};
  let currentLang = localStorage.getItem("am-lang") || "pt-br";

  async function loadLang(lang) {
    if (!translations[lang]) {
      try {
        const res = await fetch(`lang/${lang}.json`);
        if (!res.ok) throw new Error(`${res.status}`);
        translations[lang] = await res.json();
      } catch {
        translations[lang] = {};
      }
    }
  }

  function applyLang(lang) {
    const t = translations[lang] || {};
    document.querySelectorAll("[data-i18n-key]").forEach(el => {
      const key = el.dataset.i18nKey;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key] !== undefined) el.placeholder = t[key];
    });
    document.documentElement.lang = lang;

    if (t["hero_words"]) {
      typingWords = t["hero_words"].split(",").map(w => w.trim()).filter(Boolean);
      typingIndex = 0; typingCharIndex = 0; isDeleting = false;
      clearTimeout(typingTimer);
      typeNext();
    }
  }

  async function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("am-lang", lang);
    document.querySelectorAll(".lang-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );
    await loadLang(lang);
    applyLang(lang);
  }

  (async () => {
    await loadLang(currentLang);
    applyLang(currentLang);
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
      btn.addEventListener("click", () => switchLang(btn.dataset.lang));
    });
  })();

  /* ---- Navbar ---- */
  const navbar = document.querySelector("#navbar");
  window.addEventListener("scroll", () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  /* Mobile menu */
  const navToggle = document.querySelector("#nav-toggle-btn");
  const navMenu   = document.querySelector("#nav-menu");

  function toggleMenu() {
    if (!navMenu) return;
    const open = navMenu.classList.toggle("open");
    if (navToggle) navToggle.querySelector("i").className = open ? "fas fa-times" : "fas fa-bars";
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleMenu);
    navToggle.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMenu(); }
    });
  }

  if (navMenu) {
    navMenu.addEventListener("click", e => {
      if (e.target.tagName === "A") {
        navMenu.classList.remove("open");
        if (navToggle) navToggle.querySelector("i").className = "fas fa-bars";
        document.body.style.overflow = "";
      }
    });
  }

  /* Active nav link */
  const navLinks  = document.querySelectorAll(".nav-menu a[href^='#']");
  const sectionEls = document.querySelectorAll("section[id], header[id]");

  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link =>
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" }).observe
    ? (() => {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              navLinks.forEach(link =>
                link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
              );
            }
          });
        }, { rootMargin: "-40% 0px -55% 0px" });
        sectionEls.forEach(s => obs.observe(s));
      })()
    : null;

  /* ---- Typing Effect ---- */
  let typingWords = ["Arquitetura de Software", "Desenvolvimento Full Stack", "Transformação Digital", "Automação de Processos", "Inovação Tecnológica"];
  let typingIndex = 0, typingCharIndex = 0;
  let isDeleting = false, typingTimer = null;
  const typingEl = document.querySelector("#typing-text");

  function typeNext() {
    if (!typingEl || !typingWords.length) return;
    const word = typingWords[typingIndex];
    typingEl.textContent = isDeleting ? word.slice(0, typingCharIndex - 1) : word.slice(0, typingCharIndex + 1);
    typingCharIndex = isDeleting ? typingCharIndex - 1 : typingCharIndex + 1;

    let delay = isDeleting ? 55 : 90;
    if (!isDeleting && typingCharIndex > word.length) { delay = 2000; isDeleting = true; }
    else if (isDeleting && typingCharIndex === 0) { isDeleting = false; typingIndex = (typingIndex + 1) % typingWords.length; delay = 400; }

    typingTimer = setTimeout(typeNext, delay);
  }
  typeNext();

  /* ---- Scroll Animations ---- */
  const scrollObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        scrollObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".scroll-trigger").forEach(el => scrollObs.observe(el));

  /* ---- Project Filter ---- */
  const filterBtns = document.querySelectorAll(".cf-btn");
  const bookCards  = document.querySelectorAll(".book-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      bookCards.forEach(card =>
        card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter)
      );
    });
  });

  /* ---- Counter Animation ---- */
  function animateCount(el, target, ms) {
    const start = performance.now();
    const tick = t => {
      const p = Math.min((t - start) / ms, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  }

  const counterEls = document.querySelectorAll(".counter-num");
  let countersRan = false;
  const achSection = document.querySelector("#achievements");

  if (achSection) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersRan) {
          countersRan = true;
          counterEls.forEach(el => animateCount(el, parseInt(el.dataset.target, 10), 1800));
        }
      });
    }, { threshold: 0.4 }).observe(achSection);
  }

});
