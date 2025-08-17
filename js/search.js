// search.js
// Sucht durch die GeoJSON-Dateien und gibt die Ergebnisse zurück

// Beispiel: Initialisiere die Suche und binde das Input-Feld

function waitForCityInfoInit(cb) {
    if (typeof window.showCityInfo === 'function') {
        cb();
    } else {
        setTimeout(() => waitForCityInfoInit(cb), 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Hilfsfunktion: Entfernt alle Haupt-Layer unabhängig vom Checkbox-Status
    function removeAllMainLayers() {
        if (window.provincesLayer) map.removeLayer(window.provincesLayer);
        if (window.lakesLayer) map.removeLayer(window.lakesLayer);
        if (window.greatLakesLayer) map.removeLayer(window.greatLakesLayer);
        if (window.riversLayer) map.removeLayer(window.riversLayer);
        if (window.borealZonesLayer) map.removeLayer(window.borealZonesLayer);
        if (window.citiesLayers) {
            for (let i = 1; i <= 5; i++) {
                const layer = window.citiesLayers['cat' + i];
                if (layer) map.removeLayer(layer);
            }
        }
    }
    // Hilfsfunktion: Layer anhand Checkbox-Status ein-/ausblenden
    function setAllMainLayersVisible(visible) {
        // Provinzen
        const provincesCheckbox = document.getElementById('provincesCheckbox');
        if (window.provincesLayer && provincesCheckbox) {
            if (visible && provincesCheckbox.checked) {
                map.addLayer(window.provincesLayer);
            } else {
                map.removeLayer(window.provincesLayer);
            }
        }
        // Seen
        const lakesCheckbox = document.getElementById('lakesCheckbox');
        if (window.lakesLayer && lakesCheckbox) {
            if (visible && lakesCheckbox.checked) {
                map.addLayer(window.lakesLayer);
            } else {
                map.removeLayer(window.lakesLayer);
            }
        }
        // Große Seen
        const greatLakesCheckbox = document.getElementById('greatLakesCheckbox');
        if (window.greatLakesLayer && greatLakesCheckbox) {
            if (visible && greatLakesCheckbox.checked) {
                map.addLayer(window.greatLakesLayer);
            } else {
                map.removeLayer(window.greatLakesLayer);
            }
        }
        // Flüsse
        const riversCheckbox = document.getElementById('riversCheckbox');
        if (window.riversLayer && riversCheckbox) {
            if (visible && riversCheckbox.checked) {
                map.addLayer(window.riversLayer);
            } else {
                map.removeLayer(window.riversLayer);
            }
        }
        // Städte (alle Kategorien)
        for (let i = 1; i <= 5; i++) {
            const catCheckbox = document.getElementById('citiesCat' + i);
            const layer = window.citiesLayers && window.citiesLayers['cat' + i];
            if (layer && catCheckbox) {
                if (visible && catCheckbox.checked) {
                    map.addLayer(layer);
                } else {
                    map.removeLayer(layer);
                }
            }
        }
    }

    // Hilfsfunktion: Alle Layer-Checkboxen holen
    function getAllLayerCheckboxes() {
        const ids = [
            'provincesCheckbox',
            'lakesCheckbox',
            'greatLakesCheckbox',
            'riversCheckbox',
            'citiesCat1',
            'citiesCat2',
            'citiesCat3',
            'citiesCat4',
            'citiesCat5'
        ];
        return ids.map(id => document.getElementById(id)).filter(cb => cb);
    }

    // Status der Checkboxen zwischenspeichern
    let savedCheckboxStates = null;
    waitForCityInfoInit(function() {
        const searchInput = document.getElementById('search-geojson');
        if (!searchInput) return;

        // Suche nur bei Enter-Taste
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const query = e.target.value.trim().toLowerCase();
                if (query.length === 0) {
                    searchInput.style.backgroundColor = '';
                    if (window.searchResultLayer) {
                        map.removeLayer(window.searchResultLayer);
                        window.searchResultLayer = null;
                    }
                    // Checkboxen wiederherstellen und Layer synchronisieren
                    if (savedCheckboxStates) {
                        getAllLayerCheckboxes().forEach((cb, idx) => {
                            cb.checked = savedCheckboxStates[idx];
                        });
                        setAllMainLayersVisible(true); // Layer entsprechend Checkboxen anzeigen
                        savedCheckboxStates = null;
                    } else {
                        setAllMainLayersVisible(true);
                    }
                    return;
                }
                // Checkboxen-Status speichern und alle deaktivieren
                if (!savedCheckboxStates) {
                    savedCheckboxStates = getAllLayerCheckboxes().map(cb => cb.checked);
                }
                getAllLayerCheckboxes().forEach(cb => {
                    cb.checked = false;
                    // change-Event auslösen, damit Layer wirklich entfernt werden
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                });
                // Alle Layer entfernen, unabhängig vom Checkbox-Status
                removeAllMainLayers();
                searchGeojson(query, searchInput);
            }
        });

        // Entferne Such-Layer sofort beim Leeren des Feldes
        searchInput.addEventListener('input', function(e) {
            if (e.target.value.trim().length === 0) {
                searchInput.style.backgroundColor = '';
                if (window.searchResultLayer) {
                    map.removeLayer(window.searchResultLayer);
                    window.searchResultLayer = null;
                }
                // Checkboxen wiederherstellen und Layer synchronisieren
                if (savedCheckboxStates) {
                    getAllLayerCheckboxes().forEach((cb, idx) => {
                        cb.checked = savedCheckboxStates[idx];
                        // change-Event auslösen, damit Layer wirklich hinzugefügt/entfernt werden
                        cb.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    setAllMainLayersVisible(true); // Layer entsprechend Checkboxen anzeigen
                    savedCheckboxStates = null;
                } else {
                    setAllMainLayersVisible(true);
                }
            }
        });
    });
});

