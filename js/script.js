/* ==========================================================================
   CarbonRoot — Shared behavior
   Vanilla JS. Every init function checks for its DOM hook before running,
   so pages only pay for the components they actually use.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initExploreDropdown();
  initCharacterCounters();
  initScrollReveal();
  initCounters();
  initForms();
  initMarketVisualization();
  initFinancialChart();
  initCompetitionVisualization();
  initTimeline();
  initHeroGrid();
});

/* ---------------------------------------------------------------------- */
/* Navigation: sticky compact header + mobile menu + active link          */
/* ---------------------------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const toggle = document.querySelector('.nav-toggle');
  const panel = document.getElementById('mobile-nav-panel');
  const closeButton = document.querySelector('.mobile-nav-close');
  const mobileLinks = document.querySelectorAll('[data-mobile-nav-link]');
  const desktopLinks = document.querySelectorAll('[data-nav-link]');
  const allLinks = [...desktopLinks, ...mobileLinks];
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mark the current page in both desktop and mobile navigation.
  allLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });

  if (!toggle || !panel) return;

  const openMenu = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    document.body.classList.add('nav-open');
    if (closeButton) closeButton.focus();
  };

  const closeMenu = (restoreFocus = true) => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('nav-open');
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  if (closeButton) closeButton.addEventListener('click', () => closeMenu());
  mobileLinks.forEach((link) => link.addEventListener('click', () => closeMenu(false)));

  panel.addEventListener('click', (event) => {
    if (event.target === panel) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Keep the drawer usable if the viewport changes from mobile to desktop.
  const media = window.matchMedia('(min-width: 1041px)');
  const handleViewportChange = (event) => {
    if (event.matches && panel.classList.contains('is-open')) closeMenu(false);
  };
  if (media.addEventListener) media.addEventListener('change', handleViewportChange);
}


/* ---------------------------------------------------------------------- */
/* Scroll-reveal for elements marked [data-reveal]                        */
/* ---------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 40);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------------- */
/* Animated number counters [data-counter="target"]                       */
/* ---------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------------- */
/* Forms — client-side validation + simulated submission state            */
/* ---------------------------------------------------------------------- */
function initForms() {
  const forms = document.querySelectorAll('[data-validate]');
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach((field) => {
        const wrap = field.closest('.field');
        const value = field.value.trim();
        let fieldValid = value.length > 0;
        if (field.type === 'email' && value) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (wrap) wrap.classList.toggle('has-error', !fieldValid);
        if (!fieldValid) valid = false;
      });

      const status = form.querySelector('.form-status');
      const submitBtn = form.querySelector('.btn-submit');

      if (!valid) {
        if (status) {
          status.textContent = 'Please fill in the required fields correctly before submitting.';
          status.className = 'form-status is-error';
        }
        return;
      }

      if (submitBtn) submitBtn.classList.add('is-loading');
      if (submitBtn) submitBtn.setAttribute('disabled', 'true');

      // No backend is connected — this simulates submission so the
      // interaction is honest about being front-end only.
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.removeAttribute('disabled');
        }
        if (status) {
          status.textContent = "Thanks — your message is ready to send. Since this page isn't yet connected to a backend, please also reach us directly at globalexpressgroup@gmail.com until that's live.";
          status.className = 'form-status is-success';
        }
        form.reset();
      }, 900);
    });

    form.querySelectorAll('[required]').forEach((field) => {
      field.addEventListener('input', () => {
        const wrap = field.closest('.field');
        if (wrap) wrap.classList.remove('has-error');
      });
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Market opportunity visualization (market.html) — animated depth bars   */
/* ---------------------------------------------------------------------- */
function initMarketVisualization() {
  const el = document.querySelector('[data-market-viz]');
  if (!el) return;

  const bars = el.querySelectorAll('.depth-bar-fill');
  if (!('IntersectionObserver' in window)) {
    bars.forEach((b) => (b.style.width = b.getAttribute('data-width')));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        bars.forEach((b, i) => {
          setTimeout(() => { b.style.width = b.getAttribute('data-width'); }, i * 120);
        });
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(el);
}

/* ---------------------------------------------------------------------- */
/* Financial chart (growth.html) — year selector + bar chart              */
/* ---------------------------------------------------------------------- */
function initFinancialChart() {
  const panel = document.querySelector('[data-financial-chart]');
  if (!panel) return;

  const data = {
    1: { credits: 100000, revenue: 300000, margin: -120000 },
    2: { credits: 750000, revenue: 2250000, margin: 900000 },
    3: { credits: 2500000, revenue: 7500000, margin: 3200000 },
  };
  const maxRevenue = 7500000;

  const buttons = panel.querySelectorAll('.year-toggle button');
  const barRevenue = panel.querySelector('.bar-revenue');
  const barCredits = panel.querySelector('.bar-credits');
  const outCredits = panel.querySelector('[data-out="credits"]');
  const outRevenue = panel.querySelector('[data-out="revenue"]');
  const outMargin = panel.querySelector('[data-out="margin"]');

  function render(year) {
    const d = data[year];
    buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.year === String(year)));
    if (barRevenue) barRevenue.style.height = Math.max(6, (d.revenue / maxRevenue) * 100) + '%';
    if (barCredits) barCredits.style.height = Math.max(6, (d.credits / 2500000) * 100) + '%';
    if (outCredits) outCredits.textContent = d.credits.toLocaleString('en-US');
    if (outRevenue) outRevenue.textContent = '$' + (d.revenue / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (outMargin) {
      const marginM = d.margin / 1000000;
      outMargin.textContent = (marginM < 0 ? '-$' : '$') + Math.abs(marginM).toFixed(2).replace(/\.00$/, '') + 'M';
    }
  }

  buttons.forEach((b) => {
    b.addEventListener('click', () => render(b.dataset.year));
  });

  render(1);
}

/* ---------------------------------------------------------------------- */
/* Competition quadrant — subtle entrance stagger                         */
/* ---------------------------------------------------------------------- */
function initCompetitionVisualization() {
  const quad = document.querySelector('.quadrant');
  if (!quad) return;
  const nodes = quad.querySelectorAll('.quadrant-node');
  if (!('IntersectionObserver' in window)) {
    nodes.forEach((n) => (n.style.opacity = 1));
    return;
  }
  // Positioning (left/top + the CSS translate(-50%,-50%)) must stay untouched,
  // so the entrance only animates opacity to avoid clobbering that transform.
  nodes.forEach((n) => { n.style.opacity = 0; n.style.transition = 'opacity 0.5s ease'; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        nodes.forEach((n, i) => {
          setTimeout(() => { n.style.opacity = 1; }, i * 100);
        });
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(quad);
}

/* ---------------------------------------------------------------------- */
/* Growth timeline — activates each year as it enters view                */
/* ---------------------------------------------------------------------- */
function initTimeline() {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-active'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-active');
      }
    });
  }, { threshold: 0.35 });
  items.forEach((i) => io.observe(i));
}

