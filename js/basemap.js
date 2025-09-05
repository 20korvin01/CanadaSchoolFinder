var Esri_WorldImagery = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, etc.',
    maxZoom: 19
});

var CartoLight = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CartoDB',
    maxZoom: 19
});

var OpenTopoMap = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '© OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
});

var OSM = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
});

// Ausgangsposition
const initialMapCenter = [57.72738, -101.90918];
const initialMapZoom = 4;

// Karte initialisieren
const map = L.map('map', {
  center: initialMapCenter,
  zoom: initialMapZoom,
  layers: [CartoLight],
  fullscreenControl: false,
  zoomControl: false,
});

// Basemap-Wechsel
window.setBasemap = function (basemapName) {
  let layer;
  switch (basemapName) {
    case 'cartoLight': layer = CartoLight; break;
    case 'openTopoMap': layer = OpenTopoMap; break;
    case 'osm': layer = OSM; break;
    case 'esriWorldImagery': layer = Esri_WorldImagery; break;
    default: layer = CartoLight;
  }
  [CartoLight, OpenTopoMap, OSM, Esri_WorldImagery].forEach(function (l) {
    if (map.hasLayer(l)) map.removeLayer(l);
  });
  map.addLayer(layer);
};

// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);

// Hintergrundkarten-Panel Logik
document.addEventListener('DOMContentLoaded', function () {
  const basemapBtn = document.getElementById('toggle-basemap-panel');
  const basemapPanel = document.getElementById('basemap-panel');
  const radioGroup = document.getElementById('basemap-radio-group-popup');
  const closeBasemapPanelBtn = document.getElementById('close-basemap-panel');
  let basemapPanelOpen = false;

  if (basemapBtn && basemapPanel) {
    basemapBtn.addEventListener('click', function () {
      basemapPanelOpen = !basemapPanelOpen;
      if (basemapPanelOpen) {
        basemapPanel.classList.add('open');
        basemapBtn.classList.add('active');
      } else {
        basemapPanel.classList.remove('open');
        basemapBtn.classList.remove('active');
      }
    });

    // Panel schließen über den neuen Close-Button
    if (closeBasemapPanelBtn) {
      closeBasemapPanelBtn.addEventListener('click', function () {
        basemapPanel.classList.remove('open');
        basemapBtn.classList.remove('active');
        basemapPanelOpen = false;
      });
    }

    // Panel schließen, wenn außerhalb geklickt wird
    document.addEventListener('mousedown', function (e) {
      if (
        basemapPanelOpen &&
        !basemapPanel.contains(e.target) &&
        !basemapBtn.contains(e.target)
      ) {
        basemapPanel.classList.remove('open');
        basemapBtn.classList.remove('active');
        basemapPanelOpen = false;
      }
    });
  }

  // Basemap-Wechsel über Radio-Buttons
  if (radioGroup) {
    radioGroup.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        window.setBasemap(radio.value);
      });
    });
  }
});

// Kartenansicht zurücksetzen
document.addEventListener('DOMContentLoaded', function () {
  const resetBtn = document.getElementById('reset-map-view-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      map.setView(initialMapCenter, initialMapZoom);
    });
  }
});

// Highlight entfernen
function clearHighlight() {
  if (window.highlightedLayer) {
    window.highlightedLayer.setStyle(getDefaultStyle());
    window.highlightedLayer = null;
  }
  if (window.currentBorealHighlight) {
    window.currentBorealHighlight.setStyle(
      window.getBorealZoneStyle
        ? getBorealZoneStyle(window.currentBorealHighlight.feature)
        : {}
    );
    window.currentBorealHighlight = null;
  }
  if (typeof window.clearGreatLakeHighlight === 'function') {
    window.clearGreatLakeHighlight();
  }
  if (
    typeof window.lakesLayer !== 'undefined' &&
    typeof window.highlightedLake !== 'undefined' &&
    window.highlightedLake
  ) {
    try {
      window.lakesLayer.resetStyle(window.highlightedLake);
    } catch (e) {}
    window.highlightedLake = null;
  }
  map.closePopup();
}
