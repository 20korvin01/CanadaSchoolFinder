// Info Panel Management ##########################################################################
const infoPanel = document.getElementById('info-panel');
const closeInfoBtn = document.getElementById('close-info-panel');

// Info Panel schließen
closeInfoBtn.addEventListener('click', function() {
  infoPanel.classList.remove('open');
  // Entfernt: mapContainer.classList.remove('info-open');
  
  // Highlighting des aktuellen Features entfernen
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
});