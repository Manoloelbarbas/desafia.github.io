/* ══════════════════════════════════════════════════
   DesafIA – animations.js
   Scroll reveals, navbar effects, mobile menu,
   counter animations, parallax blobs
══════════════════════════════════════════════════ */

(function () {
  "use strict";

  // If any JS error occurs, immediately make all content visible
  window.addEventListener('error', function() {
    document.documentElement.classList.remove('js-ready');
  });

  // Ensure DOM is fully loaded before running observers
  document.addEventListener('DOMContentLoaded', function() {

  /* ── 1. NAVBAR: scroll shadow & active link ──────── */
  const navbar = document.getElementById("navbar");

  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    updateActiveLink();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run on load

  /* ── Active nav link based on scroll position ── */
  const navLinks = document.querySelectorAll(".navbar__link");
  const sections = Array.from(navLinks)
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    let current = null;
    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });
    navLinks.forEach((l) => {
      const href = l.getAttribute("href").replace("#", "");
      l.classList.toggle("active", href === current);
    });
  }

  /* ── 2. MOBILE HAMBURGER MENU ────────────────────── */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(
    ".mobile-menu__link, .mobile-menu__cta",
  );

  function toggleMenu(open) {
    hamburger.classList.toggle("active", open);
    mobileMenu.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open.toString());
    document.body.style.overflow = open ? "hidden" : "";
  }

  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.contains("open");
    toggleMenu(!isOpen);
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleMenu(false);
  });

  /* ── 3. DYNAMIC SCROLL-LINKED REVEAL (Impact Effect) ─── */
  const revealEls = document.querySelectorAll(".reveal");
  
  function onScrollReveal() {
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    revealEls.forEach((el) => {
      // Dónde está el elemento relativo al documento
      const elTop = el.parentElement.offsetTop || el.offsetTop;
      const rect = el.getBoundingClientRect();
      
      // La altura en la que el elemento entra a la vista (visión bottom)
      const elementTopInView = rect.top; 
      
      // Progreso mapeado (0 = apenas asoma por abajo, 1 = llegó al centro/tercio superior)
      // Ajustamos el umbral para que termine el efecto antes de que desaparezca por arriba
      let progress = 1 - ((elementTopInView - (windowHeight * 0.2)) / (windowHeight * 0.6));
      
      // Limpiar límites entre 0 y 1
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      // Calcular físicas (Mientras más grande el scroll, más opaco, grande y menos bajo)
      const opacity = progress;
      const translateY = 80 * (1 - progress); // Empieza 80px abajo, termina en 0
      const scale = 0.85 + (0.15 * progress); // Empieza en 85% tamaño, termina en 100%
      const blur = 10 * (1 - progress); // Empieza 10px difuminado, termina en 0
      
      // Aplicar dinámicamente atado al milímetro del scroll del usuario
      el.style.opacity = opacity;
      el.style.transform = `translateY(${translateY}px) scale(${scale})`;
      el.style.filter = `blur(${blur}px)`;
      el.style.transition = "none"; // Desactivar transición CSS para que reaccione al instante con el dedo/rueda
    });
  }

  // Agregamos el listener amarrado al RAF para alto rendimiento
  let isTicking = false;
  window.addEventListener("scroll", () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        onScrollReveal();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });
  
  // Correr al iniciar por si recargó a la mitad de la página
  onScrollReveal();

  /* ── 4. SMOOTH SCROLL for anchor links ───────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--navbar-h",
        ) || "72",
        10,
      );
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ── 5. PARALLAX – subtle blob movement on mouse ─── */
  const blobs = document.querySelectorAll(".blob");

  function onMouseMove(e) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 to 1
    const dy = (e.clientY - cy) / cy; // -1 to 1

    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 8;
      const x = dx * factor;
      const y = dy * factor;
      blob.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // Only activate on non-touch devices
  if (window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("mousemove", onMouseMove, { passive: true });
  }

  /* ── 7. CARD TILT effect (value-card) ───────────── */
  const tiltCards = document.querySelectorAll(".value-card");

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });

  /* ── 8. HERO CTA button – magnetic hover ─────────── */
  function magneticEffect(selector) {
    const el = document.querySelector(selector);
    if (!el || !window.matchMedia("(hover: hover)").matches) return;

    el.addEventListener("mousemove", function (e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "";
    });
  }

  magneticEffect("#hero-cta-primary");
  magneticEffect("#cta-final-btn");

  /* ── 10. ACTIVE NAV LINK STYLE (CSS helper) ─────── */
  const style = document.createElement("style");
  style.textContent = `
    .navbar__link.active {
      color: var(--primary-dark) !important;
    }
    .navbar__link.active::after {
      left: 0.8rem !important;
      right: 0.8rem !important;
    }
  `;
  document.head.appendChild(style);

  // Fallback: If elements are still hidden after 3 seconds, force them visible
  setTimeout(() => {
    document.documentElement.classList.remove('js-ready');
  }, 3000);

  }); // End of DOMContentLoaded
})();
