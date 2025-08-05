// Rivers Layer Management ####################################################################

let riversLayer = null;

// Dynamischer Basis-Pfad für lokale Nutzung und GitHub Pages
const riversBasePath = window.location.hostname === '20korvin01.github.io' ? '/KanadaSchoolFinder' : '';

function getRiverStyle(feature) {
  return {
    color: '#2196f3', // kräftiges Blau für Fluss
    weight: 1,
    opacity: 1
  };
}

function onEachRiverFeature(feature, layer) {
  if (feature.properties) {
    const name = feature.properties.name || feature.properties.NAME || 'Unbekannter Fluss';
    const length = feature.properties.length ? `${feature.properties.length.toLocaleString()} km` : '';
    let popupContent = `<b>${name}</b>`;
    if (length) popupContent += `<br>Länge: ${length}`;
    layer.bindPopup(popupContent);
  }
}

function loadRivers() {
  fetch(`${riversBasePath}/data/rivers.geojson`)
    .then(response => response.json())
    .then(data => {
      riversLayer = L.geoJSON(data, {
        style: getRiverStyle,
        onEachFeature: onEachRiverFeature
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden der Rivers GeoJSON-Daten:', error);
    });
}

function toggleRiversLayer(visible) {
  if (riversLayer) {
    if (visible) {
      map.addLayer(riversLayer);
    } else {
      map.removeLayer(riversLayer);
    }
  }
}

// Checkbox-Event für Rivers-Layer
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const riversCheckbox = document.getElementById('riversCheckbox');
    if (riversCheckbox) {
      riversCheckbox.addEventListener('change', function() {
        toggleRiversLayer(this.checked);
      });
      // Layer NICHT automatisch anzeigen, sondern erst bei Klick
    }
  }, 500);
});

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadRivers();
  }, 200);
});
