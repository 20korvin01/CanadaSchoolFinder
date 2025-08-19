// Galerie-Status und Funktionen (aus infopanel.js verschoben)
let currentImageIndex = 0;
let currentImages = [];
let autoPlayInterval = null;

function createImageGallery(images) {
  if (!images || images.length === 0) {
    return `<div style="text-align: center; padding: 20px; color: #666;">
              <i class="bi bi-image" style="font-size: 3em; margin-bottom: 10px;"></i>
              <p>Keine Bilder verfügbar</p>
            </div>`;
  }
  currentImages = images;
  currentImageIndex = 0;
  return `
    <div class="image-gallery">
      <div class="gallery-main" style="position:relative;">
  <img id="gallery-main-img" src="${images[0]}" alt="Galerie Bild" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
  <!-- Small copyright/open-link button that opens the current image in a new tab -->
  <a id="image-link" href="${images[0]}" target="_blank" rel="noopener noreferrer" title="Open image in new tab" aria-label="Open image in new tab" style="position:absolute; left:8px; bottom:12px; background:transparent; padding:0; margin:0; font-size:1em; color:#ffffff; text-decoration:none; line-height:1;">©</a>
        <div style="display: none; text-align: center; padding: 50px; color: #ffffffff;">
          <i class="bi bi-exclamation-triangle" style="font-size: 2em;"></i>
          <p>Bild konnte nicht geladen werden</p>
        </div>
        <button id="prev-btn" class="gallery-btn">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button id="next-btn" class="gallery-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
        <div class="gallery-indicators">
          ${images.map((_, index) => 
            `<div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
          ).join('')}
        </div>
      </div>
    </div>
  `;
}

function updateGalleryImage(index) {
  if (!currentImages || currentImages.length === 0) return;
  if (index >= currentImages.length) {
    index = 0;
  } else if (index < 0) {
    index = currentImages.length - 1;
  }
  currentImageIndex = index;
  const mainImg = document.getElementById('gallery-main-img');
  const indicators = document.querySelectorAll('.indicator');
  const imageLink = document.getElementById('image-link');
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = currentImages[index];
      // Keep the copyright/open-link button in sync with the currently shown image
      if (imageLink) {
        imageLink.href = currentImages[index] || '';
        // Hide the link if there's no valid URL
        imageLink.style.display = currentImages[index] ? 'inline-block' : 'none';
      }
      mainImg.style.opacity = '1';
    }, 150);
  }
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
  });
}

function addGalleryEventListeners() {
  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateGalleryImage(currentImageIndex - 1);
    });
  }
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateGalleryImage(currentImageIndex + 1);
    });
  }
  const indicators = document.querySelectorAll('.indicator');
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      updateGalleryImage(index);
    });
  });
  document.addEventListener('keydown', function(e) {
    if (infoPanel.classList.contains('open')) {
      if (e.key === 'ArrowLeft') {
        updateGalleryImage(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        updateGalleryImage(currentImageIndex + 1);
      }
    }
  });
}
// Galerie-Bilder für Provinzen (local paths removed — use `img_urls` in GeoJSON instead)
const provinceImages = {
  "Alberta": [],
  "Manitoba": [],
  "Newfoundland and Labrador": [],
  "New Brunswick": [],
  "Nova Scotia": [],
  "Ontario": [],
  "Prince Edward Island": [],
  "Quebec": [],
  "Saskatchewan": [],
  "British Columbia": [],
  "Nunavut": [],
  'Yukon': [],
  'Northwest Territories': []
};

// Utility: sample up to `count` random items from an array (Fisher-Yates shuffle)
function sampleRandom(arr, count = 10) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

// Preload images and return only the URLs that successfully load
function preloadImages(urls, timeout = 8000) {
  if (!Array.isArray(urls) || urls.length === 0) return Promise.resolve([]);
  const loaders = urls.map(url => new Promise(resolve => {
    const img = new Image();
    let settled = false;
    const t = setTimeout(() => {
      if (!settled) { settled = true; resolve(null); }
    }, timeout);
    img.onload = () => { if (!settled) { settled = true; clearTimeout(t); resolve(url); } };
    img.onerror = () => { if (!settled) { settled = true; clearTimeout(t); resolve(null); } };
    img.src = url;
  }));
  return Promise.all(loaders).then(results => results.filter(Boolean));
}
// Provinz-Info im Info-Panel anzeigen
function showProvinceInfo(feature) {
  // Boreal-Zonen-Highlight entfernen, falls aktiv
  if (window.currentBorealHighlight) {
    window.currentBorealHighlight.setStyle(window.getBorealZoneStyle ? getBorealZoneStyle(window.currentBorealHighlight.feature) : {});
    window.currentBorealHighlight = null;
  }
  const title = document.getElementById('feature-title');
  const details = document.getElementById('feature-details');
  const imageContainer = document.getElementById('feature-image');
  if (feature.properties) {
    const props = feature.properties;
    const provinceName = props.prov_name_en;
    title.textContent = provinceName;
    // Bilder für die Provinz laden (aus infopanel.js)
    if (typeof provinceImages !== 'undefined') {
      // Ensure we always have a usable localImages array (may be empty)
      const localImages = Array.isArray(provinceImages[provinceName]) ? provinceImages[provinceName] : [];
      // If the GeoJSON feature contains an `img_urls` array, sample from it and preload
      const remoteUrls = Array.isArray(props.img_urls) ? props.img_urls : null;
      if (remoteUrls && remoteUrls.length > 0) {
        const sampled = sampleRandom(remoteUrls, 10);
        const tryImages = (sampled && sampled.length > 0) ? sampled : localImages;
        // Show a large loading placeholder immediately (same container size as gallery main image)
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

        // Preload and use only images that actually load; fallback to local images if none.
        // Ensure we always provide exactly 10 image URLs to the gallery by merging
        // loaded remote images with local fallbacks and cycling if necessary.
        preloadImages(tryImages).then(loaded => {
          const loadedImages = Array.isArray(loaded) ? loaded.filter(Boolean) : [];
          // Start with successfully loaded remote images, then append local images (no duplicates)
          const merged = [];
          const pushUnique = (url) => {
            if (!url) return;
            try {
              // normalize simple strings
              const s = String(url);
              if (!merged.includes(s)) merged.push(s);
            } catch (e) {
              // ignore non-string entries
            }
          };
          loadedImages.forEach(pushUnique);
          (localImages || []).forEach(pushUnique);

          // If still empty, show 'no images' message
          if (merged.length === 0) {
            imageContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#666;"><i class="bi bi-image" style="font-size:2em;margin-bottom:8px;"></i><div>Keine Bilder verfügbar</div></div>`;
            return;
          }

          // If we have fewer than 10 unique images, cycle existing ones to reach 10
          const imagesToUse = [];
          let i = 0;
          while (imagesToUse.length < 10) {
            imagesToUse.push(merged[i % merged.length]);
            i++;
          }

          imageContainer.innerHTML = window.createImageGallery ? createImageGallery(imagesToUse) : '';
          if (window.addGalleryEventListeners) setTimeout(() => { addGalleryEventListeners(); }, 100);
        });
      } else {
        // No remote URLs; use local images (may be empty)
        imageContainer.innerHTML = window.createImageGallery ? createImageGallery(localImages) : '';
      }
    }
    // Info-Text aus GeoJSON-Attribut 'info'
    const infoText = props.info ? `<div class="province-teaser">${props.info}</div>` : '';
    details.innerHTML = `
      <h4>${provinceName}</h4>
      ${infoText}
      <div class="city-popup-weather" style="margin-bottom:1em; margin-top:0.5em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em; line-height:1.5; display:flex; flex-direction:column; gap:6px;">
        <span><i class='bi bi-translate' style='color:#23407a; margin-right:6px;'></i> <strong>Franz. Name:</strong> ${props.prov_name_fr}</span>
  <span><i class='bi bi-geo' style='color:#23407a; margin-right:6px;'></i> <strong>Verwaltungseinheit:</strong> ${props.prov_type}</span>
        <span><i class='bi bi-building' style='color:#23407a; margin-right:6px;'></i> <strong>Hauptstadt:</strong> ${props.capital || '-'}</span>
                ${(() => {
                  const type = (props.prov_type || '').toLowerCase();
                  // Prüfe auf 'territory' oder 'territory / territoire'
                  const isTerritory = type.includes('territory');
                  if (isTerritory && props.commissioner) {
                    return `<span><i class='bi bi-file-person-fill' style='color:#23407a; margin-right:6px;'></i> <strong>Kommissar:</strong> ${props.commissioner}</span>`;
                  } else if (!isTerritory && props.governor) {
                    return `<span><i class='bi bi-file-person-fill' style='color:#23407a; margin-right:6px;'></i> <strong>Gouverneur:</strong> ${props.governor}</span>`;
                  } else {
                    return '';
                  }
                })()}
                <span><i class='bi bi-people-fill' style='color:#23407a; margin-right:6px;'></i> <strong>Bevölkerung:</strong> ${props.population ? props.population.toLocaleString() : '-'}</span>
      </div>
    `;
    // Galerie-Event-Listener
    if (window.addGalleryEventListeners) {
      setTimeout(() => { addGalleryEventListeners(); }, 100);
    }
  }
  // Info Panel öffnen
  infoPanel.classList.add('open');
  setTimeout(() => map.invalidateSize(), 300);
}
// Lädt die Provinces-GeoJSON und speichert sie global
fetch('data/provinces.geojson')
  .then(response => response.json())
  .then(data => {
    window.provincesGeojson = data;
  });
