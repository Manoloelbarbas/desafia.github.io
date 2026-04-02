/*
  DesafIA - animations.js
  Scroll reveals, navbar effects, mobile menu,
  counter animations, parallax blobs and value-card canvases.
*/

(function () {
  "use strict";

  window.addEventListener("error", function () {
    document.documentElement.classList.remove("js-ready");
  });

  document.addEventListener("DOMContentLoaded", function () {
    /* 1. Navbar: scroll shadow and active link */
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".navbar__link");
    const sections = Array.from(navLinks)
      .map(function (link) {
        const href = link.getAttribute("href") || "";
        return href.startsWith("#") ? document.querySelector(href) : null;
      })
      .filter(Boolean);

    function updateActiveLink() {
      const scrollY = window.scrollY + 100;
      let current = null;

      sections.forEach(function (section) {
        if (section.offsetTop <= scrollY) current = section.id;
      });

      navLinks.forEach(function (link) {
        const href = link.getAttribute("href") || "";
        const targetId = href.startsWith("#") ? href.slice(1) : "";
        link.classList.toggle("active", !!targetId && targetId === current);
      });
    }

    function onScroll() {
      if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
      }
      updateActiveLink();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* 2. Mobile menu */
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = document.querySelectorAll(
      ".mobile-menu__link, .mobile-menu__cta",
    );

    function toggleMenu(open) {
      if (!hamburger || !mobileMenu) return;
      hamburger.classList.toggle("active", open);
      mobileMenu.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    }

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", function () {
        const isOpen = mobileMenu.classList.contains("open");
        toggleMenu(!isOpen);
      });

      mobileLinks.forEach(function (link) {
        link.addEventListener("click", function () {
          toggleMenu(false);
        });
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") toggleMenu(false);
      });
    }

    /* 3. Reveal on viewport */
    const revealEls = document.querySelectorAll(".reveal");

    function isNearViewport(el) {
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      return rect.top <= viewportHeight * 0.92 && rect.bottom >= viewportHeight * 0.08;
    }

    function revealElement(el) {
      if (el.classList.contains("visible")) return;
      const delay = parseInt(el.dataset.delay || "0", 10);
      el.style.transitionDelay = delay + "ms";
      el.classList.add("visible");

      el.querySelectorAll("[data-count]").forEach(function (counter) {
        startCountAnimation(counter);
      });
    }

    function syncRevealState() {
      revealEls.forEach(function (el) {
        if (isNearViewport(el)) revealElement(el);
      });
    }

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            revealElement(entry.target);
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -10% 0px",
        },
      );

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        revealElement(el);
      });
    }

    window.requestAnimationFrame(syncRevealState);
    window.addEventListener("load", syncRevealState);
    window.addEventListener("hashchange", function () {
      window.requestAnimationFrame(syncRevealState);
    });

    /* 4. Smooth scroll for in-page anchors */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        const href = this.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();

        const offset = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--navbar-h",
          ) || "72",
          10,
        );

        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });

    /* 5. Parallax for background blobs */
    const blobs = document.querySelectorAll(".blob");

    function onMouseMove(event) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (event.clientX - cx) / cx;
      const dy = (event.clientY - cy) / cy;

      blobs.forEach(function (blob, index) {
        const factor = (index + 1) * 8;
        blob.style.transform = "translate(" + dx * factor + "px, " + dy * factor + "px)";
      });
    }

    if (blobs.length && window.matchMedia("(hover: hover)").matches) {
      document.addEventListener("mousemove", onMouseMove, { passive: true });
    }

    /* 6. Card tilt effect */
    const tiltCards = document.querySelectorAll(".value-card");

    if (window.matchMedia("(hover: hover)").matches) {
      tiltCards.forEach(function (card) {
        card.addEventListener("mousemove", function (event) {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const rotateX = ((y - cy) / cy) * -6;
          const rotateY = ((x - cx) / cx) * 6;

          card.style.transform =
            "perspective(600px) rotateX(" +
            rotateX +
            "deg) rotateY(" +
            rotateY +
            "deg) translateY(-6px)";
        });

        card.addEventListener("mouseleave", function () {
          card.style.transform = "";
        });
      });
    }

    /* 7. Magnetic CTA hover */
    function magneticEffect(selector) {
      const el = document.querySelector(selector);
      if (!el || !window.matchMedia("(hover: hover)").matches) return;

      el.addEventListener("mousemove", function (event) {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.3;
        el.style.transform = "translate(" + x + "px, " + y + "px)";
      });

      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    }

    magneticEffect("#hero-cta-primary");
    magneticEffect("#cta-final-btn");

    /* 8. Active nav link helper style */
    const activeLinkStyle = document.createElement("style");
    activeLinkStyle.textContent = [
      ".navbar__link.active {",
      "  color: var(--primary-dark) !important;",
      "}",
      ".navbar__link.active::after {",
      "  left: 0.8rem !important;",
      "  right: 0.8rem !important;",
      "}",
    ].join("\n");
    document.head.appendChild(activeLinkStyle);

    /* 9. Count-up animation */
    function startCountAnimation(el) {
      if (el.dataset.countStarted === "true") return;
      el.dataset.countStarted = "true";

      const target = parseInt(el.dataset.count || "", 10);
      if (Number.isNaN(target)) return;

      const revealParent = el.closest(".reveal");
      const revealDelay = revealParent
        ? parseInt(revealParent.dataset.delay || "0", 10)
        : 0;
      const delay = revealDelay + 250;
      const duration = 1800;

      window.setTimeout(function () {
        const start = Date.now();
        const timer = window.setInterval(function () {
          const elapsed = Math.max(0, Date.now() - start);
          const t = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = Math.round(eased * target) + "%";
          if (t >= 1) window.clearInterval(timer);
        }, 16);
      }, delay);
    }

    const countEls = document.querySelectorAll("[data-count]");

    function syncVisibleCounts() {
      countEls.forEach(function (el) {
        if (isNearViewport(el)) startCountAnimation(el);
      });
    }

    countEls.forEach(function (el) {
      if (!("IntersectionObserver" in window)) {
        startCountAnimation(el);
        return;
      }

      const countObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            startCountAnimation(el);
            observer.disconnect();
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -10% 0px",
        },
      );

      countObserver.observe(el);
    });

    window.requestAnimationFrame(syncVisibleCounts);
    window.addEventListener("load", syncVisibleCounts);
    window.addEventListener("resize", syncVisibleCounts);
    window.addEventListener("scroll", syncVisibleCounts, { passive: true });
    window.addEventListener("hashchange", function () {
      window.requestAnimationFrame(syncVisibleCounts);
    });
    window.setTimeout(syncVisibleCounts, 300);
    window.setTimeout(syncVisibleCounts, 900);
    window.setTimeout(function () {
      countEls.forEach(function (el) {
        startCountAnimation(el);
      });
    }, 3200);

    /* 10. Value card canvas animations */
    const cardCanvases = document.querySelectorAll(".value-card__canvas");

    cardCanvases.forEach(function (canvas) {
      try {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const animType = canvas.dataset.anim || "";
        const dpr = window.devicePixelRatio || 1;
        let raf = 0;

        function resize() {
          const parent = canvas.parentElement;
          if (!parent) return false;

          const pw = parent.clientWidth;
          const ph = parent.clientHeight;
          if (!pw || !ph) return false;

          canvas.width = Math.round(pw * dpr);
          canvas.height = Math.round(ph * dpr);
          canvas.style.width = pw + "px";
          canvas.style.height = ph + "px";
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          return true;
        }

        function getDimensions() {
          return {
            w: canvas.width / dpr,
            h: canvas.height / dpr,
          };
        }

        function requestResizeUntilReady() {
          if (resize()) return;
          window.requestAnimationFrame(requestResizeUntilReady);
        }

        if (!resize()) {
          requestResizeUntilReady();
        }

        if (animType === "bars") {
          const bars = [];
          for (let i = 0; i < 12; i += 1) {
            bars.push({
              speed: 0.3 + Math.random() * 0.7,
              maxH: 0.3 + Math.random() * 0.7,
            });
          }

          function drawBars(time) {
            const size = getDimensions();
            const w = size.w;
            const h = size.h;
            if (!w || !h) {
              raf = window.requestAnimationFrame(drawBars);
              return;
            }

            ctx.clearRect(0, 0, w, h);

            const gap = w / bars.length;
            const barW = gap * 0.55;

            for (let i = 0; i < bars.length; i += 1) {
              const bar = bars[i];
              const target = bar.maxH * h * 0.7;
              const wave = Math.sin(time * 0.001 * bar.speed + i * 0.8) * 0.15 + 0.85;
              const barH = target * wave;
              const x = i * gap + (gap - barW) / 2;
              const gradient = ctx.createLinearGradient(x, h, x, h - barH);

              gradient.addColorStop(0, "rgba(0, 191, 255, 0.78)");
              gradient.addColorStop(1, "rgba(0, 191, 255, 0.2)");

              ctx.fillStyle = gradient;
              ctx.beginPath();
              if (typeof ctx.roundRect === "function") {
                ctx.roundRect(x, h - barH, barW, barH, [4, 4, 0, 0]);
              } else {
                ctx.rect(x, h - barH, barW, barH);
              }
              ctx.fill();
            }

            raf = window.requestAnimationFrame(drawBars);
          }

          raf = window.requestAnimationFrame(drawBars);
        }

        if (animType === "trend") {
          const particles = [];
          for (let i = 0; i < 30; i += 1) {
            particles.push({
              x: Math.random(),
              y: Math.random(),
              vy: -(0.2 + Math.random() * 0.5),
              size: 1.5 + Math.random() * 2.5,
              alpha: 0.35 + Math.random() * 0.45,
            });
          }

          function drawTrend(time) {
            const size = getDimensions();
            const w = size.w;
            const h = size.h;
            if (!w || !h) {
              raf = window.requestAnimationFrame(drawTrend);
              return;
            }

            ctx.clearRect(0, 0, w, h);

            ctx.beginPath();
            ctx.strokeStyle = "rgba(65, 105, 225, 0.72)";
            ctx.lineWidth = 2.5;
            for (let x = 0; x <= w; x += 2) {
              const t = x / w;
              const y = h * (0.85 - t * 0.6) + Math.sin(t * 8 + time * 0.002) * 12;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.beginPath();
            for (let x = 0; x <= w; x += 2) {
              const t = x / w;
              const y = h * (0.85 - t * 0.6) + Math.sin(t * 8 + time * 0.002) * 12;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, "rgba(65, 105, 225, 0.38)");
            gradient.addColorStop(1, "rgba(65, 105, 225, 0)");
            ctx.fillStyle = gradient;
            ctx.fill();

            for (let i = 0; i < particles.length; i += 1) {
              const particle = particles[i];
              particle.y += particle.vy * 0.003;
              if (particle.y < -0.1) {
                particle.y = 1.1;
                particle.x = Math.random();
              }

              ctx.beginPath();
              ctx.arc(particle.x * w, particle.y * h, particle.size, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(65, 105, 225, " + particle.alpha + ")";
              ctx.fill();
            }

            raf = window.requestAnimationFrame(drawTrend);
          }

          raf = window.requestAnimationFrame(drawTrend);
        }

        if (animType === "network") {
          const nodes = [];
          for (let i = 0; i < 18; i += 1) {
            nodes.push({
              x: Math.random(),
              y: Math.random(),
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              r: 2 + Math.random() * 2.5,
            });
          }

          function drawNetwork() {
            const size = getDimensions();
            const w = size.w;
            const h = size.h;
            if (!w || !h) {
              raf = window.requestAnimationFrame(drawNetwork);
              return;
            }

            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < nodes.length; i += 1) {
              const node = nodes[i];
              node.x += node.vx * 0.002;
              node.y += node.vy * 0.002;

              if (node.x < 0 || node.x > 1) node.vx *= -1;
              if (node.y < 0 || node.y > 1) node.vy *= -1;

              node.x = Math.max(0, Math.min(1, node.x));
              node.y = Math.max(0, Math.min(1, node.y));
            }

            for (let i = 0; i < nodes.length; i += 1) {
              for (let j = i + 1; j < nodes.length; j += 1) {
                const dx = (nodes[i].x - nodes[j].x) * w;
                const dy = (nodes[i].y - nodes[j].y) * h;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                  const alpha = (1 - dist / 120) * 0.62;
                  ctx.beginPath();
                  ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
                  ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
                  ctx.strokeStyle = "rgba(139, 92, 246, " + alpha + ")";
                  ctx.lineWidth = 1;
                  ctx.stroke();
                }
              }
            }

            for (let i = 0; i < nodes.length; i += 1) {
              const node = nodes[i];
              ctx.beginPath();
              ctx.arc(node.x * w, node.y * h, node.r, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(139, 92, 246, 0.85)";
              ctx.fill();
            }

            raf = window.requestAnimationFrame(drawNetwork);
          }

          raf = window.requestAnimationFrame(drawNetwork);
        }

        window.addEventListener("resize", function () {
          resize();
        });

        if ("ResizeObserver" in window && canvas.parentElement) {
          const observer = new ResizeObserver(function () {
            resize();
          });
          observer.observe(canvas.parentElement);
        }

        canvas.addEventListener("DOMNodeRemoved", function () {
          if (raf) window.cancelAnimationFrame(raf);
        });
      } catch (error) {
        console.error("Value card animation error:", error);
      }
    });

    window.setTimeout(function () {
      document.documentElement.classList.remove("js-ready");
    }, 3000);
  });
})();
