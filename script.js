"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Marca o body como pronto para ativar animações CSS
  document.body.classList.add("js-ready");

  // Ano dinâmico no footer — suporta múltiplos elementos por página
  document.querySelectorAll("#footer-year").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Fallback visual para imagens com erro de carregamento
  document.querySelectorAll("img").forEach((img) => {
    const handleError = () => {
      img.classList.add("img-error");
      img.closest(".ed-img-wrap")?.classList.add("img-failed");
    };
    if (img.complete && img.naturalWidth === 0) {
      handleError();
    } else {
      img.addEventListener("error", handleError, { once: true });
    }
  });

  // === DETECÇÃO DE DISPOSITIVO E PREFERÊNCIAS ===
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* === 1. CUSTOM CURSOR (ROSA/LUXO) === */
  if (!isTouchDevice && !prefersReducedMotion) {
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
    let cursorRafId = null;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const animateCursor = () => {
      const distX = mouseX - outlineX;
      const distY = mouseY - outlineY;
      outlineX += distX * 0.2;
      outlineY += distY * 0.2;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      cursorRafId = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (cursorRafId) cancelAnimationFrame(cursorRafId);
      } else {
        cursorRafId = requestAnimationFrame(animateCursor);
      }
    });

    const interactables = document.querySelectorAll(
      "a, button, .magnetic, input, select, textarea"
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

    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = link.getAttribute("href");
        if (
          !target ||
          target.startsWith("#") ||
          target.startsWith("mailto:") ||
          target.startsWith("tel:") ||
          link.target === "_blank" ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey
        ) {
          return;
        }
        e.preventDefault();
        pageTransition.classList.remove("is-loaded");
        pageTransition.classList.add("is-leaving");
        const delay = prefersReducedMotion ? 0 : 800;
        setTimeout(() => {
          window.location.href = target;
        }, delay);
      });
    });
  }

  /* === 3. LENIS SMOOTH SCROLL === */
  if (typeof Lenis !== "undefined" && !prefersReducedMotion) {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    let lenisRafId;
    function raf(time) {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(raf);
    }
    lenisRafId = requestAnimationFrame(raf);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (lenisRafId) cancelAnimationFrame(lenisRafId);
      } else {
        lenisRafId = requestAnimationFrame(raf);
      }
    });
  }

  /* === 4. INTERSECTION OBSERVER (REVEAL) === */
  const elementsToReveal = document.querySelectorAll(
    "#hero, .reveal-fade, .reveal-wrap"
  );

  if (elementsToReveal.length > 0) {
    if (prefersReducedMotion) {
      elementsToReveal.forEach((el) => el.classList.add("is-revealed"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
      );
      elementsToReveal.forEach((el) => revealObserver.observe(el));
    }
  }

  setTimeout(() => {
    const firstReveal = document.getElementById("hero");
    if (firstReveal) firstReveal.classList.add("is-revealed");
  }, 150);

  /* === 5. DYNAMIC SCROLL HEADER === */
  const header = document.getElementById("main-header");
  if (header) {
    const handleScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  /* === 6. SMOOTH PARALLAX === */
  if (!prefersReducedMotion && !isTouchDevice) {
    const parallaxElements = document.querySelectorAll(
      ".parallax-bg, .parallax-img"
    );
    if (parallaxElements.length > 0) {
      let parallaxRafId = null;
      const smoothParallax = () => {
        const scrolled = window.pageYOffset;
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.getAttribute("data-speed")) || 0.15;
          el.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
        });
        parallaxRafId = null;
      };
      window.addEventListener(
        "scroll",
        () => {
          if (!parallaxRafId) {
            parallaxRafId = requestAnimationFrame(smoothParallax);
          }
        },
        { passive: true }
      );
    }
  }

  /* === 7. MAGNETIC EFFECT === */
  if (!isTouchDevice && !prefersReducedMotion) {
    const magnets = document.querySelectorAll(".magnetic");
    magnets.forEach((magnet) => {
      magnet.addEventListener("mousemove", (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        magnet.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        magnet.style.transition = "transform 0.1s linear";
      });
      magnet.addEventListener("mouseleave", () => {
        magnet.style.transform = "translate(0px, 0px)";
        magnet.style.transition =
          "transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)";
      });
    });
  }

  /* === 8. MOBILE MENU + FOCUS TRAP === */
  const menuToggleBtn = document.querySelector(".menu-toggle");
  const menuCloseBtn = document.querySelector(".menu-close");
  const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (mobileMenuOverlay) {
    const openMenu = () => {
      mobileMenuOverlay.classList.add("active");
      mobileMenuOverlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (menuToggleBtn) menuToggleBtn.setAttribute("aria-expanded", "true");
      if (menuCloseBtn) menuCloseBtn.focus();
    };

    const closeMenu = () => {
      mobileMenuOverlay.classList.remove("active");
      mobileMenuOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (menuToggleBtn) {
        menuToggleBtn.setAttribute("aria-expanded", "false");
        menuToggleBtn.focus();
      }
    };

    // Focus trap completo (WCAG 2.1 AA)
    function trapFocus(element) {
      const focusable = element.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      element.addEventListener("keydown", function (e) {
        if (e.key !== "Tab") {
          if (e.key === "Escape") closeMenu();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      });
    }
    trapFocus(mobileMenuOverlay);

    if (menuToggleBtn) menuToggleBtn.addEventListener("click", openMenu);
    if (menuCloseBtn) menuCloseBtn.addEventListener("click", closeMenu);

    mobileLinks.forEach((link, index) => {
      link.addEventListener("click", closeMenu);
      if (!prefersReducedMotion) {
        link.style.transitionDelay = `${index * 0.08}s`;
      }
    });
  }

  /* === 9. FORM SUBMISSION === */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const isValidEmail = (email) =>
      /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i.test(email.trim());

    const showFormFeedback = (type, message) => {
      let feedback = contactForm.querySelector(".form-feedback");
      if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "form-feedback";
        feedback.setAttribute("role", "alert");
        feedback.setAttribute("aria-live", "polite");
        contactForm.appendChild(feedback);
      }
      feedback.className = `form-feedback form-feedback--${type}`;
      feedback.textContent = message;
      feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    const removeFormFeedback = () => {
      const feedback = contactForm.querySelector(".form-feedback");
      if (feedback) feedback.remove();
    };

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      removeFormFeedback();

      const nomeInput = contactForm.querySelector("#nome");
      const emailInput = contactForm.querySelector("#email");
      const assuntoInput = contactForm.querySelector("#assunto");
      const mensagemInput = contactForm.querySelector("#mensagem");
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (nomeInput && nomeInput.value.trim().length < 2) {
        showFormFeedback("error", "Por favor, informe seu nome completo.");
        nomeInput.focus();
        return;
      }
      if (emailInput && !isValidEmail(emailInput.value)) {
        showFormFeedback("error", "Por favor, informe um e-mail válido.");
        emailInput.focus();
        return;
      }
      if (assuntoInput && !assuntoInput.value) {
        showFormFeedback("error", "Por favor, selecione o motivo do contato.");
        assuntoInput.focus();
        return;
      }
      if (mensagemInput && mensagemInput.value.trim().length < 10) {
        showFormFeedback("error", "Por favor, escreva uma mensagem com ao menos 10 caracteres.");
        mensagemInput.focus();
        return;
      }

      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
      submitBtn.disabled = true;

      // Substitua YOUR_FORM_ID pelo ID gerado em formspree.io após cadastrar o formulário
      const FORMSPREE_ID = "YOUR_FORM_ID";

      if (FORMSPREE_ID === "YOUR_FORM_ID") {
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          contactForm.reset();
          showFormFeedback("success", "Mensagem enviada com sucesso. Retornaremos em breve.");
        }, 1500);
        return;
      }

      fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      })
        .then((res) => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          if (res.ok) {
            contactForm.reset();
            showFormFeedback("success", "Mensagem enviada com sucesso. Retornaremos em breve.");
          } else {
            showFormFeedback("error", "Erro ao enviar. Por favor, tente novamente ou entre em contato por telefone.");
          }
        })
        .catch(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          showFormFeedback("error", "Sem conexão. Verifique sua internet e tente novamente.");
        });
    });
  }

  /* === 10. PARTICLE FIELDS === */
  if (!prefersReducedMotion && !isTouchDevice) {
    document.querySelectorAll(".particle-field").forEach((container) => {
      const count = parseInt(container.dataset.count || "20", 10);
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.setProperty("--x", Math.random() * 100 + "%");
        p.style.setProperty("--dur", (Math.random() * 10 + 7) + "s");
        p.style.setProperty("--delay", -(Math.random() * 14) + "s");
        p.style.setProperty("--drift", (Math.random() * 100 - 50) + "px");
        container.appendChild(p);
      }
    });
  }

  /* === 11. STATS COUNTER === */
  const statNumbers = document.querySelectorAll(".stat-number[data-target]");
  if (statNumbers.length > 0) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute("data-target"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = prefersReducedMotion ? 0 : 2200;

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      const startTime = performance.now();
      const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  /* === 12. FAQ ACCORDION === */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!btn || !answer) return;

    answer.style.maxHeight = null;
    answer.style.opacity = "0";
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";

      faqItems.forEach((other) => {
        if (other === item) return;
        const otherBtn = other.querySelector(".faq-question");
        const otherAnswer = other.querySelector(".faq-answer");
        if (otherBtn && otherAnswer) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherAnswer.style.maxHeight = null;
          otherAnswer.style.opacity = "0";
        }
      });

      if (isExpanded) {
        btn.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
        answer.style.opacity = "0";
      } else {
        btn.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.style.opacity = "1";
      }
    });
  });

  /* === 13. URGENCY BADGE DINÂMICO === */
  const badgeEl = document.querySelector(".badge-urgency[data-vagas]");
  if (badgeEl) {
    const vagas = parseInt(badgeEl.dataset.vagas || "3", 10);
    badgeEl.textContent =
      vagas <= 5
        ? `Apenas ${vagas} vaga${vagas !== 1 ? "s" : ""} disponível${vagas !== 1 ? "is" : ""}`
        : `${vagas} vagas disponíveis`;
  }

  /* === 14. SMOOTH SCROLL PARA ÂNCORAS INTERNAS === */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* === 15. COOKIE BANNER (LGPD) === */
  (function () {
    const banner = document.getElementById("cookie-banner");
    if (!banner) return;
    if (!localStorage.getItem("cookie_consent")) {
      setTimeout(() => banner.setAttribute("aria-hidden", "false"), 1200);
    }
    document.getElementById("cookie-accept")?.addEventListener("click", () => {
      localStorage.setItem("cookie_consent", "1");
      banner.setAttribute("aria-hidden", "true");
    });
    document.getElementById("cookie-dismiss")?.addEventListener("click", () => {
      banner.setAttribute("aria-hidden", "true");
    });
  })();
});
