// education-search.js
// Sucht durch die Boarding Schools und zeigt Treffer als Layer auf der Karte

document.addEventListener('DOMContentLoaded', function () {
	// Hilfsfunktion: Layer entfernen
	function removeBoardingSchoolsSearchLayer() {
		if (window.boardingSchoolsSearchLayer) {
			map.removeLayer(window.boardingSchoolsSearchLayer);
			window.boardingSchoolsSearchLayer = null;
		}
		if (window.boardingSchoolsHighlightLayer) {
			map.removeLayer(window.boardingSchoolsHighlightLayer);
			window.boardingSchoolsHighlightLayer = null;
		}
	}

	// Layer-Management analog zu topography-search.js
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
		// Boarding Schools Layer entfernen
		if (window.boardingSchoolsLayer) map.removeLayer(window.boardingSchoolsLayer);
		if (window.hostfamilySchoolsLayer) map.removeLayer(window.hostfamilySchoolsLayer);
	}

	function setAllMainLayersVisible(visible) {
		const provincesCheckbox = document.getElementById('provincesCheckbox');
		if (window.provincesLayer && provincesCheckbox) {
			if (visible && provincesCheckbox.checked) {
				map.addLayer(window.provincesLayer);
			} else {
				map.removeLayer(window.provincesLayer);
			}
		}
		const lakesCheckbox = document.getElementById('lakesCheckbox');
		if (window.lakesLayer && lakesCheckbox) {
			if (visible && lakesCheckbox.checked) {
				map.addLayer(window.lakesLayer);
			} else {
				map.removeLayer(window.lakesLayer);
			}
		}
		const greatLakesCheckbox = document.getElementById('greatLakesCheckbox');
		if (window.greatLakesLayer && greatLakesCheckbox) {
			if (visible && greatLakesCheckbox.checked) {
				map.addLayer(window.greatLakesLayer);
			} else {
				map.removeLayer(window.greatLakesLayer);
			}
		}
		const riversCheckbox = document.getElementById('riversCheckbox');
		if (window.riversLayer && riversCheckbox) {
			if (visible && riversCheckbox.checked) {
				map.addLayer(window.riversLayer);
			} else {
				map.removeLayer(window.riversLayer);
			}
		}
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
		// Boarding Schools Layer wieder anzeigen, falls vorhanden und Checkbox aktiv
		const boardingCheckbox = document.getElementById('boardingSchoolsCheckbox');
		if (window.boardingSchoolsLayer && boardingCheckbox) {
			if (visible && boardingCheckbox.checked) {
				map.addLayer(window.boardingSchoolsLayer);
			} else {
				map.removeLayer(window.boardingSchoolsLayer);
			}
		}
		const hostfamilyCheckbox = document.getElementById('hostfamilySchoolsCheckbox');
		if (window.hostfamilySchoolsLayer && hostfamilyCheckbox) {
			if (visible && hostfamilyCheckbox.checked) {
				map.addLayer(window.hostfamilySchoolsLayer);
			} else {
				map.removeLayer(window.hostfamilySchoolsLayer);
			}
		}
	}

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
			'citiesCat5',
			'boardingSchoolsCheckbox',
			'hostfamilySchoolsCheckbox'
		];
		return ids.map(id => document.getElementById(id)).filter(cb => cb);
	}

	// Status der Checkboxen zwischenspeichern
	let savedCheckboxStates = null;

	// Suchelement holen
	const searchInput = document.getElementById('search-boarding-schools');
	const clearBtn = document.getElementById('search-boarding-clear-btn');

	if (!searchInput) return;

	// Clear-Button Verhalten
	if (clearBtn) {
		clearBtn.addEventListener('click', function () {
			searchInput.value = '';
			searchInput.style.backgroundColor = '';
			removeBoardingSchoolsSearchLayer();
			// Checkboxen wiederherstellen und Layer synchronisieren
			if (savedCheckboxStates) {
				getAllLayerCheckboxes().forEach((cb, idx) => {
					cb.checked = savedCheckboxStates[idx];
					cb.dispatchEvent(new Event('change', { bubbles: true }));
				});
				setAllMainLayersVisible(true);
				savedCheckboxStates = null;
			} else {
				setAllMainLayersVisible(true);
			}
			clearBtn.style.display = 'none';
			try { searchInput.focus(); } catch (e) {}
		});
	}

	// Suche bei Enter-Taste
	searchInput.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') {
			const query = e.target.value.trim().toLowerCase();
			if (query.length === 0) {
				searchInput.style.backgroundColor = '';
				removeBoardingSchoolsSearchLayer();
				// Checkboxen wiederherstellen und Layer synchronisieren
				if (savedCheckboxStates) {
					getAllLayerCheckboxes().forEach((cb, idx) => {
						cb.checked = savedCheckboxStates[idx];
						cb.dispatchEvent(new Event('change', { bubbles: true }));
					});
					setAllMainLayersVisible(true);
					savedCheckboxStates = null;
				} else {
					setAllMainLayersVisible(true);
				}
				if (clearBtn) clearBtn.style.display = 'none';
				return;
			}
			// Checkboxen-Status speichern und alle deaktivieren
			if (!savedCheckboxStates) {
				savedCheckboxStates = getAllLayerCheckboxes().map(cb => cb.checked);
			}
			getAllLayerCheckboxes().forEach(cb => {
				cb.checked = false;
				cb.dispatchEvent(new Event('change', { bubbles: true }));
			});
			// Alle Layer entfernen, unabhängig vom Checkbox-Status
			removeAllMainLayers();
			searchBoardingSchools(query, searchInput);
			if (clearBtn) clearBtn.style.display = 'inline-flex';
		}
	});

	// Sofort löschen beim Leeren
	searchInput.addEventListener('input', function (e) {
		if (e.target.value.trim().length === 0) {
			searchInput.style.backgroundColor = '';
			removeBoardingSchoolsSearchLayer();
			// Checkboxen wiederherstellen und Layer synchronisieren
			if (savedCheckboxStates) {
				getAllLayerCheckboxes().forEach((cb, idx) => {
					cb.checked = savedCheckboxStates[idx];
					cb.dispatchEvent(new Event('change', { bubbles: true }));
				});
				setAllMainLayersVisible(true);
				savedCheckboxStates = null;
			} else {
				setAllMainLayersVisible(true);
			}
			if (clearBtn) clearBtn.style.display = 'none';
		} else {
			if (clearBtn) clearBtn.style.display = 'inline-flex';
		}
	});
});

