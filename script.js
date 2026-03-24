"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // === DETECÇÃO DE DISPOSITIVO TOUCH ===
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  /* ========================================================================
     1. CUSTOM CURSOR (ROSA/LUXO)
     ======================================================================== */
  if (!isTouchDevice) {
    const cursorDot = document.createElement("div");
    const cursorOutline = document.createElement("div");

    cursorDot.classList.add("cursor-dot");
    cursorOutline.classList.add("cursor-outline");

    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    let mouseX = 0,
      mouseY = 0;
    let outlineX = 0,
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
      outlineX += distX * 0.15;
      outlineY += distY * 0.15;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const interactables = document.querySelectorAll(
      "a, button, .magnetic, input, select, textarea",
    );
    if (interactables.length > 0) {
      interactables.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursorOutline.style.width = "60px";
          cursorOutline.style.height = "60px";
          cursorOutline.style.backgroundColor = "rgba(210, 138, 151, 0.1)";
        });
        el.addEventListener("mouseleave", () => {
          cursorOutline.style.width = "40px";
          cursorOutline.style.height = "40px";
          cursorOutline.style.backgroundColor = "transparent";
        });
      });
    }
  }

  /* ========================================================================
     2. PAGE TRANSITIONS (AWWWARDS STYLE)
     ======================================================================== */
  const pageTransition = document.querySelector(".page-transition");

  if (pageTransition) {
    // Reveal a página logo que carregar
    setTimeout(() => {
      pageTransition.classList.add("is-loaded");
    }, 100);

    // Interceptar cliques nos links para fazer a transição de saída
    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = link.getAttribute("href");

        // Ignorar links inválidos, âncoras (scroll interno) ou aba nova
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

        // Puxa a cortina preta
        pageTransition.classList.remove("is-loaded");
        pageTransition.classList.add("is-leaving");

        // Aguarda 800ms (tempo da animação CSS) e muda de página
        setTimeout(() => {
          window.location.href = target;
        }, 800);
      });
    });
  }

  /* ========================================================================
     3. LENIS SMOOTH SCROLL
     ======================================================================== */
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      duration: 1.2, // O "peso" do scroll
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Curva física perfeita
      smooth: true,
      smoothTouch: false, // Desligado no touch para não dar conflito com o dedo
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ========================================================================
     4. INTERSECTION OBSERVER (REVEAL ANIMATIONS)
     ======================================================================== */
  const elementsToReveal = document.querySelectorAll(
    "#hero, .page-header, .reveal-fade, .reveal-wrap",
  );

  if (elementsToReveal.length > 0) {
    const revealOptions = {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.1,
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
        }
      });
    }, revealOptions);

    elementsToReveal.forEach((el) => revealObserver.observe(el));
  }

  // Segurança caso o topo do site não ative sozinho via observer
  setTimeout(() => {
    const hero =
      document.getElementById("hero") || document.querySelector(".page-header");
    if (hero) hero.classList.add("is-revealed");
  }, 100);

  /* ========================================================================
     5. DYNAMIC SCROLL HEADER
     ======================================================================== */
  const header = document.getElementById("main-header");
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  /* ========================================================================
     6. SMOOTH PARALLAX IMAGENS
     ======================================================================== */
  const parallaxElements = document.querySelectorAll(
    ".parallax-bg, .parallax-img",
  );

  if (parallaxElements.length > 0 && !isTouchDevice) {
    let requestAnimationFrameId;
    const smoothParallax = () => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-speed")) || 0.2;
        el.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
      });
      requestAnimationFrameId = null;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!requestAnimationFrameId) {
          requestAnimationFrameId =
            window.requestAnimationFrame(smoothParallax);
        }
      },
      { passive: true },
    );
  }

  /* ========================================================================
     7. MAGNETIC EFFECT (Somente Desktop)
     ======================================================================== */
  const magnets = document.querySelectorAll(".magnetic");

  if (!isTouchDevice && magnets.length > 0) {
    magnets.forEach((magnet) => {
      magnet.addEventListener("mousemove", (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        magnet.style.transition = "none";
      });
      magnet.addEventListener("mouseleave", () => {
        magnet.style.transform = `translate(0px, 0px)`;
        magnet.style.transition =
          "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      });
    });
  }

  /* ========================================================================
     8. MOBILE MENU TOGGLE
     ======================================================================== */
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
        link.style.transitionDelay = `${index * 0.1}s`;
      });
    }
  }

  /* ========================================================================
     9. FORM SUBMISSION (VALIDAÇÃO E FEEDBACK)
     ======================================================================== */
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
          "Obrigado! Sua mensagem foi encaminhada ao nosso concierge. Retornaremos em breve.",
        );
        contactForm.reset();

        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
        submitBtn.style.pointerEvents = "auto";
      }, 1500);
    });
  }
});
