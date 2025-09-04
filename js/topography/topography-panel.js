// Accordion-Logik für Basemap-Gruppe
function setupBasemapAccordion() {
  const basemapToggle = document.getElementById('toggle-basemap-group');
  const basemapRadioGroup = document.getElementById('basemap-radio-group');
  const basemapIcon = document.getElementById('basemap-accordion-icon');
  if (basemapToggle && basemapRadioGroup && basemapIcon) {
    basemapToggle.addEventListener('click', function() {
      const expanded = basemapToggle.getAttribute('aria-expanded') === 'true';
      basemapToggle.setAttribute('aria-expanded', !expanded);
      basemapRadioGroup.style.display = expanded ? 'none' : 'block';
      basemapIcon.innerHTML = expanded ? '&#9654;' : '&#9660;';
    });
  }
}

// Event-Handler für Basemap-Wechsel
function setupBasemapRadios() {
  const radios = document.getElementsByName('basemap');
  radios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      if (this.checked) {
        if (typeof window.setBasemap === 'function') {
          window.setBasemap(this.value);
        }
      }
    });
  });
}
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
      toggleCitiesBtn.setAttribute('aria-expanded', !expanded);
      citiesCheckboxes.style.display = expanded ? 'none' : 'block';
      citiesAccordionIcon.innerHTML = expanded ? '&#9654;' : '&#9660;';
    });
  }
}

// Checkbox Event Listeners für Layer Control
function setupLayerCheckboxes() {
  // Provinzen Checkbox
  const provincesCheckbox = document.getElementById('provincesCheckbox');
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
  setupBasemapAccordion();
  setupBasemapRadios();
});