// Platzhalter für die eigentliche Suchfunktion
function searchGeojson(query, searchInput) {
    // Funktion zur Berechnung der Marker-Größe basierend auf Einwohnerzahl (wie in cities.js)
    function calculateMarkerSize(population) {
        if (!population || population === 0) return 3;
        const minSize = 3;
        const maxSize = 15;
        const minPop = 1000;
        const maxPop = 3000000;
        if (population <= minPop) return minSize;
        if (population >= maxPop) return maxSize;
        const logPop = Math.log(population);
        const logMin = Math.log(minPop);
        const logMax = Math.log(maxPop);
        const size = minSize + ((logPop - logMin) / (logMax - logMin)) * (maxSize - minSize);
        return Math.round(size);
    }
    // Such-Layer global verwalten
    if (window.searchResultLayer) {
        map.removeLayer(window.searchResultLayer);
        window.searchResultLayer = null;
    }

    const sources = [
        { name: 'cities', data: window.citiesGeojson, attr: 'city_ascii' },
        { name: 'provinces', data: window.provincesGeojson, attr: 'prov_name_en' },
        { name: 'lakes', data: window.lakesGeojson, attr: 'NAME' },
        { name: 'great_lakes', data: window.greatLakesGeojson, attr: 'NAMEEN' },
        { name: 'rivers', data: window.riversGeojson, attr: 'NAME' },
        { name: 'boreal_zones', data: window.borealZonesGeojson, attr: 'NAME' }
    ];

    let anyDataLoaded = false;
    let anyMatch = false;
    let foundFeatures = [];
    sources.forEach(source => {
        if (!source.data || !source.data.features) {
            console.warn(`Keine Daten geladen für: ${source.name}`);
            return;
        }
        anyDataLoaded = true;
        const matches = source.data.features.filter(f => {
            const val = f.properties[source.attr];
            return val && String(val).toLowerCase().includes(query);
        });
        if (matches.length > 0) {
            anyMatch = true;
            const names = matches.map(f => f.properties[source.attr] || '[Unbenannt]');
            // Typ-Info für Style/Popup
            matches.forEach(f => {
                f._searchType = source.name;
                foundFeatures.push(f);
            });
        }
    });
    if (!anyDataLoaded) {
        console.error('Es sind keine GeoJSON-Daten geladen!');
        searchInput.style.backgroundColor = '';
    } else if (!anyMatch) {
        searchInput.style.backgroundColor = '#ffcccc'; // rot
    } else {
        searchInput.style.backgroundColor = '#ccffcc'; // grün
        // Zeige Treffer als Layer auf der Karte
        window.searchResultLayer = L.geoJSON({
            type: 'FeatureCollection',
            features: foundFeatures
        }, {
            pointToLayer: function(feature, latlng) {
                if (feature._searchType === 'cities') {
                    const population = feature.properties.population || 0;
                    const radius = calculateMarkerSize(population);
                    return L.circleMarker(latlng, {
                        radius: radius,
                        pane: 'markerPane'
                    });
                }
                // Default für andere Punkte
                return L.marker(latlng, { pane: 'markerPane' });
            },
            style: function(feature) {
                // Umrandung grün, Füllfarbe je nach Typ
                let fillColor = '#fff';
                let fillOpacity = 0.5;
                let pane = 'overlayPane';
                if (feature._searchType === 'cities') {
                    fillColor = '#CD1719'; // Original rot
                    fillOpacity = 0.8;
                    pane = 'markerPane'; // Städte Marker Pane
                }
                if (feature._searchType === 'provinces') {
                    fillColor = '#d48282';
                    fillOpacity = 0.3;
                    pane = 'tilePane'; // Provinzen ganz hinten
                } else if (feature._searchType === 'lakes') {
                    fillColor = '#90caf9';
                    fillOpacity = 0.7;
                    pane = 'overlayPane';
                } else if (feature._searchType === 'great_lakes') {
                    fillColor = '#b3e5fc';
                    fillOpacity = 0.7;
                    pane = 'overlayPane';
                } else if (feature._searchType === 'rivers') {
                    fillColor = '#2196f3';
                    fillOpacity = 0.7;
                    pane = 'overlayPane';
                } else if (feature._searchType === 'boreal_zones') {
                    fillColor = '#a6c66c';
                    fillOpacity = 0.7;
                    pane = 'overlayPane';
                }
                return {
                    color: '#197d30', // grüne Umrandung
                    weight: 1,
                    fillColor: fillColor,
                    fillOpacity: fillOpacity,
                    pane: pane
                };
            },
            onEachFeature: function(feature, layer) {
                let popup = '';
                if (feature._searchType === 'cities') {
                    // Kein Popup, nur Info-Panel öffnen
                    layer.on('click', function() {
                        if (typeof window.showCityInfo === 'function') {
                            const name = feature.properties.name || feature.properties.city_ascii || feature.properties.city || 'Unbekannte Stadt';
                            const population = feature.properties.population || 'Unbekannt';
                            const province = feature.properties.province_name || feature.properties.prov || '';
                            const info = feature.properties.info;
                            const lat = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates[1] : null;
                            const lon = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates[0] : null;
                            window.showCityInfo({ name, population, province, info, lat, lon });
                        } else {
                            alert('Info-Panel-Funktion für Städte nicht gefunden!');
                        }
                    });
                    return; // Kein Popup binden
                } else if (feature._searchType === 'provinces') {
                    popup = `<b>${feature.properties.prov_name_en}</b>`;
                    layer.on('click', function() {
                        if (typeof window.showProvinceInfo === 'function') {
                            window.showProvinceInfo(feature);
                        } else {
                            alert('Info-Panel-Funktion für Provinzen nicht gefunden!');
                        }
                    });
                } else if (feature._searchType === 'lakes') {
                    popup = `<b>${feature.properties.NAME}</b>`;
                } else if (feature._searchType === 'great_lakes') {
                    popup = `<b>${feature.properties.NAMEEN}</b>`;
                    layer.on('click', function() {
                        if (typeof window.showGreatLakeInfo === 'function') {
                            window.showGreatLakeInfo(feature);
                        } else {
                            alert('Info-Panel-Funktion für große Seen nicht gefunden!');
                        }
                    });
                } else if (feature._searchType === 'rivers') {
                    popup = `<b>${feature.properties.NAME}</b>`;
                }
                if (feature._searchType === 'boreal_zones') {
                    layer.on('click', function() {
                        if (typeof window.showBorealZoneInfo === 'function') {
                            window.showBorealZoneInfo(feature);
                        } else {
                            alert('Info-Panel-Funktion für boreale Zonen nicht gefunden!');
                        }
                    });
                    return;
                }
                layer.bindPopup(popup);
            }
        }).addTo(map);
        // Karte auf Treffer zoomen
        if (foundFeatures.length > 0) {
            const bounds = window.searchResultLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { maxZoom: 8 });
            }
        }
    }
}
