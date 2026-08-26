/* ==========================================================================
   immoANALYSIS - Interactive Real Estate Calculator (v2.0 Refined)
   With Presets, Health Score Badge & Dynamic Breakdown
   ========================================================================== */

function initCalculator() {
  const kaufpreisInput = document.getElementById('calc-kaufpreis');
  const mieteInput = document.getElementById('calc-miete');
  const ekInput = document.getElementById('calc-ek');

  const kaufpreisVal = document.getElementById('val-kaufpreis');
  const mieteVal = document.getElementById('val-miete');
  const ekVal = document.getElementById('val-ek');

  const bruttoRenditeEl = document.getElementById('kpi-brutto-rendite');
  const nettoRenditeEl = document.getElementById('kpi-netto-rendite');
  const cashflowEl = document.getElementById('kpi-cashflow');
  const ekRenditeEl = document.getElementById('kpi-ek-rendite');
  const healthBadgeEl = document.getElementById('calc-health-badge');

  // Breakdown elements
  const breakdownKaufpreisEl = document.getElementById('bd-kaufpreis');
  const breakdownNebenkostenEl = document.getElementById('bd-nebenkosten');
  const breakdownDarlehenEl = document.getElementById('bd-darlehen');
  const breakdownRateEl = document.getElementById('bd-rate');
  const breakdownInstandhaltungEl = document.getElementById('bd-instandhaltung');

  if (!kaufpreisInput || !mieteInput || !ekInput) return;

  const euroFormat = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  const percentFormat = new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function updateSliderTrack(slider) {
    if (!slider) return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-fill', `${percent}%`);
  }

  function updateCalculations() {
    const kaufpreis = parseFloat(kaufpreisInput.value) || 0;
    const monatsmiete = parseFloat(mieteInput.value) || 0;
    const ekProzent = parseFloat(ekInput.value) || 0;

    // Update Slider Value Badges
    if (kaufpreisVal) kaufpreisVal.textContent = euroFormat.format(kaufpreis);
    if (mieteVal) mieteVal.textContent = euroFormat.format(monatsmiete) + ' / Mo.';
    if (ekVal) ekVal.textContent = `${ekProzent} % (${euroFormat.format(kaufpreis * (ekProzent / 100))})`;

    // Dynamic slider track fill
    updateSliderTrack(kaufpreisInput);
    updateSliderTrack(mieteInput);
    updateSliderTrack(ekInput);

    // Core Metrics
    const jahresKaltmiete = monatsmiete * 12;
    const kaufnebenkosten = kaufpreis * 0.085; // ca. 8.5% (Grunderwerbsteuer, Notar, Grundbuch)
    const gesamtkosten = kaufpreis + kaufnebenkosten;
    
    const eigenkapital = kaufpreis * (ekProzent / 100);
    const darlehensbetrag = Math.max(0, gesamtkosten - eigenkapital);

    // Finanzierung: 3.8% Sollzins + 2.0% anfängliche Tilgung = 5.8% Annuität
    const zinssatz = 0.038;
    const tilgungssatz = 0.020;
    const jahresannuitaet = darlehensbetrag * (zinssatz + tilgungssatz);
    const monatsrate = jahresannuitaet / 12;

    // Bewirtschaftungskosten (nicht umlagefähig ca. 15% der Miete)
    const bewirtschaftung = monatsmiete * 0.15;

    // Bruttomietrendite
    const bruttoRendite = kaufpreis > 0 ? (jahresKaltmiete / kaufpreis) : 0;

    // Nettomietrendite = (Jahresreinertrag / Gesamtkosten)
    const jahresReinertrag = jahresKaltmiete - (bewirtschaftung * 12);
    const nettoRendite = gesamtkosten > 0 ? (jahresReinertrag / gesamtkosten) : 0;

    // Monatlicher Cashflow vor Steuern
    const monatlicherCashflow = monatsmiete - monatsrate - bewirtschaftung;

    // Eigenkapitalrendite
    const jahresCashflow = monatlicherCashflow * 12;
    const tilgungJaehrlich = darlehensbetrag * tilgungssatz;
    const jahresUeberschussGesamt = jahresCashflow + tilgungJaehrlich;
    const ekRendite = eigenkapital > 0 ? (jahresUeberschussGesamt / eigenkapital) : 0;

    // Render KPIs
    if (bruttoRenditeEl) bruttoRenditeEl.textContent = percentFormat.format(bruttoRendite);
    if (nettoRenditeEl) nettoRenditeEl.textContent = percentFormat.format(nettoRendite);
    
    // Format Cashflow with dynamic color
    if (cashflowEl) {
      const sign = monatlicherCashflow >= 0 ? '+' : '';
      cashflowEl.textContent = `${sign}${euroFormat.format(monatlicherCashflow)} / Mo.`;
      
      if (monatlicherCashflow >= 0) {
        cashflowEl.style.color = '#34D399';
      } else {
        cashflowEl.style.color = '#F87171';
      }
    }

    if (ekRenditeEl) ekRenditeEl.textContent = percentFormat.format(ekRendite);

    // Update Health Score Badge
    if (healthBadgeEl) {
      if (monatlicherCashflow >= 50 && bruttoRendite >= 0.045) {
        healthBadgeEl.className = 'calc-health-badge health-positive';
        healthBadgeEl.innerHTML = '<span>🟢</span> <strong>Top Rendite-Deal:</strong> Positiver monatlicher Cashflow & planbarer Vermögensaufbau!';
      } else if (monatlicherCashflow >= -80) {
        healthBadgeEl.className = 'calc-health-badge health-neutral';
        healthBadgeEl.innerHTML = '<span>🟡</span> <strong>Solide Basis:</strong> Tilgungshebel greift, Mietpotenzial mit immoPLACE prüfen.';
      } else {
        healthBadgeEl.className = 'calc-health-badge health-negative';
        healthBadgeEl.innerHTML = '<span>🔴</span> <strong>Achtung Cashflow-Lücke:</strong> Mehr Eigenkapital nötig oder Kaufpreis nachverhandeln!';
      }
    }

    // Update Breakdown
    if (breakdownKaufpreisEl) breakdownKaufpreisEl.textContent = euroFormat.format(kaufpreis);
    if (breakdownNebenkostenEl) breakdownNebenkostenEl.textContent = euroFormat.format(kaufnebenkosten);
    if (breakdownDarlehenEl) breakdownDarlehenEl.textContent = euroFormat.format(darlehensbetrag);
    if (breakdownRateEl) breakdownRateEl.textContent = euroFormat.format(monatsrate) + ' / Mo.';
    if (breakdownInstandhaltungEl) breakdownInstandhaltungEl.textContent = euroFormat.format(bewirtschaftung) + ' / Mo.';
  }

  // Event Listeners for inputs
  kaufpreisInput.addEventListener('input', updateCalculations);
  mieteInput.addEventListener('input', updateCalculations);
  ekInput.addEventListener('input', updateCalculations);

  // Preset Scenario Buttons
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const kaufpreis = btn.getAttribute('data-kaufpreis');
      const miete = btn.getAttribute('data-miete');
      const ek = btn.getAttribute('data-ek');

      if (kaufpreis) kaufpreisInput.value = kaufpreis;
      if (miete) mieteInput.value = miete;
      if (ek) ekInput.value = ek;

      updateCalculations();
    });
  });

  // Initialize
  updateCalculations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculator);
} else {
  initCalculator();
}
