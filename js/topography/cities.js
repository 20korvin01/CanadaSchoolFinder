// Lädt die Cities-GeoJSON und speichert sie global
fetch('data/cities.geojson')
  .then(response => response.json())
  .then(data => {
    window.citiesGeojson = data;
  });
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
              const province = feature.properties.province_name || feature.properties.prov || '';
              const info = feature.properties.info;
              const lat = feature.geometry.coordinates[1];
              const lon = feature.geometry.coordinates[0];
              let popupContent = '';
              if (info) {
                popupContent = `
                  <div class="city-popup-info">
                    <div class="city-popup-title">${name}</div>
                    <div class="city-popup-text"><span>${info}</span></div>
                    <div class="city-popup-weather" style="margin-top:1em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em;">
                      <span>Lade Wetterdaten ...</span>
                    </div>
                  </div>
                `;
              } else {
                popupContent = `<b>${name}</b>`;
                if (province) popupContent += `<br>Provinz: ${province}`;
                if (population !== 'Unbekannt') {
                  popupContent += `<br>Einwohner: ${population.toLocaleString()}`;
                }
                popupContent += `<div class="city-popup-weather" style="margin-top:1em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em;"><span>Lade Wetterdaten ...</span></div>`;
              }
              layer.on('click', function(e) {
                showCityInfo({
                  name,
                  population,
                  province,
                  info,
                  lat,
                  lon
                });
                // Popup mit nur dem Stadtnamen immer mittig auf dem Marker anzeigen
                layer.bindPopup(`<b>${name}</b>`);
                layer.openPopup(layer.getLatLng());
              });

              // Tooltip: use centralized createCityTooltip to avoid duplicate creation
              if (typeof window.createCityTooltip === 'function') {
                window.createCityTooltip(feature, layer);
              }
            }
          }
        });
      });

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

