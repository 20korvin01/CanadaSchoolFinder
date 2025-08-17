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


// Funktion zum Entfernen des Highlights =========================================================================
function clearHighlight() {
  if (highlightedLayer) {
    highlightedLayer.setStyle(getDefaultStyle());
    highlightedLayer = null;
  }
  // Boreal-Zonen-Highlight entfernen, falls aktiv
  if (window.currentBorealHighlight) {
    window.currentBorealHighlight.setStyle(window.getBorealZoneStyle ? getBorealZoneStyle(window.currentBorealHighlight.feature) : {});
    window.currentBorealHighlight = null;
  }
  // Great Lakes Highlight entfernen
  if (typeof window.clearGreatLakeHighlight === 'function') {
    window.clearGreatLakeHighlight();
  }
  // Andere Seen Highlight entfernen
  if (typeof window.lakesLayer !== 'undefined' && typeof window.highlightedLake !== 'undefined' && window.highlightedLake) {
    try {
      window.lakesLayer.resetStyle(window.highlightedLake);
    } catch (e) {}
    window.highlightedLake = null;
  }
  // Alle Popups schließen
  map.closePopup();
}
