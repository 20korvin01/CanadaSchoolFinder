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

document.addEventListener('DOMContentLoaded', function () {
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
            'borealZonesCheckbox',
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
    waitForCityInfoInit(function () {
        const searchInput = document.getElementById('search-geojson');
        if (!searchInput) return;

        // Suche nur bei Enter-Taste
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const query = e.target.value.trim().toLowerCase();
                if (query.length === 0) {
                    searchInput.style.backgroundColor = '';
                    if (window.searchResultLayer) {
                        map.removeLayer(window.searchResultLayer);
                        window.searchResultLayer = null;
                    }
                    if (window.searchHighlightLayer) {
                        map.removeLayer(window.searchHighlightLayer);
                        window.searchHighlightLayer = null;
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
        searchInput.addEventListener('input', function (e) {
            if (e.target.value.trim().length === 0) {
                searchInput.style.backgroundColor = '';
                if (window.searchResultLayer) {
                    map.removeLayer(window.searchResultLayer);
                    window.searchResultLayer = null;
                }
                if (window.searchHighlightLayer) {
                    map.removeLayer(window.searchHighlightLayer);
                    window.searchHighlightLayer = null;
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
    // Remove any existing highlight
    if (window.searchHighlightLayer) {
        map.removeLayer(window.searchHighlightLayer);
        window.searchHighlightLayer = null;
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
            pointToLayer: function (feature, latlng) {
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
            style: function (feature) {
                // Verwende die Original-Styles der jeweiligen Layer
                if (feature._searchType === 'provinces' && typeof window.getDefaultStyle === 'function') {
                    return window.getDefaultStyle(feature);
                }
                if (feature._searchType === 'lakes' && typeof window.getLakeStyle === 'function') {
                    return window.getLakeStyle(feature);
                }
                if (feature._searchType === 'great_lakes' && typeof window.getGreatLakeStyle === 'function') {
                    return window.getGreatLakeStyle(feature);
                }
                if (feature._searchType === 'boreal_zones' && typeof window.getBorealZoneStyle === 'function') {
                    return window.getBorealZoneStyle(feature);
                }
                // Default für Städte und Flüsse
                if (feature._searchType === 'cities') {
                    return {
                        color: '#CD1719',
                        weight: 1,
                        fillColor: '#CD1719',
                        fillOpacity: 0.8,
                        pane: 'markerPane'
                    };
                }
                if (feature._searchType === 'rivers') {
                    return {
                        color: '#2196f3',
                        weight: 1,
                        fillColor: '#2196f3',
                        fillOpacity: 0.7,
                        pane: 'overlayPane'
                    };
                }
                // Fallback
                return {
                    color: '#197d30',
                    weight: 1,
                    fillColor: '#fff',
                    fillOpacity: 0.5,
                    pane: 'overlayPane'
                };
            },
            onEachFeature: function (feature, layer) {
                // Helper: highlight the clicked feature (uses project layer styles when available)
                function highlightFeature(f) {
                    if (window.searchHighlightLayer) {
                        try { map.removeLayer(window.searchHighlightLayer); } catch (e) {}
                        window.searchHighlightLayer = null;
                    }

                    // POINTS (cities)
                    if (f.geometry && f.geometry.type && f.geometry.type.indexOf('Point') !== -1 && f._searchType === 'cities') {
                        // derive base style from getCityStyle if available
                        const base = (typeof window.getCityStyle === 'function') ? window.getCityStyle(f) : { radius: calculateMarkerSize(f.properties && f.properties.population), fillColor: '#CD1719', color: '#6e0505ff', weight: 1, fillOpacity: 0.8 };
                        const radius = (base.radius || 6) + 3;
                        const markerStyle = Object.assign({}, base, { radius: radius, color: '#ffeb3b', weight: 2, fillColor: '#ff9d9dff', fillOpacity: 0.95, pane: 'markerPane' });
                        window.searchHighlightLayer = L.geoJSON(f, {
                            pointToLayer: function (ff, latlng) {
                                return L.circleMarker(latlng, markerStyle);
                            }
                        }).addTo(map);
                        if (window.searchHighlightLayer && window.searchHighlightLayer.bringToFront) try { window.searchHighlightLayer.bringToFront(); } catch (e) {}
                        return;
                    }

                    // POLYGONS / LINES: try to use existing highlight style functions
                    let styleObj = null;
                    if (f._searchType === 'provinces') {
                        if (typeof window.getHighlightStyle === 'function') styleObj = window.getHighlightStyle(f);
                        else if (typeof window.getDefaultStyle === 'function') styleObj = Object.assign({}, window.getDefaultStyle(f), { weight: 3, color: '#cc2424ff', fillOpacity: 0.65 });
                    } else if (f._searchType === 'lakes') {
                        if (typeof window.getLakeHighlightStyle === 'function') styleObj = window.getLakeHighlightStyle(f);
                        else if (typeof window.getLakeStyle === 'function') styleObj = Object.assign({}, window.getLakeStyle(f), { weight: 3, color: '#23407a' });
                    } else if (f._searchType === 'great_lakes') {
                        if (typeof window.getGreatLakeHighlightStyle === 'function') styleObj = window.getGreatLakeHighlightStyle(f);
                        else if (typeof window.getGreatLakeStyle === 'function') styleObj = Object.assign({}, window.getGreatLakeStyle(f), { weight: 3, color: '#23407a' });
                    } else if (f._searchType === 'rivers') {
                        if (typeof window.getRiverHighlightStyle === 'function') styleObj = window.getRiverHighlightStyle(f);
                        else if (typeof window.getRiverStyle === 'function') styleObj = Object.assign({}, window.getRiverStyle(f), { weight: 3, color: '#23407a' });
                    } else if (f._searchType === 'boreal_zones') {
                        // boreal zones use a distinct highlight in boreal_zones.js
                        styleObj = { fillColor: '#ff9900ff', fillOpacity: 0.8, color: undefined, weight: 0 };
                    }

                    if (styleObj) {
                        window.searchHighlightLayer = L.geoJSON(f, { style: styleObj }).addTo(map);
                        if (window.searchHighlightLayer && window.searchHighlightLayer.bringToFront) try { window.searchHighlightLayer.bringToFront(); } catch (e) {}
                        return;
                    }

                    // Fallback: generic visible highlight
                    window.searchHighlightLayer = L.geoJSON(f, {
                        style: function () {
                            return { color: '#ffeb3b', weight: 3, fillColor: '#fff59d', fillOpacity: 0.6, pane: 'overlayPane' };
                        },
                        pointToLayer: function (ff, latlng) {
                            return L.circleMarker(latlng, { radius: 10, color: '#ffeb3b', weight: 3, fillColor: '#fff59d', fillOpacity: 0.9, pane: 'markerPane' });
                        }
                    }).addTo(map);
                    if (window.searchHighlightLayer && window.searchHighlightLayer.bringToFront) try { window.searchHighlightLayer.bringToFront(); } catch (e) {}
                }

                let popup = '';
                // Tooltip-Logik für Suchergebnisse: nutze die Originalfunktionen aus den Layer-Dateien
                if (feature._searchType === 'cities') {
                    // For city search results: no highlight; open simple popup and the info panel for the city
                    const cityName = feature.properties.name || feature.properties.city_ascii || feature.properties.city || 'Unbekannte Stadt';
                    const population = feature.properties.population || 'Unbekannt';
                    const province = feature.properties.province_name || feature.properties.prov || '';
                    const info = feature.properties.info;
                    const lat = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates[1] : null;
                    const lon = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates[0] : null;
                    layer.bindPopup(`<b>${cityName}</b>`);
                    layer.on('click', function () {
                        if (typeof window.showCityInfo === 'function') {
                            window.showCityInfo({ name: cityName, population, province, info, lat, lon });
                            // showCityInfo may call clearHighlight() which closes popups.
                            // Open the popup shortly after to ensure it remains visible.
                            setTimeout(() => { try { layer.openPopup(); } catch (e) {} }, 30);
                        } else {
                            // Fallback: open popup immediately if showCityInfo is not available
                            try { layer.openPopup(); } catch (e) {}
                            console.warn('showCityInfo not available');
                        }
                    });
                    // Tooltip wie im cities.js
                    if (typeof window.createCityTooltip === 'function') {
                        window.createCityTooltip(feature, layer);
                    }
                    return; // don't bind other handlers
                }
                // Use centralized tooltip functions where available
                if (feature._searchType === 'provinces') {
                    popup = `<b>${feature.properties.prov_name_en}</b>`;
                    layer.on('click', function () {
                        highlightFeature(feature);
                        window.showProvinceInfo(feature);
                    });
                    if (typeof window.createProvinceTooltip === 'function') {
                        window.createProvinceTooltip(feature, layer);
                    } else {
                        // fallback: basic tooltip
                        layer.on('mouseover', function(e) { layer.openPopup && layer.openPopup(); });
                    }
                } else if (feature._searchType === 'lakes') {
                    popup = `<b>${feature.properties.NAME}</b>`;
                    layer.on('click', function () { highlightFeature(feature); });
                    if (typeof window.createLakeTooltip === 'function') {
                        window.createLakeTooltip(feature, layer);
                    }
                } else if (feature._searchType === 'great_lakes') {
                    popup = `<b>${feature.properties.NAMEEN}</b>`;
                    layer.on('click', function () {
                        highlightFeature(feature);
                        window.showGreatLakeInfo(feature);
                    });
                    if (typeof window.createGreatLakeTooltip === 'function') {
                        window.createGreatLakeTooltip(feature, layer);
                    }
                } else if (feature._searchType === 'rivers') {
                    popup = `<b>${feature.properties.NAME}</b>`;
                    layer.on('click', function () { highlightFeature(feature); });
                    if (typeof window.createRiverTooltip === 'function') {
                        window.createRiverTooltip(feature, layer);
                    }
                }
                if (feature._searchType === 'boreal_zones') {
                    layer.on('click', function () {
                        highlightFeature(feature);
                        window.showBorealZoneInfo(feature);
                    });
                    if (typeof window.createBorealTooltip === 'function') {
                        window.createBorealTooltip(feature, layer);
                    }
                    return;
                }
                layer.bindPopup(popup);
                // Ensure non-clickable types also highlight on click
                layer.on('click', function () { highlightFeature(feature); });
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
