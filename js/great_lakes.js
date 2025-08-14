// Lädt die Great Lakes-GeoJSON und speichert sie global
fetch('data/great_lakes.geojson')
  .then(response => response.json())
  .then(data => {
    window.greatLakesGeojson = data;
  });
// Great Lakes Layer Management ####################################################################

// Variable für aktuell hervorgehobenen See
let highlightedLakeLayer = null;

// Dynamischer Basis-Pfad für lokale Nutzung und GitHub Pages
const greatLakesBasePath = window.location.hostname === '20korvin01.github.io' ? '/KanadaSchoolFinder' : '';

// Standard-Style für Seen
function getGreatLakeStyle(feature) {
  return {
    color: '#1565c0',
    weight: 1,
    fillColor: '#b3e5fc',
    fillOpacity: 0.8,
    opacity: 1
  };
}

// Highlight-Style für angeklickten See
function getGreatLakeHighlightStyle(feature) {
  return {
    color: '#23407a',
    weight: 1,
    fillColor: '#425e94ff',
    fillOpacity: 0.95,
    opacity: 1
  };
}

// Funktion zum Highlighten eines Sees
function highlightGreatLake(layer) {
  // Remove province highlight if present
  if (typeof window.clearHighlight === 'function') {
    window.clearHighlight();
  }
  if (highlightedLakeLayer && highlightedLakeLayer !== layer) {
    highlightedLakeLayer.setStyle(getGreatLakeStyle());
  }
  layer.setStyle(getGreatLakeHighlightStyle());
  highlightedLakeLayer = layer;
}

// Funktion zum Entfernen des Highlights
function clearGreatLakeHighlight() {
  if (highlightedLakeLayer) {
    try {
      highlightedLakeLayer.setStyle(getGreatLakeStyle());
    } catch (e) {
      // Layer wurde evtl. bereits entfernt
    }
    highlightedLakeLayer = null;
  }
  map.closePopup();

}

// GeoJSON-Funktion für jeden See
function onEachGreatLakeFeature(feature, layer) {
  if (feature.properties) {
    const name = feature.properties.NAMESP || feature.properties.NAME || 'Unbekannter See';
    layer.bindPopup(`<b>${name}</b>`);
    layer.on('click', function () {
      highlightGreatLake(layer);
      showGreatLakeInfo(feature);
    });
  }
}

// Info-Panel anzeigen
function showGreatLakeInfo(feature) {
  const title = document.getElementById('feature-title');
  const details = document.getElementById('feature-details');
  const imageContainer = document.getElementById('feature-image');

  imageContainer.innerHTML = '';

  const props = feature.properties;
  const name = props.NAMESP || props.NAME || 'Unbekannter See';
  title.textContent = name;

  let infoBlock = '';
  if (props.info) {
    infoBlock = `<div class="province-teaser" style="font-size:0.93em;">${props.info}</div>`;
  }

  const attributeMap = [
    { key: 'volume_km3', label: 'Volumen', unit: 'km³' },
    { key: 'max_depth_m', label: 'Maximale Tiefe', unit: 'm' },
    { key: 'area_km2', label: 'Fläche', unit: 'km²' },
    { key: 'shore_states', label: 'Anrainerstaaten' },
    { key: 'outflow', label: 'Abfluss' },
    { key: 'notable_islands', label: 'Bedeutende Inseln' },
    { key: 'economic_uses', label: 'Wirtschaftliche Nutzung' }
  ];

  let attrBlock = `<div class="city-popup-weather" style="margin-bottom:1em; margin-top:0.5em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.93em;">
    <table style="width:100%; border-collapse:collapse; font-size:0.9em; table-layout:fixed; word-break:break-word;">
      <tbody>
        ${(() => {
      let rowIndex = 0;
      return attributeMap.map(attr => {
        if (props[attr.key] !== undefined && props[attr.key] !== null && props[attr.key] !== '') {
          let val = props[attr.key];

          if (attr.key === 'max_depth_m') {
            let max = val;
            let avg = props['avg_depth_m'];
            if (typeof max === 'number') max = max.toLocaleString();
            if (typeof avg === 'number') avg = avg.toLocaleString();
            let unit = attr.unit ? ` ${attr.unit}` : '';
            let avgText = (avg !== undefined && avg !== null && avg !== '') ? ` (⌀: ${avg}${unit})` : '';
            val = `${max}${unit}${avgText}`;
          } else {
            if (Array.isArray(val)) val = val.join(', ');
            if (typeof val === 'number') val = val.toLocaleString();
            if (attr.unit) val = `${val} ${attr.unit}`;
          }

          const bgColor = rowIndex % 2 === 0 ? '#f7fafc' : '#e9f0f7';
          const row = `<tr style='background:${bgColor};'><td style='padding:2px 8px 2px 0; color:#555; font-weight:bold; width:38%; vertical-align:top; font-size:0.85em;'>${attr.label}</td><td style='padding:2px 0 2px 8px; color:#222; font-weight:normal; width:62%; vertical-align:top; word-break:break-word;'>${val}</td></tr>`;
          rowIndex++;
          return row;
        }
        return '';
      }).join('');
    })()}
      </tbody>
    </table>
  </div>`;

  details.innerHTML = `<h4>${name}</h4>${infoBlock}${attrBlock}`;
  const infoPanel = document.getElementById('info-panel');
  infoPanel.classList.add('open');
  setTimeout(() => map.invalidateSize(), 300);

  const closeBtn = infoPanel.querySelector('.close, .info-panel-close');
  if (closeBtn && !closeBtn._greatLakeCloseListenerAdded) {
    closeBtn._greatLakeCloseListenerAdded = true;
    closeBtn.addEventListener('click', function () {
      clearGreatLakeHighlight();
      infoPanel.classList.remove('open');
    });
  }
  // Fallback: Remove highlight if panel is closed by other means
  const observer = new MutationObserver(function(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && !infoPanel.classList.contains('open')) {
        clearGreatLakeHighlight();
        observer.disconnect();
        break;
      }
    }
  });
  observer.observe(infoPanel, { attributes: true });
}

// Layer laden
let greatLakesLayer = null;

function loadGreatLakes() {
  fetch(`${greatLakesBasePath}/data/great_lakes.geojson`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
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

// Layer anzeigen/verstecken
function toggleGreatLakesLayer(visible) {
  if (greatLakesLayer) {
    if (visible) {
      map.addLayer(greatLakesLayer);
    } else {
      map.removeLayer(greatLakesLayer);
      clearGreatLakeHighlight();
    }
  }
}

// Checkbox-Event
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    const greatLakesCheckbox = document.getElementById('greatLakesCheckbox');
    if (greatLakesCheckbox) {
      greatLakesCheckbox.addEventListener('change', function () {
        toggleGreatLakesLayer(this.checked);
      });
    }
  }, 500);
});

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(loadGreatLakes, 200);
});
