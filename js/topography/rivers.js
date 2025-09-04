// Lädt die Rivers-GeoJSON und speichert sie global
fetch('data/topography/rivers.geojson')
  .then(response => response.json())
  .then(data => {
    window.riversGeojson = data;
  });

// Rivers Layer Management ####################################################################

let riversLayer = null;

// Dynamischer Basis-Pfad für lokale Nutzung und GitHub Pages
const riversBasePath = window.location.hostname === '20korvin01.github.io' ? '/CanadaSchoolFinder' : '';

function getRiverStyle(feature) {
  return {
    color: '#2196f3', // kräftiges Blau für Fluss
    weight: 1,
    opacity: 1
  };
}

// Highlight-Style für Flüsse
function getRiverHighlightStyle() {
  return {
    color: '#23407a',
    weight: 1,
    fillColor: '#425e94ff',
    fillOpacity: 0.95,
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

    // Tooltip: use centralized createRiverTooltip to avoid duplicate creation
    if (typeof window.createRiverTooltip === 'function') {
      window.createRiverTooltip(feature, layer);
    }
  }

  // Highlight-Style bei Klick
  layer.on('click', function() {
    const originalStyle = layer.options;
    layer.setStyle(getRiverHighlightStyle());
    setTimeout(() => {
      layer.setStyle(getRiverStyle(feature));
    }, 1200);
  });
}

// Gemeinsame Tooltip-Funktion für Flüsse
function createRiverTooltip(feature, layer) {
  let tooltipDiv;
  const name = feature.properties.name || feature.properties.NAME || 'Unbekannter Fluss';
  layer.on('mouseover', function(e) {
    if (!tooltipDiv) {
      tooltipDiv = document.createElement('div');
      tooltipDiv.className = 'river-tooltip';
      tooltipDiv.innerHTML = `<i class='bi bi-water' style='margin-right:7px;'></i>${name}`;
      document.body.appendChild(tooltipDiv);
    }
  tooltipDiv.style.display = 'block';
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
window.createRiverTooltip = createRiverTooltip;

function loadRivers() {
  fetch(`${riversBasePath}/data/topography/rivers.geojson`)
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
