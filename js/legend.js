// Panel Management für Layer Control ############################################################
const layerPanel = document.getElementById('layer-panel');
const mapContainer = document.querySelector('.map-container');
const toggleLayerBtn = document.getElementById('toggle-layer-panel');
const closeLayerBtn = document.getElementById('close-layer-panel');

// Layer Panel Toggle
toggleLayerBtn.addEventListener('click', function() {
  layerPanel.classList.toggle('open');
  // Entfernt: mapContainer.classList.toggle('layer-open');
  // Karte nach Panel-Animation neu rendern
  setTimeout(() => map.invalidateSize(), 300);
});

closeLayerBtn.addEventListener('click', function() {
  layerPanel.classList.remove('open');
  // Entfernt: mapContainer.classList.remove('layer-open');
  setTimeout(() => map.invalidateSize(), 300);
});

// Checkbox Event Listeners für Layer Control
document.addEventListener('DOMContentLoaded', function() {
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
});