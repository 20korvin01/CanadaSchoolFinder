// Lädt die Lakes-GeoJSON und speichert sie global
fetch('data/lakes.geojson')
  .then(response => response.json())
  .then(data => {
    window.lakesGeojson = data;
  });
// Checkbox-Event für Seen-Layer
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const lakesCheckbox = document.getElementById('lakesCheckbox');
    if (lakesCheckbox) {
      lakesCheckbox.addEventListener('change', function() {
        toggleLakesLayer(this.checked);
      });
      // Layer NICHT automatisch anzeigen, sondern erst bei Klick
    }
  }, 500);
});
// Lakes Layer Management ####################################################################

let lakesLayer = null;
let highlightedLake = null;

// Dynamischer Basis-Pfad für lokale Nutzung und GitHub Pages
const lakesBasePath = window.location.hostname === '20korvin01.github.io' ? '/KanadaSchoolFinder' : '';

function getLakeStyle(feature) {
  return {
    color: '#1976d2', // kräftiges Blau für Rand
    weight: 1,
    fillColor: '#90caf9', // helles Blau für Fläche
    fillOpacity: 0.7,
    opacity: 1
  };
}

function getLakeHighlightStyle() {
  return {
    color: '#23407a',
    weight: 1,
    fillColor: '#425e94ff',
    fillOpacity: 0.95,
    opacity: 1
  };
}

function resetLakeHighlight(e) {
  lakesLayer.resetStyle(e.target);
  highlightedLake = null;
}

function highlightLake(e) {
  if (highlightedLake) {
    lakesLayer.resetStyle(highlightedLake);
  }
  const layer = e.target;
  layer.setStyle(getLakeHighlightStyle());
  highlightedLake = layer;
}

function onEachLakeFeature(feature, layer) {
  if (feature.properties) {
    const name = feature.properties.NAME || 'Unbekannter See';
    const area = feature.properties.area ? `${feature.properties.area.toLocaleString()} km²` : 'Unbekannt';
    let popupContent = `<b>${name}</b><br>Fläche: ${area}`;
    layer.bindPopup(popupContent);

    // Tooltip-Logik im blauen Farbschema
    let tooltipDiv;
    layer.on('mouseover', function(e) {
      if (!tooltipDiv) {
        tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'lake-tooltip';
        tooltipDiv.innerHTML = `<i class='bi bi-droplet' style='margin-right:7px;'></i>${name}`;
        document.body.appendChild(tooltipDiv);
      }
      tooltipDiv.style.display = 'block';
      tooltipDiv.style.position = 'fixed';
      tooltipDiv.style.zIndex = '9999';
      tooltipDiv.style.background = '#23407a';
      tooltipDiv.style.color = 'white';
      tooltipDiv.style.padding = '8px 16px';
      tooltipDiv.style.borderRadius = '8px';
      tooltipDiv.style.fontSize = '1.05em';
      tooltipDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
      tooltipDiv.style.pointerEvents = 'none';
      // Position Tooltip bei Mausbewegung
      function moveTooltip(ev) {
        tooltipDiv.style.left = (ev.clientX + 16) + 'px';
        tooltipDiv.style.top = (ev.clientY + 12) + 'px';
      }
      document.addEventListener('mousemove', moveTooltip);
      layer.on('mouseout', function() {
        tooltipDiv.style.display = 'none';
        document.removeEventListener('mousemove', moveTooltip);
      });
    });
  }
  layer.on({
    click: function(e) {
      highlightLake(e);
      this.openPopup();
    },
    popupclose: resetLakeHighlight
  });
}

function loadLakes() {
  fetch(`${lakesBasePath}/data/lakes.geojson`)
    .then(response => response.json())
    .then(data => {
      lakesLayer = L.geoJSON(data, {
        style: getLakeStyle,
        onEachFeature: onEachLakeFeature
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden der Lakes GeoJSON-Daten:', error);
    });
}

function toggleLakesLayer(visible) {
  if (lakesLayer) {
    if (visible) {
      map.addLayer(lakesLayer);
    } else {
      map.removeLayer(lakesLayer);
    }
  }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadLakes();
  }, 200);
});
