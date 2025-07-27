// Leaflet-Map initialisieren ######################################################################
// Hintergrundkarten 
const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});

// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: [56.1304, -106.3468],
  zoom: 4,
  layers: [cartoLight], // Standardlayer
  fullscreenControl: false, // Vollbild-Button entfernen
  zoomControl: false, // Zoom-Buttons entfernen
});

// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);
