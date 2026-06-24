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
