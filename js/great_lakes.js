// Great Lakes Layer Management ####################################################################

let greatLakesLayer = null;

// Dynamischer Basis-Pfad für lokale Nutzung und GitHub Pages
const greatLakesBasePath = window.location.hostname === '20korvin01.github.io' ? '/KanadaSchoolFinder' : '';

function getGreatLakeStyle(feature) {
  return {
    color: '#1565c0', // kräftiges Blau für Rand
    weight: 1,
    fillColor: '#b3e5fc', // helles Blau für Fläche
    fillOpacity: 0.8,
    opacity: 1
  };
}

function onEachGreatLakeFeature(feature, layer) {
  if (feature.properties) {
    const name = feature.properties.NAMESP || feature.properties.NAME || 'Unbekannter See';
    const area = feature.properties.area ? `${feature.properties.area.toLocaleString()} km²` : 'Unbekannt';
    let popupContent = `<b>${name}</b><br>Fläche: ${area}`;
    layer.bindPopup(popupContent);
  }
}

function loadGreatLakes() {
  fetch(`${greatLakesBasePath}/data/great_lakes.geojson`)
    .then(response => response.json())
    .then(data => {
      greatLakesLayer = L.geoJSON(data, {
        style: getGreatLakeStyle,
        onEachFeature: onEachGreatLakeFeature
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden der Great Lakes GeoJSON-Daten:', error);
    });
}

function toggleGreatLakesLayer(visible) {
  if (greatLakesLayer) {
    if (visible) {
      map.addLayer(greatLakesLayer);
    } else {
      map.removeLayer(greatLakesLayer);
    }
  }
}

// Checkbox-Event für Great Lakes Layer
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const greatLakesCheckbox = document.getElementById('greatLakesCheckbox');
    if (greatLakesCheckbox) {
      greatLakesCheckbox.addEventListener('change', function() {
        toggleGreatLakesLayer(this.checked);
      });
      // Layer NICHT automatisch anzeigen, sondern erst bei Klick
    }
  }, 500);
});

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadGreatLakes();
  }, 200);
});