// Die eigentliche Suchfunktion
function searchBoardingSchools(query, searchInput) {
	removeBoardingSchoolsSearchLayer();
	// GeoJSON laden (verwende window.boardingSchoolsGeojson, falls schon geladen)
	function showResults(data) {
		if (!data || !data.features) {
			searchInput.style.backgroundColor = '';
			return;
		}
		// Finde alle Features, deren irgendein Attribut das Suchwort enthält
		const matches = data.features.filter(f => {
			return Object.values(f.properties).some(val => val && String(val).toLowerCase().includes(query));
		});
		if (matches.length === 0) {
			searchInput.style.backgroundColor = '#ffcccc'; // rot
			return;
		}
		searchInput.style.backgroundColor = '#ccffcc'; // grün
		// Zeige Treffer als Layer auf der Karte
		window.boardingSchoolsSearchLayer = L.geoJSON({
			type: 'FeatureCollection',
			features: matches
		}, {
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, {
					radius: 13,
					fillColor: '#1766cd',
					color: '#0d3c7b',
					weight: 1,
					opacity: 1,
					fillOpacity: 0.85,
					pane: 'markerPane'
				});
			},
			onEachFeature: function (feature, layer) {
				const name = feature.properties.school || 'Unbekanntes Internat';
				layer.bindPopup(`<b>${name}</b>`);
				layer.on('click', function () {
					if (typeof window.showBoardingSchoolInfo === 'function') {
						window.showBoardingSchoolInfo(feature.properties);
					}
					setTimeout(() => { try { layer.openPopup(layer.getLatLng()); } catch (e) {} }, 30);
				});
				if (typeof window.createBoardingSchoolTooltip === 'function') {
					window.createBoardingSchoolTooltip(feature, layer);
				}
			}
		}).addTo(map);
		// Karte auf Treffer zoomen
		if (matches.length > 0) {
			const bounds = window.boardingSchoolsSearchLayer.getBounds();
			if (bounds.isValid()) {
				map.fitBounds(bounds, { maxZoom: 8 });
			}
		}
	}
	// GeoJSON laden, falls nicht vorhanden
	if (window.boardingSchoolsGeojson && window.boardingSchoolsGeojson.features) {
		showResults(window.boardingSchoolsGeojson);
	} else {
		fetch('data/education/boarding_schools.geojson')
			.then(response => response.json())
			.then(data => {
				window.boardingSchoolsGeojson = data;
				showResults(data);
			});
	}
}

// Hilfsfunktion zum Entfernen des Layers
function removeBoardingSchoolsSearchLayer() {
	if (window.boardingSchoolsSearchLayer) {
		map.removeLayer(window.boardingSchoolsSearchLayer);
		window.boardingSchoolsSearchLayer = null;
	}
	if (window.boardingSchoolsHighlightLayer) {
		map.removeLayer(window.boardingSchoolsHighlightLayer);
		window.boardingSchoolsHighlightLayer = null;
	}
}
