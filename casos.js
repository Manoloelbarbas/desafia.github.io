// ═══════════════════════════════════════════════
//   DesafIA – casos.js
//   Crisp Loading Animation + Slideshow
//   Adapted from Osmo (osmo.supply)
// ═══════════════════════════════════════════════

gsap.registerPlugin(SplitText, CustomEase);
CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");

// ── Loading Animation ──────────────────────────
function initCrispLoadingAnimation() {
  const container = document.querySelector(".casos-hero");
  if (!container) return;

  const heading = container.querySelectorAll(".casos-hero__h1");
  const revealImages = container.querySelectorAll(".casos-loader__group > *");
  const isScaleUp = container.querySelectorAll(".casos-loader__media");
  const isScaleDown = container.querySelectorAll(
    ".casos-loader__media .is--scale-down"
  );
  const isRadius = container.querySelectorAll(
    ".casos-loader__media.is--scaling.is--radius"
  );
  const smallElements = container.querySelectorAll(
    ".casos-hero__top, .casos-hero__captions"
  );
  const sliderNav = container.querySelectorAll(".casos-hero__nav > *");

  /* GSAP Timeline */
  const tl = gsap.timeline({
    defaults: {
      ease: "expo.inOut",
    },
    onStart: () => {
      container.classList.remove("is--hidden");
    },
  });

  /* GSAP SplitText */
  let split;
  if (heading.length) {
    split = new SplitText(heading, {
      type: "words",
      mask: "words",
    });

    gsap.set(split.words, {
      yPercent: 110,
    });
  }

  /* Start of Timeline */
  if (revealImages.length) {
    tl.fromTo(
      revealImages,
      { xPercent: 500 },
      {
        xPercent: -500,
        duration: 2.5,
        stagger: 0.05,
      }
    );
  }

  if (isScaleDown.length) {
    tl.to(
      isScaleDown,
      {
        scale: 0.5,
        duration: 2,
        stagger: {
          each: 0.05,
          from: "edges",
          ease: "none",
        },
        onComplete: () => {
          if (isRadius) {
            isRadius.forEach((el) => el.classList.remove("is--radius"));
          }
        },
      },
      "-=0.1"
    );
  }

  if (isScaleUp.length) {
    tl.fromTo(
      isScaleUp,
      { width: "10em", height: "10em" },
      {
        width: "100vw",
        height: "100dvh",
        duration: 2,
      },
      "< 0.5"
    );
  }

  if (sliderNav.length) {
    tl.from(
      sliderNav,
      {
        yPercent: 150,
        stagger: 0.05,
        ease: "expo.out",
        duration: 1,
      },
      "-=0.9"
    );
  }

  if (split && split.words.length) {
    tl.to(
      split.words,
      {
        yPercent: 0,
        stagger: 0.075,
        ease: "expo.out",
        duration: 1,
      },
      "< 0.1"
    );
  }

  if (smallElements.length) {
    tl.from(
      smallElements,
      {
        opacity: 0,
        ease: "power1.inOut",
        duration: 0.2,
      },
      "< 0.15"
    );
  }

  tl.call(
    function () {
      container.classList.remove("is--loading");
    },
    null,
    "+=0.45"
  );
}

// ── Slideshow ──────────────────────────────────
function initSlideShow(el) {
  const ui = {
    el,
    slides: Array.from(el.querySelectorAll('[data-slideshow="slide"]')),
    inner: Array.from(el.querySelectorAll('[data-slideshow="parallax"]')),
    thumbs: Array.from(el.querySelectorAll('[data-slideshow="thumb"]')),
    captions: Array.from(el.querySelectorAll("[data-caption]")),
  };

  let current = 0;
  const length = ui.slides.length;
  let animating = false;
  const animationDuration = 1.5;

  ui.slides.forEach((slide, index) =>
    slide.setAttribute("data-index", index)
  );
  ui.thumbs.forEach((thumb, index) =>
    thumb.setAttribute("data-index", index)
  );

  ui.slides[current].classList.add("is--current");
  ui.thumbs[current].classList.add("is--current");

  // Set initial caption
  if (ui.captions.length) {
    ui.captions.forEach((cap) => cap.classList.remove("is--active"));
    if (ui.captions[current]) {
      ui.captions[current].classList.add("is--active");
    }
  }

  function navigate(direction, targetIndex = null) {
    if (animating) return;
    animating = true;

    const previous = current;
    current =
      targetIndex !== null && targetIndex !== undefined
        ? targetIndex
        : direction === 1
          ? current < length - 1
            ? current + 1
            : 0
          : current > 0
            ? current - 1
            : length - 1;

    const currentSlide = ui.slides[previous];
    const currentInner = ui.inner[previous];
    const upcomingSlide = ui.slides[current];
    const upcomingInner = ui.inner[current];

    gsap
      .timeline({
        defaults: { duration: animationDuration, ease: "slideshow-wipe" },
        onStart() {
          upcomingSlide.classList.add("is--current");
          ui.thumbs[previous].classList.remove("is--current");
          ui.thumbs[current].classList.add("is--current");

          // Update captions
          if (ui.captions.length) {
            ui.captions.forEach((cap) => cap.classList.remove("is--active"));
            if (ui.captions[current]) {
              ui.captions[current].classList.add("is--active");
            }
          }
        },
        onComplete() {
          currentSlide.classList.remove("is--current");
          animating = false;
        },
      })
      .to(currentSlide, { xPercent: -direction * 100 }, 0)
      .to(currentInner, { xPercent: direction * 75 }, 0)
      .fromTo(
        upcomingSlide,
        { xPercent: direction * 100 },
        { xPercent: 0 },
        0
      )
      .fromTo(
        upcomingInner,
        { xPercent: -direction * 75 },
        { xPercent: 0 },
        0
      );
  }

  // Thumbnail click navigation
  ui.thumbs.forEach((thumb) => {
    thumb.addEventListener("click", (event) => {
      const targetIndex = parseInt(
        event.currentTarget.getAttribute("data-index"),
        10
      );
      if (targetIndex === current || animating) return;
      const direction = targetIndex > current ? 1 : -1;
      navigate(direction, targetIndex);
    });
  });

  // Auto-advance every 6 seconds
  let autoTimer = setInterval(() => navigate(1), 6000);

  // Pause auto on hover
  el.addEventListener("mouseenter", () => clearInterval(autoTimer));
  el.addEventListener("mouseleave", () => {
    autoTimer = setInterval(() => navigate(1), 6000);
  });
}

// ── Initialize ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(() => {
    initCrispLoadingAnimation();
  });

  document
    .querySelectorAll('[data-slideshow="wrap"]')
    .forEach((wrap) => initSlideShow(wrap));
});
