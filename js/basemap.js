var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  maxZoom: 19
});
// Leaflet-Map initialisieren ######################################################################
// Hintergrundkarten
var CartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});
var Stadia_StamenTerrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png', {
  attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
  maxZoom: 18,
});
var OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
});

// Ausgangsposition der Karte (beim Laden)
const initialMapCenter = [57.72738, -101.90918];
const initialMapZoom = 4;

// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: initialMapCenter,
  zoom: initialMapZoom,
  layers: [CartoLight], // Standardlayer
  fullscreenControl: false, // Vollbild-Button entfernen
  zoomControl: false, // Zoom-Buttons entfernen
});

// Basemap-Wechsel Funktion
window.setBasemap = function(basemapName) {
  let layer;
  switch (basemapName) {
    case 'cartoLight':
      layer = CartoLight;
      break;
    case 'stadiaStamenTerrain':
      layer = Stadia_StamenTerrain;
      break;
    case 'osm':
      layer = OSM;
      break;
    case 'esriWorldImagery':
      layer = Esri_WorldImagery;
      break;
    default:
      layer = CartoLight;
  }
  // Entferne alle Basemap-Layer
  [CartoLight, Stadia_StamenTerrain, OSM, Esri_WorldImagery].forEach(function(l) {
    if (map.hasLayer(l)) map.removeLayer(l);
  });
  map.addLayer(layer);
};

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
