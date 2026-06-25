const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const navLinks = document.querySelectorAll(".nav-links a");
const navAnchorLinks = [...document.querySelectorAll(".nav-links a[href^='#']:not([data-demo-open])")];
const scrollProgress = document.querySelector(".scroll-progress");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const updateScrollProgress = () => {
  if (!scrollProgress) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const sectionTargets = navAnchorLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const updateActiveNav = () => {
  if (!sectionTargets.length) return;
  const current = sectionTargets.reduce((active, section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= 130 ? section : active;
  }, sectionTargets[0]);

  navAnchorLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
};

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

const demoDrawer = document.querySelector("[data-demo-drawer]");
const demoOpeners = document.querySelectorAll("[data-demo-open]");
const demoClosers = document.querySelectorAll("[data-demo-close]");
const demoPanel = demoDrawer?.querySelector(".demo-drawer__panel");

const openDemoDrawer = () => {
  if (!demoDrawer) return;
  demoDrawer.classList.add("is-open");
  demoDrawer.setAttribute("aria-hidden", "false");
  body.classList.add("demo-drawer-open");
  body.classList.remove("nav-open");
  menuButton?.setAttribute("aria-expanded", "false");
  window.setTimeout(() => demoPanel?.focus(), 80);
};

const closeDemoDrawer = () => {
  if (!demoDrawer) return;
  demoDrawer.classList.remove("is-open");
  demoDrawer.setAttribute("aria-hidden", "true");
  body.classList.remove("demo-drawer-open");
};

demoOpeners.forEach((opener) => {
  opener.addEventListener("click", (event) => {
    if (!demoDrawer) return;
    event.preventDefault();
    openDemoDrawer();
  });
});

demoClosers.forEach((closer) => closer.addEventListener("click", closeDemoDrawer));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDemoDrawer();
    body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(node);
});

const counters = document.querySelectorAll("[data-count-to]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.countTo || 0);
      const suffix = counter.dataset.countSuffix || "";
      const duration = prefersReduced ? 1 : 1100;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(target * eased).toLocaleString("es-MX")}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.45 }
);

counters.forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll(".sk-product-frame, .sk-orbit-center, .sk-plan-box, .sk-final-box").forEach((node) => {
  node.setAttribute("data-parallax", "");
});

const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
let ticking = false;

const updateParallax = () => {
  if (prefersReduced) return;
  const viewport = window.innerHeight || 1;
  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const delta = (center - viewport / 2) / viewport;
    const y = Math.max(-26, Math.min(26, delta * -34));
    item.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
  });
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (ticking || prefersReduced) return;
    ticking = true;
    requestAnimationFrame(updateParallax);
  },
  { passive: true }
);

window.addEventListener("resize", updateParallax);
updateParallax();

document.querySelectorAll(".solution-card, .persona-card, .sk-site-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (prefersReduced) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll(".sk-rail, .sk-portfolio-track").forEach((rail) => {
  rail.addEventListener("mouseenter", () => {
    rail.style.animationPlayState = "paused";
  });
  rail.addEventListener("mouseleave", () => {
    rail.style.animationPlayState = "running";
  });
});

// ===== VIDEO TOUR MODAL =====
(function () {
  var VIDEO_URL = 'https://www.youtube.com/embed/iqzF2NVJtYE?autoplay=1&rel=0&modestbranding=1';
  var FALLBACK_URL = 'https://www.youtube.com/watch?v=iqzF2NVJtYE';

  var btn     = document.getElementById('video-tour-btn');
  var modal   = document.getElementById('video-modal');
  var backdrop = document.getElementById('video-modal-backdrop');
  var closeBtn = document.getElementById('video-modal-close');
  var iframe  = document.getElementById('video-modal-iframe');

  if (!btn || !modal) return;

  function openModal() {
    try {
      iframe.src = VIDEO_URL;
      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    } catch (e) {
      window.open(FALLBACK_URL, '_blank', 'noopener,noreferrer');
    }
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    iframe.src = '';          // detiene la reproducción
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
  });
})();

// ===== COOKIE CONSENT =====
(function () {
  var STORAGE_KEY = 'koo_cookie_consent';
  // DEMO MODE: cambiar a false en producción para guardar la decisión
  var DEMO_MODE = true;
  var banner = document.getElementById('cookie-banner');
  if (!banner) return;

  // En modo demo siempre muestra el banner (sin leer localStorage)
  if (!DEMO_MODE && localStorage.getItem(STORAGE_KEY)) return;

  // Mostrar con pequeño delay para no competir con la animación de página
  setTimeout(function () { banner.removeAttribute('hidden'); }, 800);

  function dismiss(choice) {
    // En producción (DEMO_MODE = false) guarda la decisión
    if (!DEMO_MODE) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        decision: choice,
        timestamp: new Date().toISOString()
      }));
    }
    banner.style.animation = 'none';
    banner.style.transition = 'opacity .25s ease, transform .25s ease';
    banner.style.opacity = '0';
    banner.style.transform = 'translateX(-50%) translateY(12px)';
    setTimeout(function () { banner.setAttribute('hidden', ''); }, 260);

    // Placeholder: cargar analytics opcionales solo si acepta todo
    if (choice === 'all') {
      // window.loadOptionalScripts?.();
    }
  }

  document.getElementById('cookie-accept').addEventListener('click', function () { dismiss('all'); });
  document.getElementById('cookie-reject').addEventListener('click', function () { dismiss('required'); });
  document.getElementById('cookie-manage').addEventListener('click', function () {
    // Por ahora trata "Manage preferences" como rechazo de opcionales
    // hasta que exista un modal de preferencias real
    dismiss('pending');
  });
})();

