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
              // Anzeige: auf 100 runden
              let displayPopulationStr = '-';
              if (population !== 'Unbekannt' && population != null) {
                const pNum = Number(population);
                if (!isNaN(pNum)) displayPopulationStr = (Math.round(pNum / 100) * 100).toLocaleString();
              }
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
                popupContent += `<br>Einwohner: ${displayPopulationStr}`;
                popupContent += `<div class="city-popup-weather" style="margin-top:1em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em;"><span>Lade Wetterdaten ...</span></div>`;
              }
              layer.on('click', function(e) {
                // Pass image URLs from common property names (img_urls, url, img_ruls) to the info panel so the gallery can use them
                const img_urls = Array.isArray(feature.properties && feature.properties.img_urls) ? feature.properties.img_urls
                  : Array.isArray(feature.properties && feature.properties.img_urls) ? feature.properties.img_urls
                  : Array.isArray(feature.properties && feature.properties.img_ruls) ? feature.properties.img_ruls
                  : null;
                showCityInfo({
                  name,
                  population,
                  province,
                  info,
                  lat,
                  lon,
                  img_urls
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
                // Anzeige: auf 100 runden
                let displayPopulationStr = '-';
                if (population !== 'Unbekannt' && population != null) {
                  const pNum = Number(population);
                  if (!isNaN(pNum)) displayPopulationStr = (Math.round(pNum / 100) * 100).toLocaleString();
                }
                let popupContent = `<b>${name}</b>`;
                if (province) popupContent += `<br>Provinz: ${province}`;
                popupContent += `<br>Einwohner: ${displayPopulationStr}`;
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
  // Bilder für die Stadt (nur img_urls aus GeoJSON verwenden)
  // Entscheide welche URLs verwendet werden: bevorzugt img_urls, sonst url oder img_ruls
  const remoteUrls = Array.isArray(city.img_urls) ? city.img_urls
    : Array.isArray(city.url) ? city.url
    : Array.isArray(city.img_ruls) ? city.img_ruls
    : null;
  const tryUrls = remoteUrls && remoteUrls.length > 0 ? sampleRandom(remoteUrls, 10) : null;

  if (tryUrls && tryUrls.length > 0) {
    // Zeige temporäre Lade-Galerie bis Bilder geladen sind
    imageContainer.style.display = '';
    imageContainer.innerHTML = `
      <div class="image-gallery">
        <div class="gallery-main" style="display:flex;align-items:center;justify-content:center;min-height:260px;">
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

    // Preload and display only successfully loaded images; if none, show placeholder
    preloadImages(tryUrls).then(loaded => {
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
        imageContainer.innerHTML = typeof createImageGallery === 'function' ? createImageGallery(imagesToUse) : '';
        if (typeof addGalleryEventListeners === 'function') setTimeout(() => { addGalleryEventListeners(); }, 100);
      }
    }).catch(() => {
      imageContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#666;"><i class="bi bi-image" style="font-size:2em;margin-bottom:8px;"></i><div>Keine Bilder verfügbar</div></div>`;
    });
  } else {
    // Keine Bild-URLs vorhanden: Bild-Container leer lassen und ausblenden
    imageContainer.innerHTML = '';
    imageContainer.style.display = 'none';
  }
  title.textContent = city.name;
  let infoBlock = '';
  if (city.info) {
    infoBlock = `<div class="province-teaser"><span>${city.info}</span></div>`;
  }
  // Berechne Entfernung zur festen Position in Deutschland (WGS84)
  const germanyLat = 51.163;
  const germanyLon = 10.447;
  function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const toRad = deg => deg * Math.PI / 180;
    const R = 6371; // Erdradius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  let distanceKm = null;
  if (typeof city.lat === 'number' && typeof city.lon === 'number') {
    distanceKm = haversineDistanceKm(city.lat, city.lon, germanyLat, germanyLon);
  } else if (city.lat && city.lon) {
    // fallback if strings
    const latNum = Number(city.lat);
    const lonNum = Number(city.lon);
    if (!isNaN(latNum) && !isNaN(lonNum)) distanceKm = haversineDistanceKm(latNum, lonNum, germanyLat, germanyLon);
  }
  // Auf 100 km runden, wie gewünscht
  const roundedDistance = (distanceKm === null) ? null : Math.round(distanceKm / 100) * 100;

  let detailsHtml = `
    <h4>${city.name}</h4>
    ${infoBlock}
    <div class="city-popup-weather" style="margin-bottom:1em; margin-top:0.5em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em; line-height:1.5; display:flex; flex-direction:column; gap:2px;">
      <span><i class='bi bi-geo-alt-fill' style='color:#CD1719; margin-right:6px;'></i> <strong>Provinz:</strong> ${city.province || '-'}</span>
      <span><i class='bi bi-people-fill' style='color:#CD1719; margin-right:6px;'></i> <strong>Einwohner:</strong> ${(() => {
        const pop = city.population !== undefined ? city.population : 'Unbekannt';
        if (pop === 'Unbekannt' || pop === null) return '-';
        const pn = Number(pop);
        return isNaN(pn) ? '-' : (Math.round(pn / 100) * 100).toLocaleString();
      })()}</span>
      <span><i class='bi bi-signpost-2-fill' style='color:#CD1719; margin-right:6px;'></i> <strong>Entfernung zu DE:</strong> ${roundedDistance !== null ? roundedDistance.toLocaleString() + ' km' : '-'}</span>
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