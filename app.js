/* ==========================================================================
   immoANALYSIS - Core Application JavaScript (v3.0 Refined)
   ========================================================================== */

// --- Master-Cockpit Switcher & Sliders Controller ---
window.toolSliders = {
  calc: { current: 0, total: 5 },
  check: { current: 0, total: 5 },
  place: { current: 0, total: 5 },
  finance: { current: 0, total: 5 }
};

window.switchCockpitTool = function(toolKey) {
  // 1. Update Tabs
  const tabs = document.querySelectorAll('.cockpit-tab');
  tabs.forEach(tab => {
    const isTarget = tab.getAttribute('data-tool') === toolKey;
    tab.classList.toggle('active', isTarget);
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  // 2. Update Stage Wrapper Theme
  const stage = document.getElementById('cockpitStage');
  if (stage) {
    stage.className = `cockpit-stage-wrapper theme-${toolKey}`;
  }

  // 3. Update Active Panel
  const panels = document.querySelectorAll('.cockpit-tool-panel');
  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${toolKey}`);
  });

  // 4. Position slides
  window.updateToolSlider(toolKey);
};

window.updateToolSlider = function(toolKey) {
  const sliderEl = document.getElementById(`slider-${toolKey}`);
  if (!sliderEl) return;
  const slides = sliderEl.querySelectorAll('.tool-slide');
  const dots = sliderEl.querySelectorAll('.slider-dot');
  const total = window.toolSliders[toolKey].total;
  const current = window.toolSliders[toolKey].current;

  slides.forEach((slide, idx) => {
    let diff = idx - current;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    slide.style.transform = `translateX(${diff * 100}%)`;
    slide.classList.toggle('active', idx === current);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === current);
  });

  const counter = document.getElementById(`counter-${toolKey}`);
  if (counter) {
    counter.textContent = `${current + 1} / ${total}`;
  }
};

window.moveToolSlide = function(toolKey, direction, event) {
  if (event) event.stopPropagation();
  if (!window.toolSliders[toolKey]) return;
  const s = window.toolSliders[toolKey];
  s.current = (s.current + direction + s.total) % s.total;
  window.updateToolSlider(toolKey);
};

window.setToolSlide = function(toolKey, index, event) {
  if (event) event.stopPropagation();
  if (!window.toolSliders[toolKey]) return;
  window.toolSliders[toolKey].current = index;
  window.updateToolSlider(toolKey);
};

function initApp() {
  // Initialize and position all tool slider stages
  ['calc', 'check', 'place', 'finance'].forEach(toolKey => {
    window.updateToolSlider(toolKey);

    const sliderEl = document.getElementById(`slider-${toolKey}`);
    if (sliderEl) {
      sliderEl.addEventListener('click', (e) => {
        // Only advance if clicked directly on image/stage, not on arrows or dots
        if (!e.target.closest('.slider-btn') && !e.target.closest('.slider-dots-bar')) {
          window.moveToolSlide(toolKey, 1);
        }
      });
    }
  });
  // --- 1. Sticky Header ---
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- 2. Mobile Menu Toggle ---
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Mobile dropdown toggle on touch
    document.querySelectorAll('.nav-item').forEach(item => {
      const link = item.querySelector('.nav-link');
      const dropdown = item.querySelector('.nav-dropdown');
      if (dropdown && link) {
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            item.classList.toggle('dropdown-open');
          }
        });
      }
    });
  }

  // --- 3. Interactive Tool Tabs ---
  const tabButtons = document.querySelectorAll('.tool-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      switchToolTab(targetId);
    });
  });

  // --- 4. Video Play / Overlay Toggle & Auto-Start on Hero Click ---
  const videoOverlay = document.getElementById('video-poster-overlay');
  const videoPlayer = document.getElementById('product-video-element');
  const videoIframe = document.getElementById('product-video-iframe');

  function startVideoPlayback() {
    if (videoOverlay) {
      videoOverlay.classList.add('playing');
    }
    if (videoPlayer) {
      videoPlayer.play();
    }
    if (videoIframe && videoIframe.dataset.src && !videoIframe.src) {
      videoIframe.src = videoIframe.dataset.src;
    }
  }

  if (videoOverlay) {
    videoOverlay.addEventListener('click', startVideoPlayback);
  }

  // Connect Image and Hero Video Button to auto-activate video on scroll
  const heroVideoTriggers = document.querySelectorAll('a[href="#video"]');
  heroVideoTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      setTimeout(() => {
        startVideoPlayback();
      }, 500);
    });
  });

  // --- 5. Interactive FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Optional: close other open items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('active', !isActive);
        questionBtn.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
      });
    }
  });

  // --- 6. Smooth Scroll Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId !== '#' && targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // --- 7. Sticky Bottom Conversion Bar ---
  const stickyBar = document.getElementById('sticky-bar');
  const heroSection = document.getElementById('hero');
  const finalPricing = document.getElementById('pricing');

  if (stickyBar && heroSection && finalPricing) {
    window.addEventListener('scroll', () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      const pricingTop = finalPricing.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (heroBottom < 0 && pricingTop > windowHeight) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    });
  }
}


// --- 8. Slide-In Mini-Cart Drawer Controller ---
window.openCartDrawer = function() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    backdrop.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeCartDrawer = function() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    backdrop.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.proceedToCheckout = function(e) {
  if (e) e.preventDefault();
  // Direct redirect to Wix checkout or cart
  window.top.location.href = "https://www.immoanalysis.de/cart";
};

// Close drawer on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeCartDrawer();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
