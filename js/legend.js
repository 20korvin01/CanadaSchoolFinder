// Panel Management für Layer Control ############################################################
const layerPanel = document.getElementById('layer-panel');
const mapContainer = document.querySelector('.map-container');
const toggleLayerBtn = document.getElementById('toggle-layer-panel');
const closeLayerBtn = document.getElementById('close-layer-panel');

// Layer Panel Toggle
toggleLayerBtn.addEventListener('click', function() {
  layerPanel.classList.toggle('open');
  mapContainer.classList.toggle('layer-open');
  // Karte nach Panel-Animation neu rendern
  setTimeout(() => map.invalidateSize(), 300);
});

closeLayerBtn.addEventListener('click', function() {
  layerPanel.classList.remove('open');
  mapContainer.classList.remove('layer-open');
  setTimeout(() => map.invalidateSize(), 300);
});