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

// --- 8. Wix Velo Add-to-Cart Trigger ---
window.addImmoBundleToCart = function(e, btn) {
  if (e) e.preventDefault();

  // Signal an Wix Velo senden
  try {
    window.postMessage('WIX_ADD_IMMOBUNDLE', '*');
    if (window.top && window.top !== window) {
      window.top.postMessage('WIX_ADD_IMMOBUNDLE', '*');
    }
  } catch (err) {
    console.warn('postMessage error:', err);
  }

  // Visuelles Button-Feedback
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>✓ Im Warenkorb!</span>';
    btn.style.background = '#ECFDF5';
    btn.style.borderColor = '#10B981';
    btn.style.color = '#065F46';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2500);
  }

  // Header-Badge aktualisieren
  const badges = document.querySelectorAll('.cart-badge, [data-testid*="cart-badge"], .floating-cart-badge');
  badges.forEach(b => { b.textContent = '1'; });

  // Toast Notification
  const toast = document.getElementById('cartToastNotification');
  if (toast) {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      window.hideCartToast();
    }, 5000);
  }
};

window.hideCartToast = function() {
  const toast = document.getElementById('cartToastNotification');
  if (toast) {
    toast.style.transform = 'translateY(150%)';
    toast.style.opacity = '0';
  }
};