// Gemeinsame Tooltip-Funktion für Städte (wird von search.js erwartet)
function createCityTooltip(feature, layer) {
  let tooltipDiv = null;
  const name = feature.properties.name || feature.properties.city || 'Unbekannte Stadt';
  layer.on('mouseover', function(e) {
    if (!tooltipDiv) {
      tooltipDiv = document.createElement('div');
      tooltipDiv.className = 'city-tooltip';
      tooltipDiv.innerHTML = `<i class='bi bi-building' style='margin-right:7px;'></i>${name}`;
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
window.createCityTooltip = createCityTooltip;

// Info-Panel für Städte anzeigen (statt Popup)
function showCityInfo(city) {
  // Provinz-Highlight entfernen, falls aktiv
  if (typeof clearHighlight === 'function') {
    clearHighlight();
  }
  const title = document.getElementById('feature-title');
  const details = document.getElementById('feature-details');
  const imageContainer = document.getElementById('feature-image');
  // Kein Bild für Städte
  imageContainer.innerHTML = '';
  title.textContent = city.name;
  let infoBlock = '';
  if (city.info) {
    infoBlock = `<div class="province-teaser"><span>${city.info}</span></div>`;
  }
  let detailsHtml = `
    <h4>${city.name}</h4>
    ${infoBlock}
    <div class="city-popup-weather" style="margin-bottom:1em; margin-top:0.5em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em; line-height:1.5; display:flex; flex-direction:column; gap:2px;">
      <span><i class='bi bi-geo-alt-fill' style='color:#CD1719; margin-right:6px;'></i> <strong>Provinz:</strong> ${city.province || '-'}</span>
      <span><i class='bi bi-people-fill' style='color:#CD1719; margin-right:6px;'></i> <strong>Einwohner:</strong> ${city.population !== 'Unbekannt' ? city.population.toLocaleString() : '-'}</span>
    </div>
    <div id="city-time-block" class="city-popup-weather" style="margin-top:0.7em; margin-bottom:0.7em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em;">
      <span>Lade Uhrzeit ...</span>
    </div>
    <div id="city-weather-block" class="city-popup-weather" style="margin-top:1em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em;">
      <span>Lade Wetterdaten ...</span>
    </div>
  `;
  details.innerHTML = detailsHtml;
  // Info Panel öffnen
  document.getElementById('info-panel').classList.add('open');
  setTimeout(() => map.invalidateSize(), 300);
  // Uhrzeit laden (Stadt und Berlin parallel)
  const timeUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&timezone=auto`;
  const berlinUrl = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405&timezone=auto';
  // Platzhalter anzeigen, bis beide Daten da sind
  const timeNode = document.getElementById('city-time-block');
  if (timeNode) timeNode.innerHTML = '<div style="font-weight:bold; font-size:1.08em; margin-bottom:0.3em;">Aktuelle Uhrzeit</div><div><i class="bi bi-clock-fill" style="color:#23407a; margin-right:6px;"></i> ...</div><div><i class="bi bi-globe2" style="color:#23407a; margin-right:6px;"></i> ...</div><div><i class="bi bi-arrow-left-right" style="color:#23407a; margin-right:6px;"></i> ...</div>';
  Promise.all([
    fetch(timeUrl).then(res => res.json()),
    fetch(berlinUrl).then(res => res.json())
  ]).then(([data, berlin]) => {
    let html = '';
    if (
      data && typeof data.utc_offset_seconds === 'number' && data.timezone &&
      berlin && typeof berlin.utc_offset_seconds === 'number'
    ) {
      // Aktuelle UTC-Zeit holen
      const now = new Date();
      const utcMillis = now.getTime() + (now.getTimezoneOffset() * 60000);
      // Stadt
      const localMillis = utcMillis + (data.utc_offset_seconds * 1000);
      const localDate = new Date(localMillis);
      const hhmm = localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tz = data.timezone;
      const abbr = data.timezone_abbreviation ? ` (${data.timezone_abbreviation})` : '';
      // Berlin
      const berlinMillis = utcMillis + (berlin.utc_offset_seconds * 1000);
      //const berlinDate = new Date(berlinMillis);
      // Zeitverschiebung
      const diffH = Math.round((data.utc_offset_seconds - berlin.utc_offset_seconds) / 3600);
      let diffStr = '';
      if (diffH > 0) diffStr = `+${diffH} Stunden`;
      else if (diffH < 0) diffStr = `${diffH} Stunden`;
      else diffStr = '0 Stunden';
      html = `
        <div style="font-weight:bold; font-size:1.08em; margin-bottom:0.3em;">Aktuelle Uhrzeit</div>
        <div><i class='bi bi-clock-fill' style='color:#23407a; margin-right:6px;'></i> ${hhmm} Uhr</div>
        <div><i class='bi bi-globe2' style='color:#23407a; margin-right:6px;'></i> ${tz}${abbr}</div>
        <div><i class='bi bi-arrow-left-right' style='color:#23407a; margin-right:6px;'></i> Zu Deutschland: ${diffStr}</div>
      `;
    } else {
      html = 'Keine Zeitdaten verfügbar.';
    }
    if (timeNode) timeNode.innerHTML = html;
  }).catch(() => {
    if (timeNode) timeNode.innerHTML = 'Uhrzeit konnte nicht geladen werden.';
  });

  // Wetterdaten laden
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&hourly=temperature_2m,precipitation,windspeed_10m,winddirection_10m,cloudcover`;
  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      let html = '';
      if (data && data.current_weather) {
        const w = data.current_weather;
        // Bootstrap Icons: thermometer, wind, cloud, cloud-drizzle
        html = `<b>Aktuelles Wetter</b><br>
          <i class='bi bi-thermometer-half' style='color:#23407a; margin-right:6px;'></i> Temperatur: ${w.temperature}°C<br>
          <i class='bi bi-wind' style='color:#23407a; margin-right:6px;'></i> Wind: ${w.windspeed} km/h (${w.winddirection}&deg;)<br>
          <i class='bi bi-cloud' style='color:#23407a; margin-right:6px;'></i> Bewölkung: ${data.hourly && data.hourly.cloudcover ? data.hourly.cloudcover[0] + '%' : 'k.A.'}<br>
          <i class='bi bi-cloud-drizzle' style='color:#23407a; margin-right:6px;'></i> Niederschlag: ${data.hourly && data.hourly.precipitation ? data.hourly.precipitation[0] + ' mm' : 'k.A.'}`;
      } else {
        html = 'Keine Wetterdaten verfügbar.';
      }
      const weatherNode = document.getElementById('city-weather-block');
      if (weatherNode) weatherNode.innerHTML = html;
    })
    .catch(() => {
      const weatherNode = document.getElementById('city-weather-block');
      if (weatherNode) weatherNode.innerHTML = 'Wetterdaten konnten nicht geladen werden.';
    });
}
window.showCityInfo = showCityInfo;

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

// Funktion global verfügbar machen
window.showCityInfo = showCityInfo;
});