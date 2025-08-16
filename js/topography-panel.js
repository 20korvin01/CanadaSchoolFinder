// Topographie-Panel: Logik für Provinzen, Boreale Zonen, Gewässer und Städte

// Accordion-Logik für Gewässer-Gruppe
function setupWatersAccordion() {
  const watersToggle = document.getElementById('toggle-waters-group');
  const watersCheckboxes = document.getElementById('waters-checkboxes');
  const watersIcon = document.getElementById('waters-accordion-icon');
  if (watersToggle && watersCheckboxes && watersIcon) {
    watersToggle.addEventListener('click', function() {
      const expanded = watersToggle.getAttribute('aria-expanded') === 'true';
      watersToggle.setAttribute('aria-expanded', !expanded);
      watersCheckboxes.style.display = expanded ? 'none' : 'block';
      watersIcon.innerHTML = expanded ? '&#9654;' : '&#9660;';
    });
  }
}

// Accordion für Städte-Gruppe
function setupCitiesAccordion() {
  const toggleCitiesBtn = document.getElementById('toggle-cities-group');
  const citiesCheckboxes = document.getElementById('cities-checkboxes');
  const citiesAccordionIcon = document.getElementById('cities-accordion-icon');
  if (toggleCitiesBtn && citiesCheckboxes && citiesAccordionIcon) {
    toggleCitiesBtn.addEventListener('click', function() {
      const expanded = toggleCitiesBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        citiesCheckboxes.style.display = 'none';
        toggleCitiesBtn.setAttribute('aria-expanded', 'false');
        citiesAccordionIcon.style.transform = 'rotate(-90deg)';
      } else {
        citiesCheckboxes.style.display = 'block';
        toggleCitiesBtn.setAttribute('aria-expanded', 'true');
        citiesAccordionIcon.style.transform = 'rotate(0deg)';
      }
    });
  }
}

// Checkbox Event Listeners für Layer Control
function setupLayerCheckboxes() {
  // Provinzen Checkbox
  const provincesCheckbox = document.querySelector('.layer-item input[type="checkbox"]');
  if (provincesCheckbox) {
    provincesCheckbox.addEventListener('change', function() {
      if (typeof toggleProvinces === 'function') {
        toggleProvinces(this.checked);
      }
    });
  }
  // Städte Checkbox Event Listener
  const citiesCheckbox = document.querySelector('input[type="checkbox"]:nth-of-type(2)'); // Zweite Checkbox (Städte)
  if (citiesCheckbox) {
    citiesCheckbox.addEventListener('change', function() {
      if (typeof toggleCities === 'function') {
        toggleCities(this.checked);
      }
    });
  }
}
// Akkordeon- und Checkbox-Logik beim Laden der Seite aktivieren
document.addEventListener('DOMContentLoaded', function() {
  setupWatersAccordion();
  setupCitiesAccordion();
  setupLayerCheckboxes();
});
