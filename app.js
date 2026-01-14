/*
  Project: Personal Landing Page
  Author: Humoyun Polatov
*/

(function () {
  "use strict";

  // ===== Helpers =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== Elements =====
  const yearEl = $("#year");
  const progressBar = $("#progressBar");

  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");

  const themeToggle = $("#themeToggle");

  const copyEmailBtn = $("#copyEmailBtn");
  const emailText = $("#emailText");
  const copyHint = $("#copyHint");

  const tabs = $$(".tab");
  const projectGrid = $("#projectGrid");
  const searchInput = $("#searchInput");

  const counters = $$("[data-counter]");

  const contactForm = $("#contactForm");
  const formHint = $("#formHint");

  // ===== Init =====
  yearEl.textContent = String(new Date().getFullYear());

  // Theme: restore from localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // ===== Progress Bar =====
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const percent = height > 0 ? (scrollTop / height) * 100 : 0;
    progressBar.style.width = `${percent}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ===== Mobile Nav =====
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a link (mobile)
  $$(".nav__link").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // ===== Theme Toggle =====
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  // ===== Copy Email =====
  copyEmailBtn.addEventListener("click", async () => {
    const email = emailText.textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
      copyHint.textContent = "Email nusxalandi.";
    } catch {
      // Fallback: select text (works in most browsers)
      copyHint.textContent = "Clipboard ruxsati yo‘q. Email’ni qo‘lda nusxalang.";
    }
    setTimeout(() => (copyHint.textContent = ""), 1800);
  });

  // ===== Animated Counters =====
  const animateCounter = (el, target, durationMs = 800) => {
    const start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const val = Math.floor(start + (target - start) * t);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.getAttribute("data-counter") || "0");
        animateCounter(el, target);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => counterObserver.observe(el));

  // ===== Projects Filter + Search =====
  const getProjects = () => $$(".project", projectGrid);

  const applyFilter = () => {
    const activeTab = tabs.find((t) => t.classList.contains("is-active"));
    const filter = activeTab ? activeTab.dataset.filter : "all";
    const q = (searchInput.value || "").trim().toLowerCase();

    getProjects().forEach((card) => {
      const tags = (card.dataset.tags || "").toLowerCase();
      const text = (card.textContent || "").toLowerCase();

      const matchesFilter = filter === "all" ? true : tags.includes(filter);
      const matchesSearch = q.length === 0 ? true : (tags.includes(q) || text.includes(q));

      card.style.display = matchesFilter && matchesSearch ? "" : "none";
    });
  };

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      applyFilter();
    });
  });

  searchInput.addEventListener("input", applyFilter);

  // ===== Form Validation (Front-end) =====
  const showError = (name, msg) => {
    const p = document.querySelector(`[data-error-for="${name}"]`);
    if (p) p.textContent = msg || "";
  };

  const isValidEmail = (email) => {
    // Basic email pattern (not perfect by design; enough for UI validation)
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  };

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formHint.textContent = "";

    // Clear old errors
    ["name", "email", "message"].forEach((k) => showError(k, ""));

    const name = $("#name").value.trim();
    const email = $("#email").value.trim();
    const message = $("#message").value.trim();

    let ok = true;

    if (name.length < 2) {
      showError("name", "Ism kamida 2 ta belgi bo‘lsin.");
      ok = false;
    }

    if (!isValidEmail(email)) {
      showError("email", "Email formati noto‘g‘ri.");
      ok = false;
    }

    if (message.length < 10) {
      showError("message", "Xabar kamida 10 ta belgi bo‘lsin.");
      ok = false;
    }

    if (!ok) {
      formHint.textContent = "Forma xatolari bor. Iltimos, tekshiring.";
      return;
    }

    // Demo success (backend ulanmadi)
    formHint.textContent = "Xabar qabul qilindi (demo). Backend ulansa real yuboriladi.";
    contactForm.reset();
  });

  // Initial filter apply
  applyFilter();
})();
