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
				if (clearBtn) clearBtn.style.display = 'none';
				return;
			}
			searchBoardingSchools(query, searchInput);
			if (clearBtn) clearBtn.style.display = 'inline-flex';
		}
	});

	// Sofort löschen beim Leeren
	searchInput.addEventListener('input', function (e) {
		if (e.target.value.trim().length === 0) {
			searchInput.style.backgroundColor = '';
			removeBoardingSchoolsSearchLayer();
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