// Provinces Layer Management ####################################################################

// Variable für aktuell hervorgehobenes Feature
let highlightedLayer = null;
// Variable für temporäres Hover-Highlight (soll nicht mit Klick-Highlight kollidieren)
let tooltipHoverLayer = null;

// Standard-Style für Provinzen
function getDefaultStyle(feature) {
  return {
    color: '#ce5f5fff',
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.3,
    fillColor: '#d48282'
  };
}

// Highlight-Style für angeklicktes Feature
function getHighlightStyle(feature) {
  return {
    color: '#cc2424ff',
    weight: 1,
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

// Gemeinsame Tooltip-Funktion für Provinzen
function createProvinceTooltip(feature, layer) {
  let tooltipDiv;
  // Create tooltip element lazily and reuse
  function ensureTooltip() {
    if (!tooltipDiv) {
      tooltipDiv = document.createElement('div');
      tooltipDiv.className = 'province-tooltip';
      tooltipDiv.innerHTML = `<i class='bi bi-geo-alt-fill' style='margin-right:7px;'></i>${feature.properties.prov_name_en}`;
      document.body.appendChild(tooltipDiv);
    }
  }

  // Mouseover: show tooltip and apply transient highlight (unless feature is the clicked highlight)
  layer.on('mouseover', function(e) {
    ensureTooltip();
    tooltipDiv.style.display = 'block';

    // Positioning using Leaflet event originalEvent for accurate cursor coords
    function moveTooltip(ev) {
      const clientX = ev.originalEvent ? ev.originalEvent.clientX : (ev.clientX || 0);
      const clientY = ev.originalEvent ? ev.originalEvent.clientY : (ev.clientY || 0);
      tooltipDiv.style.left = (clientX + 16) + 'px';
      tooltipDiv.style.top = (clientY + 12) + 'px';
    }

    // Attach move handler to the layer so it updates while hovering
    layer.on('mousemove', moveTooltip);

    // If there's a previous hover highlight that's not the clicked highlight, reset it
    if (tooltipHoverLayer && tooltipHoverLayer !== layer && tooltipHoverLayer !== highlightedLayer) {
      try { tooltipHoverLayer.setStyle(getDefaultStyle()); } catch (err) {}
    }

    // Apply highlight style if this layer isn't the persistent (clicked) highlight
    if (highlightedLayer !== layer) {
      try { layer.setStyle(getHighlightStyle()); } catch (err) {}
    }
    tooltipHoverLayer = layer;
  });

  // Mouseout: hide tooltip and restore transient hover style (but keep clicked highlight)
  layer.on('mouseout', function() {
    if (tooltipDiv) tooltipDiv.style.display = 'none';
    // Remove any layer-local mousemove listeners by copying a no-op; Leaflet will replace handler on new listeners
    layer.off('mousemove');

    if (tooltipHoverLayer === layer) {
      tooltipHoverLayer = null;
      // Restore default style only if this layer is not the permanently highlighted one
      if (highlightedLayer !== layer) {
        try { layer.setStyle(getDefaultStyle()); } catch (err) {}
      }
    }
  });
}
window.createProvinceTooltip = createProvinceTooltip;

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
              showProvinceInfo(feature);
            });

            // Use centralized tooltip function for provinces
            if (typeof window.createProvinceTooltip === 'function') {
              window.createProvinceTooltip(feature, layer);
            }
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
                  showProvinceInfo(feature);
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
