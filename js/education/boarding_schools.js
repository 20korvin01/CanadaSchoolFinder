// Boarding Schools Layer Management
let boardingSchoolsLayer = null;

// Hilfsfunktion: Marker-Stil für Internate
function getBoardingSchoolStyle() {
	return {
		radius: 15,
		fillColor: '#1766cd',
		color: '#0d3c7b',
		weight: 1,
		opacity: 1,
		fillOpacity: 0.85
	};
}

// Info-Panel schließen
function closeInfoPanel() {
	const infoPanel = document.getElementById('info-panel');
	if (infoPanel) {
		infoPanel.classList.remove('open');
		const content = infoPanel.querySelector('.panel-content');
		if (content) content.innerHTML = '';
	}
}
window.closeInfoPanel = closeInfoPanel;

// Boarding School-Infos anzeigen
function showBoardingSchoolInfo(properties) {
	const infoPanel = document.getElementById('info-panel');
	if (!infoPanel) return;
	infoPanel.classList.add('open');

	const title = document.getElementById('feature-title');
	const details = document.getElementById('feature-details');
	const imageContainer = document.getElementById('feature-image');

	// Titel setzen
	if (title) title.textContent = properties.school || '';

	// Galerie: img_urls aus GeoJSON
	const remoteUrls = Array.isArray(properties.img_urls) ? properties.img_urls : null;
	if (imageContainer) {
			if (remoteUrls && remoteUrls.length > 0) {
					const tryImages = typeof window.sampleRandom === 'function' ? sampleRandom(remoteUrls, 10) : remoteUrls.slice(0, 10);
					imageContainer.innerHTML = `
						<div class="image-gallery">
							<div class="gallery-main" style="position:relative; display:flex;align-items:center;justify-content:center;min-height:260px;">
								<div style="text-align:center;color:#666;">
									<svg width="64" height="64" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<circle cx="25" cy="25" r="20" stroke="#1766cd" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4">
											<animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
										</circle>
									</svg>
									<div style="margin-top:8px;font-size:0.95em;">Bilder werden geladen...</div>
								</div>
							</div>
						</div>`;
					if (typeof window.preloadImages === 'function') {
							preloadImages(tryImages).then(loaded => {
									const loadedImages = Array.isArray(loaded) ? loaded.filter(Boolean) : [];
									if (!loadedImages || loadedImages.length === 0) {
											imageContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#666;"><i class="bi bi-image" style="font-size:2em;margin-bottom:8px;"></i><div>Keine Bilder verfügbar</div></div>`;
									} else {
											// Immer 10 Bilder, ggf. zyklisch auffüllen
											const imagesToUse = [];
											let i = 0;
											while (imagesToUse.length < 10) {
													imagesToUse.push(loadedImages[i % loadedImages.length]);
													i++;
											}
											imageContainer.innerHTML = typeof window.createImageGallery === 'function' ? createImageGallery(imagesToUse) : '';
											if (typeof window.addGalleryEventListeners === 'function') setTimeout(() => { addGalleryEventListeners(); }, 100);
									}
							}).catch(() => {
									imageContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#666;"><i class="bi bi-image" style="font-size:2em;margin-bottom:8px;"></i><div>Keine Bilder verfügbar</div></div>`;
							});
					}
			} else {
					imageContainer.innerHTML = '';
			}
	}

	// Info-Boxen im Stil der anderen Panels
	let infoBlock = '';
	if (properties.highlights) {
		infoBlock += `<div class="feature-teaser"><i class='bi bi-star-fill' style='color:#1766cd; margin-right:6px;'></i> <span>${properties.highlights}</span></div>`;
	}
	if (properties.location_info) {
		infoBlock += `<div class="feature-teaser"><i class='bi bi-geo-alt-fill' style='color:#1766cd; margin-right:6px;'></i> <span>${properties.location_info}</span></div>`;
	}
	if (properties.short_info) {
		infoBlock += `<div class="feature-teaser"><i class='bi bi-info-circle-fill' style='color:#1766cd; margin-right:6px;'></i> <span>${properties.short_info}</span></div>`;
	}

	// Strukturierte Details mit Icons, alle relevanten Felder
	let detailsHtml = `
		<h4>${properties.school || ''}</h4>
		${infoBlock}
		<div class="city-popup-weather" style="margin-bottom:1em; margin-top:0.5em; padding:0.7em 1em; background:#f5f7fa; border-radius:8px; color:#333; font-size:0.98em; line-height:1.5; display:flex; flex-direction:column; gap:6px;">
			<span><i class='bi bi-geo-alt-fill' style='color:#1766cd; margin-right:6px;'></i> <strong>Ort:</strong> ${properties.city || '-'}, ${properties.province || '-'}</span>
			<span><i class='bi bi-people-fill' style='color:#1766cd; margin-right:6px;'></i> <strong>Schülerzahl:</strong> ${properties.n_enrolment || '-'}</span>
			<span><i class='bi bi-person-bounding-box' style='color:#1766cd; margin-right:6px;'></i> <strong>Boarder:</strong> ${properties.n_boarders || '-'}</span>
			<span><i class='bi bi-list-ol' style='color:#1766cd; margin-right:6px;'></i> <strong>Klassen:</strong> ${properties.grades || '-'}</span>
			<span><i class='bi bi-cash-coin' style='color:#1766cd; margin-right:6px;'></i> <strong>Gebühren:</strong> ${properties.fees || '-'}</span>
			<span><i class='bi bi-airplane-fill' style='color:#1766cd; margin-right:6px;'></i> <strong>Nächster Flughafen:</strong> ${properties.airport || '-'}</span>
			${properties.target_group ? `<span><i class='bi bi-person-check-fill' style='color:#1766cd; margin-right:6px;'></i> <strong>Zielgruppe:</strong> ${properties.target_group}</span>` : ''}
			${properties.diploma ? `<span><i class='bi bi-award-fill' style='color:#1766cd; margin-right:6px;'></i> <strong>Abschlüsse:</strong> ${properties.diploma}</span>` : ''}
			${properties.gender ? `<span><i class='bi bi-gender-ambiguous' style='color:#1766cd; margin-right:6px;'></i> <strong>Geschlecht:</strong> ${properties.gender}</span>` : ''}
			${properties.size ? `<span><i class='bi bi-arrows-fullscreen' style='color:#1766cd; margin-right:6px;'></i> <strong>Campusgröße:</strong> ${properties.size}</span>` : ''}
			${properties.duration ? `<span><i class='bi bi-calendar-event-fill' style='color:#1766cd; margin-right:6px;'></i> <strong>Dauer:</strong> ${properties.duration}</span>` : ''}
			${properties.class_size ? `<span><i class='bi bi-people' style='color:#1766cd; margin-right:6px;'></i> <strong>Klassengröße:</strong> ${properties.class_size}</span>` : ''}
			${properties.n_nationalities ? `<span><i class='bi bi-globe2' style='color:#1766cd; margin-right:6px;'></i> <strong>Nationalitäten:</strong> ${properties.n_nationalities}</span>` : ''}
			${properties.extra_curricular ? `<span><i class='bi bi-basket2-fill' style='color:#1766cd; margin-right:6px;'></i> <strong>AGs:</strong> ${properties.extra_curricular}</span>` : ''}
			${properties.website ? `<span><i class='bi bi-globe' style='color:#1766cd; margin-right:6px;'></i> <a href='${properties.website.startsWith('http') ? properties.website : 'https://' + properties.website}' target='_blank' style='color:#1766cd;text-decoration:underline;'>Website</a></span>` : ''}
		</div>
	`;
	if (details) details.innerHTML = detailsHtml;
}
window.showBoardingSchoolInfo = showBoardingSchoolInfo;

// Boarding Schools Layer laden und zur Karte hinzufügen
function addBoardingSchoolsLayer() {
	if (boardingSchoolsLayer) {
		map.addLayer(boardingSchoolsLayer);
		return;
	}
	fetch('data/education/boarding_schools.geojson')
		.then(response => response.json())
		.then(data => {
			boardingSchoolsLayer = L.geoJSON(data, {
				pointToLayer: function(feature, latlng) {
					return L.circleMarker(latlng, getBoardingSchoolStyle());
				},
				onEachFeature: function(feature, layer) {
					// Popup mit Schulname immer mittig auf dem Marker anzeigen
					const name = feature.properties.school || 'Unbekanntes Internat';
					layer.bindPopup(`<b>${name}</b>`);
					layer.on('click', function() {
						// Provinz-Highlight entfernen (wie bei Städten)
						if (typeof clearHighlight === 'function') {
							clearHighlight();
						}
						// Great Lake Highlight entfernen
						if (typeof window.clearGreatLakeHighlight === 'function') {
							window.clearGreatLakeHighlight();
						}
						// Boreal-Zonen-Highlight entfernen
						if (window.currentBorealHighlight && typeof window.getBorealZoneStyle === 'function') {
							try {
								window.currentBorealHighlight.setStyle(getBorealZoneStyle(window.currentBorealHighlight.feature));
							} catch (e) {}
							window.currentBorealHighlight = null;
						}
						showBoardingSchoolInfo(feature.properties);
						// Popup nach Öffnen des Info-Panels erneut anzeigen
						setTimeout(() => { try { layer.openPopup(layer.getLatLng()); } catch (e) {} }, 30);
					});
					// Tooltip für Boarding Schools
					if (typeof window.createBoardingSchoolTooltip === 'function') {
						window.createBoardingSchoolTooltip(feature, layer);
					}
				}
			});
			map.addLayer(boardingSchoolsLayer);
		});
}

function removeBoardingSchoolsLayer() {
	if (boardingSchoolsLayer) {
		map.removeLayer(boardingSchoolsLayer);
	}
}

// Education Panel: Nur eine Checkbox 'Internate'
document.addEventListener('DOMContentLoaded', function() {
	const panelContent = document.querySelector('#education-panel .panel-content');
	if (!panelContent) return;
	panelContent.innerHTML = '';

	// Suchfeld ganz oben einfügen (analog zum Topografie-Panel)
	const searchItem = document.createElement('div');
	searchItem.className = 'layer-item';
	searchItem.style.marginBottom = '12px';
	const searchWrapper = document.createElement('div');
	searchWrapper.className = 'search-input-wrapper';
	searchWrapper.style.position = 'relative';
	const searchInput = document.createElement('input');
	searchInput.type = 'text';
	searchInput.id = 'search-boarding-schools';
	searchInput.placeholder = 'Internat suchen...';
	searchInput.style.width = '100%';
	searchInput.style.padding = '6px 28px 6px 6px';
	searchInput.style.borderRadius = '4px';
	searchInput.style.border = '1px solid #ccc';
	const clearBtn = document.createElement('button');
	clearBtn.type = 'button';
	clearBtn.id = 'search-boarding-clear-btn';
	clearBtn.className = 'search-clear-btn';
	clearBtn.setAttribute('aria-label', 'Suche löschen');
	clearBtn.setAttribute('title', 'Eingabe löschen');
	clearBtn.style.display = 'none';
	clearBtn.style.position = 'absolute';
	clearBtn.style.right = '4px';
	clearBtn.style.top = '50%';
	clearBtn.style.transform = 'translateY(-50%)';
	clearBtn.innerHTML = '<i class="bi bi-x"></i>';
	searchWrapper.appendChild(searchInput);
	searchWrapper.appendChild(clearBtn);
	searchItem.appendChild(searchWrapper);
	panelContent.appendChild(searchItem);

	// Checkbox für Internate
	const layerItem = document.createElement('div');
	layerItem.className = 'layer-item';
	const label = document.createElement('label');
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = false; // Standardmäßig AUS
	checkbox.id = 'boardingSchoolsCheckbox';
	label.appendChild(checkbox);
	label.appendChild(document.createTextNode(' Internate'));
	layerItem.appendChild(label);
	panelContent.appendChild(layerItem);

	// Checkbox steuert Layer
	checkbox.addEventListener('change', function() {
		if (this.checked) {
			addBoardingSchoolsLayer();
		} else {
			removeBoardingSchoolsLayer();
		}
	});
});

// Tooltip für Boarding Schools
function createBoardingSchoolTooltip(feature, layer) {
	let tooltipDiv;
	const name = feature.properties.school || 'Unbekanntes Internat';
	layer.on('mouseover', function() {
		if (!tooltipDiv) {
			tooltipDiv = document.createElement('div');
			tooltipDiv.className = 'boarding-school-tooltip';
			tooltipDiv.innerHTML = `<i class='bi bi-house-door-fill' style='margin-right:7px;'></i>${name}`;
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
window.createBoardingSchoolTooltip = createBoardingSchoolTooltip;
