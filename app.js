/* ==========================================================================
   immoANALYSIS - Core Application JavaScript
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

// --- 8. Native Wix Store #addToCartButton1 Integration ---
window.addToCartFeedback = function(btnElement) {
  // 1. Klicke den echten, nativen Wix-Button im Hintergrund an
  const wixNativeBtn = document.getElementById('addToCartButton1') || 
                       document.querySelector('[id*="addToCartButton"], [data-hook="add-to-cart"], [data-testid="add-to-cart"]');

  if (wixNativeBtn) {
    // Klicke den echten Wix-Shop-Button an
    wixNativeBtn.click();
  }

  // 2. Visuelles Feedback auf unserem Button
  if (btnElement) {
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<span>✓ Im Warenkorb!</span>';
    btnElement.style.background = '#ECFDF5';
    btnElement.style.borderColor = '#10B981';
    btnElement.style.color = '#065F46';
    setTimeout(() => {
      btnElement.innerHTML = originalText;
      btnElement.style.background = '';
      btnElement.style.borderColor = '';
      btnElement.style.color = '';
    }, 2500);
  }

  // 3. Header-Cart-Badge aktualisieren
  const headerBadges = document.querySelectorAll('.cart-badge, [data-testid*="cart-badge"], .floating-cart-badge');
  headerBadges.forEach(b => { b.textContent = '1'; });

  // 4. Toast Notification einblenden
  const toast = document.getElementById('cartToastNotification');
  if (toast) {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      window.hideCartToast();
    }, 6000);
  }
};

window.hideCartToast = function() {
  const toast = document.getElementById('cartToastNotification');
  if (toast) {
    toast.style.transform = 'translateY(150%)';
    toast.style.opacity = '0';
  }
};

// Express Direkt-Kauf: Erst in Wix-Warenkorb legen, dann direkt zur Kasse leiten
window.directBuyAction = function(e) {
  if (e) e.preventDefault();
  const wixNativeBtn = document.getElementById('addToCartButton1') || 
                       document.querySelector('[id*="addToCartButton"], [data-hook="add-to-cart"]');
  if (wixNativeBtn) {
    wixNativeBtn.click();
    setTimeout(() => {
      window.top.location.href = "https://www.immoanalysis.de/cart";
    }, 400);
  } else {
    window.top.location.href = "https://www.immoanalysis.de/product-page/immobundle";
  }
};

function initApp() {
  // Initialize and position all tool slider stages
  ['calc', 'check', 'place', 'finance'].forEach(toolKey => {
    window.updateToolSlider(toolKey);

    const sliderEl = document.getElementById(`slider-${toolKey}`);
    if (sliderEl) {
      sliderEl.addEventListener('click', (e) => {
        if (!e.target.closest('.slider-btn') && !e.target.closest('.slider-dots-bar')) {
          window.moveToolSlide(toolKey, 1);
        }
      });
    }
  });

  // --- 4. Video Play / Overlay Toggle ---
  const videoOverlay = document.getElementById('video-poster-overlay');
  const videoPlayer = document.getElementById('product-video-element');
  const videoIframe = document.getElementById('product-video-iframe');

  function startVideoPlayback() {
    if (videoOverlay) videoOverlay.classList.add('playing');
    if (videoPlayer) videoPlayer.play();
    if (videoIframe && videoIframe.dataset.src && !videoIframe.src) {
      videoIframe.src = videoIframe.dataset.src;
    }
  }

  if (videoOverlay) {
    videoOverlay.addEventListener('click', startVideoPlayback);
  }

  const heroVideoTriggers = document.querySelectorAll('a[href="#video"]');
  heroVideoTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      setTimeout(startVideoPlayback, 500);
    });
  });

  // --- 5. Interactive FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
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
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}