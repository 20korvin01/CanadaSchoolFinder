// Leaflet-Map initialisieren ######################################################################
// Hintergrundkarten 
const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});

// Ausgangsposition der Karte (beim Laden)
const initialMapCenter = [61.65198, -101.51328];
const initialMapZoom = 3;

// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: initialMapCenter,
  zoom: initialMapZoom,
  layers: [cartoLight], // Standardlayer
  fullscreenControl: false, // Vollbild-Button entfernen
  zoomControl: false, // Zoom-Buttons entfernen
});

// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);

// Button-Funktion: Kartenansicht zurücksetzen
document.addEventListener('DOMContentLoaded', function() {
  const resetBtn = document.getElementById('reset-map-view-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      map.setView(initialMapCenter, initialMapZoom);
    });
  }
});