/* ---------------------------------------------------------------------- */
/* Hero grid — faint animated satellite-grid backdrop (canvas-free, CSS)  */
/* ---------------------------------------------------------------------- */
function initHeroGrid() {
  const svg = document.querySelector('[data-hero-flow]');
  if (!svg) return;
  const paths = svg.querySelectorAll('path.flow-line');
  paths.forEach((p, i) => {
    const length = p.getTotalLength();
    p.style.strokeDasharray = length;
    p.style.strokeDashoffset = length;
    p.getBoundingClientRect();
    p.style.transition = `stroke-dashoffset 1.6s var(--ease) ${0.15 * i}s`;
    requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; });
  });
}

/* ---------------------------------------------------------------------- */
/* Compact desktop Explore dropdown                                      */
/* ---------------------------------------------------------------------- */
function initExploreDropdown() {
  const wrapper = document.querySelector('.nav-explore');
  if (!wrapper) return;
  const trigger = wrapper.querySelector('.nav-explore-trigger');
  const menu = wrapper.querySelector('.nav-explore-menu');
  if (!trigger || !menu) return;

  const open = () => {
    menu.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    menu.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    menu.classList.contains('is-open') ? close() : open();
  });
  menu.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });
}

/* ---------------------------------------------------------------------- */
/* Character counters for textarea fields marked [data-char-count]        */
/* ---------------------------------------------------------------------- */
function initCharacterCounters() {
  document.querySelectorAll('[data-char-count]').forEach((counter) => {
    const target = document.getElementById(counter.getAttribute('data-char-count'));
    if (!target) return;
    const update = () => {
      const max = target.getAttribute('maxlength') || '0';
      counter.textContent = `${target.value.length} / ${max}`;
    };
    target.addEventListener('input', update);
    update();
  });
}
