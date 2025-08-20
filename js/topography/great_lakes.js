// Lädt die Great Lakes-GeoJSON und speichert sie global
fetch('data/great_lakes.geojson')
  .then(response => response.json())
  .then(data => {
    window.greatLakesGeojson = data;
  });
// Great Lakes Layer Management ####################################################################

// Variable für aktuell hervorgehobenen See
let highlightedLakeLayer = null;
// Variable für temporäres Hover-Highlight (soll nicht mit Klick-Highlight kollidieren)
let tooltipHoverLake = null;

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

    // Tooltip: use centralized createGreatLakeTooltip to avoid duplicate creation
    if (typeof window.createGreatLakeTooltip === 'function') {
      window.createGreatLakeTooltip(feature, layer);
    }
  }
}

// Gemeinsame Tooltip-Funktion für Great Lakes
function createGreatLakeTooltip(feature, layer) {
  let tooltipDiv;
  const name = feature.properties.NAMESP || feature.properties.NAME || 'Unbekannter See';

  function ensureTooltip() {
    if (!tooltipDiv) {
      tooltipDiv = document.createElement('div');
      tooltipDiv.className = 'lake-tooltip';
      tooltipDiv.innerHTML = `<i class='bi bi-droplet-fill' style='margin-right:7px;'></i>${name}`;
      document.body.appendChild(tooltipDiv);
    }
  }

  layer.on('mouseover', function(e) {
    ensureTooltip();
    tooltipDiv.style.display = 'block';

    function moveTooltip(ev) {
      const clientX = ev.originalEvent ? ev.originalEvent.clientX : (ev.clientX || 0);
      const clientY = ev.originalEvent ? ev.originalEvent.clientY : (ev.clientY || 0);
      tooltipDiv.style.left = (clientX + 16) + 'px';
      tooltipDiv.style.top = (clientY + 12) + 'px';
    }

    // Attach move handler to the layer for consistent updates while hovering
    layer.on('mousemove', moveTooltip);

    // Reset previous hover highlight if it's different and not the clicked highlight
    if (tooltipHoverLake && tooltipHoverLake !== layer && tooltipHoverLake !== highlightedLakeLayer) {
      try { tooltipHoverLake.setStyle(getGreatLakeStyle()); } catch (err) {}
    }

    // Apply hover highlight unless this is already the clicked highlight
    if (highlightedLakeLayer !== layer) {
      try { layer.setStyle(getGreatLakeHighlightStyle()); } catch (err) {}
    }
    tooltipHoverLake = layer;
  });

  layer.on('mouseout', function() {
    if (tooltipDiv) tooltipDiv.style.display = 'none';
    layer.off('mousemove');

    if (tooltipHoverLake === layer) {
      tooltipHoverLake = null;
      if (highlightedLakeLayer !== layer) {
        try { layer.setStyle(getGreatLakeStyle()); } catch (err) {}
      }
    }
  });
}
window.createGreatLakeTooltip = createGreatLakeTooltip;

// Info-Panel anzeigen
function showGreatLakeInfo(feature) {
  const title = document.getElementById('feature-title');
  const details = document.getElementById('feature-details');
  const imageContainer = document.getElementById('feature-image');

  // Bilder-Galerie (verwende ausschließlich img_urls aus GeoJSON)
  imageContainer.innerHTML = '';
  const props = feature.properties;
  const remoteUrls = Array.isArray(props && props.img_urls) ? props.img_urls : null;
  if (remoteUrls && remoteUrls.length > 0) {
    const tryImages = sampleRandom(remoteUrls, 10);

    // Show a loading placeholder of the same size as the gallery
    imageContainer.innerHTML = `
      <div class="image-gallery">
        <div class="gallery-main" style="position:relative; display:flex;align-items:center;justify-content:center;min-height:260px;">
          <div style="text-align:center;color:#666;">
            <svg width="64" height="64" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="25" cy="25" r="20" stroke="#CD1719" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
            <div style="margin-top:8px;font-size:0.95em;">Bilder werden geladen...</div>
          </div>
        </div>
      </div>`;

    // Preload and display only successfully loaded images
    preloadImages(tryImages).then(loaded => {
      const loadedImages = Array.isArray(loaded) ? loaded.filter(Boolean) : [];
      if (!loadedImages || loadedImages.length === 0) {
        imageContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#666;"><i class="bi bi-image" style="font-size:2em;margin-bottom:8px;"></i><div>Keine Bilder verfügbar</div></div>`;
      } else {
        // Ensure exactly 10 images by cycling the successfully loaded ones if needed
        const imagesToUse = [];
        let i = 0;
        while (imagesToUse.length < 10) {
          imagesToUse.push(loadedImages[i % loadedImages.length]);
          i++;
        }
        imageContainer.innerHTML = window.createImageGallery ? createImageGallery(imagesToUse) : '';
        if (window.addGalleryEventListeners) setTimeout(() => { addGalleryEventListeners(); }, 100);
      }
    }).catch(() => {
      imageContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#666;"><i class="bi bi-image" style="font-size:2em;margin-bottom:8px;"></i><div>Keine Bilder verfügbar</div></div>`;
    });
  } else {
    // No remote URLs; show placeholder or empty gallery
    imageContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#666;"><i class="bi bi-image" style="font-size:2em;margin-bottom:8px;"></i><div>Keine Bilder verfügbar</div></div>`;
  }
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