// ===== LOGIN DROPDOWN =====
(function () {
  const btn  = document.getElementById("login-btn");
  const menu = document.getElementById("login-menu");
  if (!btn || !menu) return;

  const items = () => [...menu.querySelectorAll("[role='menuitem']")];

  function open() {
    menu.removeAttribute("hidden");
    btn.setAttribute("aria-expanded", "true");
    // Focus primer ítem para navegación por teclado
    items()[0]?.focus();
  }

  function close() {
    menu.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", "false");
  }

  function toggle() {
    btn.getAttribute("aria-expanded") === "true" ? close() : open();
  }

  btn.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });

  // Cerrar al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!document.getElementById("login-wrap")?.contains(e.target)) close();
  });

  // Navegación por teclado: ArrowDown/Up entre items, Escape para cerrar
  menu.addEventListener("keydown", (e) => {
    const list = items();
    const idx  = list.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); list[(idx + 1) % list.length]?.focus(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); list[(idx - 1 + list.length) % list.length]?.focus(); }
    if (e.key === "Escape")    { close(); btn.focus(); }
    if (e.key === "Tab")       { close(); }
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown" && btn.getAttribute("aria-expanded") === "true") {
      e.preventDefault(); items()[0]?.focus();
    }
  });
})();

// ===== VIDEO LAZY LOAD =====
// Los videos usan data-src; solo se cargan cuando el mockup entra al viewport.
const lazyVideos = [...document.querySelectorAll("video[data-src]")];
if (lazyVideos.length) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const vid = entry.target;
      vid.src = vid.dataset.src;
      vid.removeAttribute("data-src");
      vid.play().catch(() => {});
      videoObserver.unobserve(vid);
    });
  }, { rootMargin: "200px" });
  lazyVideos.forEach((v) => videoObserver.observe(v));
}

// ===== IMG ONERROR (sin inline handlers) =====
document.querySelectorAll("img.sk-viiwlink-logo-img, img.sk-vl-topbar-logo").forEach((img) => {
  img.addEventListener("error", () => { img.style.display = "none"; });
});

// ===== FORMULARIO DE DEMO =====
const demoForm = document.getElementById("demo-form");
const formStatus = document.getElementById("form-status");
const formSubmitBtn = document.getElementById("form-submit-btn");

if (demoForm) {
  demoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot check (cliente)
    if (demoForm.website && demoForm.website.value) return;

    // Validación básica
    const email = demoForm.email.value.trim();
    const emailErr = document.getElementById("email-err");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!emailOk) {
      emailErr.textContent = "Ingresa un correo válido.";
      emailErr.removeAttribute("hidden");
      demoForm.email.setAttribute("aria-invalid", "true");
      demoForm.email.focus();
      return;
    }
    emailErr.setAttribute("hidden", "");
    demoForm.email.removeAttribute("aria-invalid");

    const message = demoForm.message ? demoForm.message.value : "";
    if (message.length > 1000) {
      showFormStatus("El mensaje no puede superar 1,000 caracteres.", "error");
      return;
    }

    // UI de carga
    formSubmitBtn.disabled = true;
    formSubmitBtn.textContent = "Enviando…";
    showFormStatus("", null);

    try {
      const res = await fetch("send.php", {
        method: "POST",
        body: new FormData(demoForm),
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        showFormStatus("¡Listo! Te contactaremos en menos de 24 horas para confirmar tu demo.", "success");
        demoForm.reset();
      } else {
        const text = await res.text().catch(() => "");
        showFormStatus(text || "Ocurrió un error. Intenta de nuevo.", "error");
      }
    } catch {
      showFormStatus("No se pudo enviar. Revisa tu conexión e intenta de nuevo.", "error");
    } finally {
      formSubmitBtn.disabled = false;
      formSubmitBtn.textContent = "Agendar demo";
    }
  });
}

function showFormStatus(msg, type) {
  if (!formStatus) return;
  if (!msg) { formStatus.setAttribute("hidden", ""); return; }
  formStatus.textContent = msg;
  formStatus.className = "form-status form-status--" + type;
  formStatus.removeAttribute("hidden");
}

/* ── Step cards: flip por tap en dispositivos touch ── */
(function () {
  const isTouch = window.matchMedia("(hover: none)").matches;
  if (!isTouch) return;

  document.querySelectorAll(".sk-step-card").forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Toca para ver más detalles");

    function flipCard(e) {
      e.preventDefault();
      const flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(flipped));
    }

    card.addEventListener("click", flipCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") flipCard(e);
    });
  });
})();
