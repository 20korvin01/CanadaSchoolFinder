// Leaflet-Map initialisieren ######################################################################
// Hintergrundkarten 
const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});

// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: [56.1304, -106.3468],
  zoom: 4,
  layers: [cartoLight], // Standardlayer
  fullscreenControl: false, // Vollbild-Button entfernen
  zoomControl: false, // Zoom-Buttons entfernen
});

// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);

// Variable für aktuell hervorgehobenes Feature
let highlightedLayer = null;

// Standard-Style für Features
function getDefaultStyle(feature) {
  return {
    color: '#2262CC',
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.3,
    fillColor: '#2262CC'
  };
}

// Highlight-Style für angeklicktes Feature
function getHighlightStyle(feature) {
  return {
    color: '#FF6B35',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.6,
    fillColor: '#FF6B35'
  };
}

// Funktion zum Highlighten eines Features
function highlightFeature(layer) {
  // Vorheriges Highlight entfernen
  if (highlightedLayer && highlightedLayer !== layer) {
    highlightedLayer.setStyle(getDefaultStyle());
  }
  
  // Neues Feature highlighten
  layer.setStyle(getHighlightStyle());
  highlightedLayer = layer;
}

// GeoJSON-Layer hinzufügen (data/provinces.geojson)
fetch('./data/provinces.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: getDefaultStyle,
      onEachFeature: function(feature, layer) {
        if (feature.properties && feature.properties.prov_name_en) {
          // Popup mit Provinz-/Territoriumsname
          layer.bindPopup(`<b>${feature.properties.prov_name_en}</b><br>${feature.properties.prov_name_fr || ''}`);
          
          // Click-Event für Highlighting und Info-Panel
          layer.on('click', function(e) {
            highlightFeature(layer);
            showFeatureInfo(feature);
          });
        }
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('Fehler beim Laden der GeoJSON-Daten:', error);
  });
