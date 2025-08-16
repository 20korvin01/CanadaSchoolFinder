// Toggle-Button wandert mit Layer-Panel
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtnWrapper = document.getElementById('toggle-layer-panel-wrapper');
  const layerPanel = document.getElementById('layer-panel');
  const toggleBtn = document.getElementById('toggle-layer-panel');
  let panelOpen = false;
  if (toggleBtn && toggleBtnWrapper && layerPanel) {
    toggleBtn.addEventListener('click', function() {
      panelOpen = !layerPanel.classList.contains('open');
      if (panelOpen) {
        layerPanel.classList.add('open');
        toggleBtnWrapper.style.left = (layerPanel.offsetWidth + 18) + 'px';
      } else {
        layerPanel.classList.remove('open');
        toggleBtnWrapper.style.left = '18px';
      }
      setTimeout(() => map.invalidateSize(), 350);
    });
    // Panel schließen auch über X-Button
    const closeBtn = document.getElementById('close-layer-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        layerPanel.classList.remove('open');
        toggleBtnWrapper.style.left = '18px';
        setTimeout(() => map.invalidateSize(), 350);
      });
    }
  }
});
// Remaining logic for panel and button functionality