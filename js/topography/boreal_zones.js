// Lädt die Boreal Zones GeoJSON und speichert sie global
fetch('data/boreal_zones.geojson')
  .then(response => response.json())
  .then(data => {
    window.borealZonesGeojson = data;
  });

let borealZonesLayer = null;

const borealZonesBasePath = window.location.hostname === '20korvin01.github.io' ? '/KanadaSchoolFinder' : '';

// Farben für die verschiedenen TYPEs
const borealZoneColors = {
  'H_ALPINE': '#d9d9d9', // felsig/Schnee
  'B_ALPINE': '#9ea79bff', // subalpin, gedämpftes Grün
  'BOREAL': '#4f7c4f',   // dunkler Nadelwald
  'HEMIBOREAL': '#a6c66c' // Übergangszone, helleres Grün
};

function getBorealZoneStyle(feature) {
  const type = feature.properties.TYPE;
  return {
    fillColor: borealZoneColors[type],
    fillOpacity: 0.8,
    color: undefined,
    weight: 0
  };
}

function onEachBorealZoneFeature(feature, layer) {
  if (feature.properties) {
    let isHighlighted = false;
    let originalStyle = null;
    layer.on('click', function() {
      // Entferne alle anderen Highlights (Seen, Provinzen, Flüsse etc.)
      if (typeof window.clearHighlight === 'function') {
        window.clearHighlight();
      }
      // Vorheriges Boreal-Highlight entfernen
      if (window.currentBorealHighlight && window.currentBorealHighlight !== layer) {
        window.currentBorealHighlight.setStyle(getBorealZoneStyle(window.currentBorealHighlight.feature));
        window.currentBorealHighlight = null;
      }
      showBorealZoneInfo(feature);
      originalStyle = layer.options;
      layer.setStyle({
        fillColor: "#ff9900ff",
        fillOpacity: 0.8,
        opacity: 1,
        color: undefined,
        weight: 0
      });
      window.currentBorealHighlight = layer;
    });
    // Highlight entfernen, wenn Info-Panel geschlossen wird
    const infoPanel = document.getElementById('info-panel');
    const observer = new MutationObserver(function(mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && !infoPanel.classList.contains('open')) {
          if (window.currentBorealHighlight) {
            window.currentBorealHighlight.setStyle(getBorealZoneStyle(window.currentBorealHighlight.feature));
            window.currentBorealHighlight = null;
          }
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe(infoPanel, { attributes: true });

    // Tooltip-Logik im dunkelgrünen Farbschema
    // Use centralized tooltip function
    if (typeof window.createBorealTooltip === 'function') {
      window.createBorealTooltip(feature, layer);
    }
  }
// Info-Panel für Boreal Zone anzeigen
window.showBorealZoneInfo = function showBorealZoneInfo(feature) {
  // Provinz-Highlight entfernen, falls aktiv
  if (window.highlightedLayer && window.getDefaultStyle) {
    window.highlightedLayer.setStyle(window.getDefaultStyle(window.highlightedLayer.feature));
    window.highlightedLayer = null;
  }
  // Highlight der vorherigen borealen Zone entfernen
  if (window.currentBorealHighlight) {
    window.currentBorealHighlight.setStyle(getBorealZoneStyle(window.currentBorealHighlight.feature));
    window.currentBorealHighlight = null;
  }
  const title = document.getElementById('feature-title');
  const details = document.getElementById('feature-details');
  const imageContainer = document.getElementById('feature-image');
  imageContainer.innerHTML = '';
  if (feature.properties) {
    const props = feature.properties;
    title.textContent = props.NAME;
    let infoBlock = '';
    if (props.DESCRIPTION) {
      infoBlock = `<div class="province-teaser">${props.DESCRIPTION}</div>`;
    }
      details.innerHTML = `
        <h4>${props.NAME || 'Unbekannte Zone'}</h4>
        ${infoBlock}
      `;
  }
  document.getElementById('info-panel').classList.add('open');
  setTimeout(() => map.invalidateSize(), 300);
}

// Gemeinsame Tooltip-Funktion für Boreal Zones
function createBorealTooltip(feature, layer) {
  let tooltipDiv;
  layer.on('mouseover', function(e) {
    if (!tooltipDiv) {
      tooltipDiv = document.createElement('div');
      tooltipDiv.className = 'boreal-tooltip';
      tooltipDiv.innerHTML = `<i class='bi bi-tree-fill' style='margin-right:7px;'></i>${feature.properties.NAME}`;
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
window.createBorealTooltip = createBorealTooltip;
}

function loadBorealZones() {
  fetch(`${borealZonesBasePath}/data/boreal_zones.geojson`)
    .then(response => response.json())
    .then(data => {
      borealZonesLayer = L.geoJSON(data, {
        style: getBorealZoneStyle,
        onEachFeature: onEachBorealZoneFeature
      });
    })
    .catch(error => {
      console.error('Fehler beim Laden der Boreal Zones GeoJSON-Daten:', error);
    });
}

function toggleBorealZonesLayer(visible) {
  if (borealZonesLayer) {
    if (visible) {
      map.addLayer(borealZonesLayer);
    } else {
      map.removeLayer(borealZonesLayer);
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const borealZonesCheckbox = document.getElementById('borealZonesCheckbox');
    if (borealZonesCheckbox) {
      borealZonesCheckbox.addEventListener('change', function() {
        toggleBorealZonesLayer(this.checked);
      });
      // Layer NICHT automatisch anzeigen, sondern erst bei Klick
    }
  }, 500);
});

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadBorealZones();
  }, 200);
});
