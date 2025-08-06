// Lädt die Provinces-GeoJSON und speichert sie global
fetch('data/provinces.geojson')
  .then(response => response.json())
  .then(data => {
    window.provincesGeojson = data;
  });
// Provinces Layer Management ####################################################################

// Variable für aktuell hervorgehobenes Feature
let highlightedLayer = null;

// Standard-Style für Provinzen
function getDefaultStyle(feature) {
  return {
    color: '#ce5f5fff',
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.3,
    fillColor: '#d48282'
  };
}

// Highlight-Style für angeklicktes Feature
function getHighlightStyle(feature) {
  return {
    color: '#cc2424ff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.6,
    fillColor: '#c52727ff'
  };
}

// Funktion zum Highlighten eines Features
function highlightFeature(layer) {
  // Remove lake highlight if present
  if (typeof window.clearGreatLakeHighlight === 'function') {
    window.clearGreatLakeHighlight();
  }
  // Vorheriges Highlight entfernen
  if (highlightedLayer && highlightedLayer !== layer) {
    highlightedLayer.setStyle(getDefaultStyle());
  }

  // Neues Feature highlighten
  layer.setStyle(getHighlightStyle());
  highlightedLayer = layer;
}

// Funktion zum Entfernen des Highlights
function clearHighlight() {
  if (highlightedLayer) {
    highlightedLayer.setStyle(getDefaultStyle());
    highlightedLayer = null;
  }
  
  // Alle Popups schließen
  map.closePopup();
}

// Dynamischer Basis-Pfad für lokale Nutzung und GitHub Pages
const basePath = window.location.hostname === '20korvin01.github.io' ? '/KanadaSchoolFinder' : '';

// Provinces Layer Variable
let provincesLayer = null;

// Funktion zum Laden der Provinzen
function loadProvinces() {
  fetch(`${basePath}/data/provinces.geojson`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      provincesLayer = L.geoJSON(data, {
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
      console.log('Versuche alternativen Pfad...');
      
      // Fallback: Versuche absoluten Pfad für GitHub Pages
      fetch('/KanadaSchoolFinder/data/provinces.geojson')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          provincesLayer = L.geoJSON(data, {
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
        .catch(fallbackError => {
          console.error('Auch Fallback-Pfad fehlgeschlagen:', fallbackError);
          alert('GeoJSON-Daten konnten nicht geladen werden. Bitte überprüfen Sie die Pfade.');
        });
    });
}

// Funktion zum Ein-/Ausblenden der Provinzen
function toggleProvinces(visible) {
  if (provincesLayer) {
    if (visible) {
      map.addLayer(provincesLayer);
    } else {
      map.removeLayer(provincesLayer);
      clearHighlight(); // Highlighting entfernen wenn Layer ausgeblendet wird
    }
  }
}

// Provinzen automatisch laden wenn die Seite geladen ist
document.addEventListener('DOMContentLoaded', function() {
  // Kurz warten bis die Karte initialisiert ist
  setTimeout(loadProvinces, 100);
});
