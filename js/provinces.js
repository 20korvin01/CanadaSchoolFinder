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
      <div class="gallery-main">
        <img id="gallery-main-img" src="${images[0]}" alt="Galerie Bild" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div style="display: none; text-align: center; padding: 50px; color: #666;">
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
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = currentImages[index];
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
// Galerie-Bilder für Provinzen (aus infopanel.js verschoben)
const provinceImages = {
  "Alberta": [
    './img/alberta/alberta1.jpeg',
    './img/alberta/alberta2.jpeg',
    './img/alberta/alberta3.jpg',
    './img/alberta/alberta4.jpg',
    './img/alberta/alberta5.jpg',
    './img/alberta/alberta6.jpeg',
    './img/alberta/alberta7.jpeg',
    './img/alberta/alberta8.jpg',
    './img/alberta/alberta9.jpg',
    './img/alberta/alberta10.jpeg'
  ],
  "Manitoba": [
    './img/manitoba/manitoba1.jpeg',
    './img/manitoba/manitoba2.jpg',
    './img/manitoba/manitoba3.jpg',
    './img/manitoba/manitoba4.jpg',
    './img/manitoba/manitoba5.jpeg',
    './img/manitoba/manitoba6.jpeg',
    './img/manitoba/manitoba7.jpg',
    './img/manitoba/manitoba8.jpg',
    './img/manitoba/manitoba9.jpeg',
    './img/manitoba/manitoba10.jpeg'
  ],
  "Newfoundland and Labrador": [
    './img/newfoundland_labrador/newfoundland_labrador1.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador2.jpg',
    './img/newfoundland_labrador/newfoundland_labrador3.jpg',
    './img/newfoundland_labrador/newfoundland_labrador4.jpg',
    './img/newfoundland_labrador/newfoundland_labrador5.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador6.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador7.jpg',
    './img/newfoundland_labrador/newfoundland_labrador8.jpg',
    './img/newfoundland_labrador/newfoundland_labrador9.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador10.jpeg'
  ],
  "New Brunswick": [
    './img/new_brunswick/new_brunswick1.jpeg',
    './img/new_brunswick/new_brunswick2.jpg',
    './img/new_brunswick/new_brunswick3.jpg',
    './img/new_brunswick/new_brunswick4.jpg',
    './img/new_brunswick/new_brunswick5.jpeg',
    './img/new_brunswick/new_brunswick6.jpg',
    './img/new_brunswick/new_brunswick7.jpg',
    './img/new_brunswick/new_brunswick8.jpg',
    './img/new_brunswick/new_brunswick9.jpg',
    './img/new_brunswick/new_brunswick10.jpg'
  ],
  "Nova Scotia": [
    './img/nova_scotia/nova_scotia1.jpeg',
    './img/nova_scotia/nova_scotia2.jpg',
    './img/nova_scotia/nova_scotia3.jpg',
    './img/nova_scotia/nova_scotia4.jpg',
    './img/nova_scotia/nova_scotia5.jpeg',
    './img/nova_scotia/nova_scotia6.jpeg',
    './img/nova_scotia/nova_scotia7.jpg',
    './img/nova_scotia/nova_scotia8.jpg',
    './img/nova_scotia/nova_scotia9.jpeg',
    './img/nova_scotia/nova_scotia10.jpg'
  ],
  "Ontario": [
    './img/ontario/ontario1.jpeg',
    './img/ontario/ontario2.jpg',
    './img/ontario/ontario3.jpg',
    './img/ontario/ontario4.jpg',
    './img/ontario/ontario5.jpeg',
    './img/ontario/ontario6.jpeg',
    './img/ontario/ontario7.jpg',
    './img/ontario/ontario8.jpg',
    './img/ontario/ontario9.jpeg',
    './img/ontario/ontario10.jpeg'
  ],
  "Prince Edward Island": [
    './img/prince_edward_island/prince_edward_island1.jpeg',
    './img/prince_edward_island/prince_edward_island2.jpg',
    './img/prince_edward_island/prince_edward_island3.jpg',
    './img/prince_edward_island/prince_edward_island4.jpg',
    './img/prince_edward_island/prince_edward_island5.jpeg',
    './img/prince_edward_island/prince_edward_island6.jpeg',
    './img/prince_edward_island/prince_edward_island7.jpg',
    './img/prince_edward_island/prince_edward_island8.jpg',
    './img/prince_edward_island/prince_edward_island9.jpeg',
    './img/prince_edward_island/prince_edward_island10.jpeg'
  ],
  "Quebec": [
    './img/quebec/quebec1.jpeg',
    './img/quebec/quebec2.jpg',
    './img/quebec/quebec3.jpg',
    './img/quebec/quebec4.jpg',
    './img/quebec/quebec5.jpeg',
    './img/quebec/quebec6.jpeg',
    './img/quebec/quebec7.jpg',
    './img/quebec/quebec8.jpg',
    './img/quebec/quebec9.jpg',
    './img/quebec/quebec10.jpg'
  ],
  "Saskatchewan": [
    './img/saskatchewan/saskatchewan1.jpeg',
    './img/saskatchewan/saskatchewan2.jpg',
    './img/saskatchewan/saskatchewan3.jpg',
    './img/saskatchewan/saskatchewan4.jpg',
    './img/saskatchewan/saskatchewan5.jpg',
    './img/saskatchewan/saskatchewan6.jpg',
    './img/saskatchewan/saskatchewan7.jpg',
    './img/saskatchewan/saskatchewan8.jpg',
    './img/saskatchewan/saskatchewan9.jpg',
    './img/saskatchewan/saskatchewan10.jpg'
  ],
  "British Columbia": [
    './img/british_columbia/bc1.jpeg',
    './img/british_columbia/bc2.jpg',
    './img/british_columbia/bc3.jpg',
    './img/british_columbia/bc4.jpg',
    './img/british_columbia/bc5.jpeg',
    './img/british_columbia/bc6.jpeg',
    './img/british_columbia/bc7.jpg',
    './img/british_columbia/bc8.jpg',
    './img/british_columbia/bc9.jpeg',
    './img/british_columbia/bc10.jpeg'
  ],
  "Nunavut": [
    './img/nunavut/nunavut1.jpeg',
    './img/nunavut/nunavut2.jpg',
    './img/nunavut/nunavut3.png',
    './img/nunavut/nunavut4.jpg',
    './img/nunavut/nunavut5.jpeg',
    './img/nunavut/nunavut6.jpeg',
    './img/nunavut/nunavut7.jpg',
    './img/nunavut/nunavut8.png',
    './img/nunavut/nunavut9.jpeg',
    './img/nunavut/nunavut10.jpg'
  ],
  'Yukon': [
    './img/yukon/yukon9.jpg',
    './img/yukon/yukon1.jpg',
    './img/yukon/yukon2.jpg',
    './img/yukon/yukon3.jpg',
    './img/yukon/yukon4.jpg',
    './img/yukon/yukon5.jpg',
    './img/yukon/yukon6.jpg',
    './img/yukon/yukon7.jpg',
    './img/yukon/yukon10.jpg',
    './img/yukon/yukon8.jpg'
  ],
  'Northwest Territories': [
    './img/northwest_territories/nwt1.jpeg',
    './img/northwest_territories/nwt2.png',
    './img/northwest_territories/nwt3.jpg',
    './img/northwest_territories/nwt4.jpg',
    './img/northwest_territories/nwt5.jpg',
    './img/northwest_territories/nwt6.jpg',
    './img/northwest_territories/nwt7.jpg',
    './img/northwest_territories/nwt8.jpg',
    './img/northwest_territories/nwt9.jpg',
    './img/northwest_territories/nwt10.jpg'
  ],
};
// Provinz-Info im Info-Panel anzeigen
function showProvinceInfo(feature) {
  const title = document.getElementById('feature-title');
  const details = document.getElementById('feature-details');
  const imageContainer = document.getElementById('feature-image');
  if (feature.properties) {
    const props = feature.properties;
    const provinceName = props.prov_name_en;
    title.textContent = provinceName;
    // Bilder für die Provinz laden (aus infopanel.js)
    if (typeof provinceImages !== 'undefined') {
      const images = provinceImages[provinceName];
      imageContainer.innerHTML = window.createImageGallery ? createImageGallery(images) : '';
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
              showProvinceInfo(feature);
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
