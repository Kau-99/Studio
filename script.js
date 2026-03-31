"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // === DETECÇÃO DE DISPOSITIVO TOUCH ===
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  /* === 1. CUSTOM CURSOR (ROSA/LUXO) === */
  if (!isTouchDevice) {
    const cursorDot = document.createElement("div");
    const cursorOutline = document.createElement("div");

    cursorDot.classList.add("cursor-dot");
    cursorOutline.classList.add("cursor-outline");

    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    let mouseX = 0,
      mouseY = 0,
      outlineX = 0,
      outlineY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const animateCursor = () => {
      let distX = mouseX - outlineX;
      let distY = mouseY - outlineY;
      outlineX += distX * 0.2;
      outlineY += distY * 0.2;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const interactables = document.querySelectorAll(
      "a, button, .magnetic, input, select, textarea",
    );
    interactables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursorOutline.style.width = "70px";
        cursorOutline.style.height = "70px";
        cursorOutline.style.backgroundColor = "rgba(210, 138, 151, 0.15)";
      });
      el.addEventListener("mouseleave", () => {
        cursorOutline.style.width = "40px";
        cursorOutline.style.height = "40px";
        cursorOutline.style.backgroundColor = "transparent";
      });
    });
  }

  /* === 2. PAGE TRANSITIONS (CORTINA) === */
  const pageTransition = document.querySelector(".page-transition");
  if (pageTransition) {
    setTimeout(() => pageTransition.classList.add("is-loaded"), 150);

    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = link.getAttribute("href");
        if (
          !target ||
          target.startsWith("#") ||
          target.startsWith("mailto:") ||
          target.startsWith("tel:") ||
          link.target === "_blank"
        ) {
          return;
        }
        e.preventDefault();
        pageTransition.classList.remove("is-loaded");
        pageTransition.classList.add("is-leaving");
        setTimeout(() => {
          window.location.href = target;
        }, 800);
      });
    });
  }

  /* === 3. LENIS SMOOTH SCROLL === */
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* === 4. INTERSECTION OBSERVER (OTIMIZADO) === */
  const elementsToReveal = document.querySelectorAll(
    "#hero, .page-header, .reveal-fade, .reveal-wrap",
  );
  if (elementsToReveal.length > 0) {
    const revealOptions = {
      root: null,
      rootMargin: "0px 0px -15% 0px",
      threshold: 0.1,
    };
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target); // Aciona só uma vez!
        }
      });
    }, revealOptions);
    elementsToReveal.forEach((el) => revealObserver.observe(el));
  }
  setTimeout(() => {
    const hero =
      document.getElementById("hero") || document.querySelector(".page-header");
    if (hero) hero.classList.add("is-revealed");
  }, 150);

  /* === 5. DYNAMIC SCROLL HEADER === */
  const header = document.getElementById("main-header");
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 50) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  /* === 6. SMOOTH PARALLAX === */
  const parallaxElements = document.querySelectorAll(
    ".parallax-bg, .parallax-img",
  );
  if (parallaxElements.length > 0 && !isTouchDevice) {
    let requestAnimationFrameId;
    const smoothParallax = () => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed")) || 0.15;
        el.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
      });
      requestAnimationFrameId = null;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!requestAnimationFrameId)
          requestAnimationFrameId =
            window.requestAnimationFrame(smoothParallax);
      },
      { passive: true },
    );
  }

  /* === 7. MAGNETIC EFFECT === */
  const magnets = document.querySelectorAll(".magnetic");
  if (!isTouchDevice && magnets.length > 0) {
    magnets.forEach((magnet) => {
      magnet.addEventListener("mousemove", (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        magnet.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        magnet.style.transition = "transform 0.1s linear";
      });
      magnet.addEventListener("mouseleave", () => {
        magnet.style.transform = `translate(0px, 0px)`;
        magnet.style.transition =
          "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)";
      });
    });
  }

  /* === 8. MOBILE MENU === */
  const menuToggleBtn = document.querySelector(".menu-toggle");
  const menuCloseBtn = document.querySelector(".menu-close");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (mobileMenuOverlay) {
    const openMenu = () => {
      mobileMenuOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };
    const closeMenu = () => {
      mobileMenuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    };
    if (menuToggleBtn) menuToggleBtn.addEventListener("click", openMenu);
    if (menuCloseBtn) menuCloseBtn.addEventListener("click", closeMenu);
    if (mobileLinks.length > 0) {
      mobileLinks.forEach((link, index) => {
        link.addEventListener("click", closeMenu);
        link.style.transitionDelay = `${index * 0.08}s`;
      });
    }
  }

  /* === 9. FORM SUBMISSION === */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.pointerEvents = "none";
      setTimeout(() => {
        alert(
          "Sua solicitação foi encaminhada ao nosso concierge. Retornaremos com elegância e brevidade.",
        );
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
        submitBtn.style.pointerEvents = "auto";
      }, 1500);
    });
  }
});
