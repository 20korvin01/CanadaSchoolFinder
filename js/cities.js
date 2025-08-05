// Cities Layer Management ####################################################################

// Layer-Objekte für jede Kategorie
let citiesLayers = {
  cat1: null, // < 10.000
  cat2: null, // 10.000 – 50.000
  cat3: null, // 50.000 – 250.000
  cat4: null, // 250.000 – 1.000.000
  cat5: null  // > 1.000.000
};

// Hilfsfunktion: Kategorie anhand Einwohnerzahl bestimmen
function getCityCategory(population) {
  if (population < 10000) return 'cat1';
  if (population < 50000) return 'cat2';
  if (population < 250000) return 'cat3';
  if (population < 1000000) return 'cat4';
  return 'cat5';
}

// Cities Layer Variable
let citiesLayer = null;

// Funktion zur Berechnung der Marker-Größe basierend auf Einwohnerzahl
function calculateMarkerSize(population) {
  if (!population || population === 0) return 3; // Mindestgröße für unbekannte Population
  
  // Logarithmische Skalierung für bessere Darstellung
  // Größe zwischen 3 und 15 Pixel
  const minSize = 3;
  const maxSize = 15;
  const minPop = 1000;
  const maxPop = 3000000; // Toronto hat ca. 3 Millionen Einwohner
  
  if (population <= minPop) return minSize;
  if (population >= maxPop) return maxSize;
  
  // Logarithmische Skalierung
  const logPop = Math.log(population);
  const logMin = Math.log(minPop);
  const logMax = Math.log(maxPop);
  
  const size = minSize + ((logPop - logMin) / (logMax - logMin)) * (maxSize - minSize);
  return Math.round(size);
}

// Style-Funktion für City-Marker
function getCityStyle(feature) {
  const population = feature.properties.population || 0;
  const radius = calculateMarkerSize(population);
  
  return {
    radius: radius,
    fillColor: '#CD1719',
    color: '#6e0505ff',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}

// Dynamischer Basis-Pfad für lokale Nutzung und GitHub Pages
const citiesBasePath = window.location.hostname === '20korvin01.github.io' ? '/KanadaSchoolFinder' : '';

// Funktion zum Laden der Städte (angepasst für Kategorien)
function loadCities() {
  fetch(`${citiesBasePath}/data/cities.geojson`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      // Initialisiere leere Feature-Arrays für jede Kategorie
      let featuresByCat = {
        cat1: [],
        cat2: [],
        cat3: [],
        cat4: [],
        cat5: []
      };

      // Sortiere Features in Kategorien
      data.features.forEach(feature => {
        const pop = feature.properties.population || 0;
        const cat = getCityCategory(pop);
        featuresByCat[cat].push(feature);
      });

      // Erstelle für jede Kategorie einen eigenen Layer
      Object.keys(featuresByCat).forEach(cat => {
        citiesLayers[cat] = L.geoJSON({
          type: "FeatureCollection",
          features: featuresByCat[cat]
        }, {
          pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, getCityStyle(feature));
          },
          onEachFeature: function(feature, layer) {
            if (feature.properties) {
              const name = feature.properties.name || feature.properties.city || 'Unbekannte Stadt';
              const population = feature.properties.population || 'Unbekannt';
              const province = feature.properties.province || feature.properties.prov || '';
              const info = feature.properties.info;
              let popupContent = '';
              if (info) {
                popupContent = `
                  <div class="city-popup-info">
                    <div class="city-popup-title">${name}</div>
                    <div class="city-popup-text">${info}</div>
                  </div>
                `;
              } else {
                popupContent = `<b>${name}</b>`;
                if (province) popupContent += `<br>Provinz: ${province}`;
                if (population !== 'Unbekannt') {
                  popupContent += `<br>Einwohner: ${population.toLocaleString()}`;
                }
              }
              layer.bindPopup(popupContent, { className: info ? 'city-popup' : '' });
              layer.on('click', function(e) {
                // Popup immer an der Feature-Position öffnen, nicht an der Klickposition
                this.openPopup(this.getLatLng());
                console.log('Stadt angeklickt:', name);
              });
            }
          }
        });
      });

      console.log('Cities Layers nach Kategorien geladen');
    })
    .catch(error => {
      console.error('Fehler beim Laden der Cities GeoJSON-Daten:', error);
      console.log('Versuche alternativen Pfad...');
      
      // Fallback: Versuche absoluten Pfad für GitHub Pages
      fetch('/KanadaSchoolFinder/data/cities.geojson')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          citiesLayer = L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, getCityStyle(feature));
            },
            onEachFeature: function(feature, layer) {
              if (feature.properties) {
                const name = feature.properties.name || feature.properties.city || 'Unbekannte Stadt';
                const population = feature.properties.population || 'Unbekannt';
                const province = feature.properties.province || feature.properties.prov || '';
                
                let popupContent = `<b>${name}</b>`;
                if (province) popupContent += `<br>Provinz: ${province}`;
                if (population !== 'Unbekannt') {
                  popupContent += `<br>Einwohner: ${population.toLocaleString()}`;
                }
                
                layer.bindPopup(popupContent);
                
                layer.on('click', function(e) {
                  console.log('Stadt angeklickt:', name);
                });
              }
            }
          });
          
          console.log('Cities Layer mit Fallback-Pfad geladen');
        })
        .catch(fallbackError => {
          console.error('Auch Cities Fallback-Pfad fehlgeschlagen:', fallbackError);
          console.warn('Cities GeoJSON-Daten konnten nicht geladen werden.');
        });
    });
}

// Funktion zum Ein-/Ausblenden einer Kategorie
function toggleCitiesCategory(cat, visible) {
  if (citiesLayers[cat]) {
    if (visible) {
      map.addLayer(citiesLayers[cat]);
    } else {
      map.removeLayer(citiesLayers[cat]);
    }
  }
}

// Event Listener für alle Kategorie-Checkboxen
function initializeCitiesToggle() {
  const catIds = ['citiesCat1', 'citiesCat2', 'citiesCat3', 'citiesCat4', 'citiesCat5'];
  catIds.forEach((id, idx) => {
    const cat = `cat${idx + 1}`;
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', function() {
        toggleCitiesCategory(cat, this.checked);
      });
      // Beim Laden: Layer anzeigen, falls Checkbox aktiviert
      if (checkbox.checked) {
        toggleCitiesCategory(cat, true);
      }
    }
  });
}

// Städte automatisch laden wenn die Seite geladen ist
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadCities();
    // initializeCitiesToggle wird nach kurzer Verzögerung aufgerufen,
    // damit die Layer nach dem Laden der Daten getoggelt werden können
    setTimeout(initializeCitiesToggle, 400);
  }, 150);
});