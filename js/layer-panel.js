// Panels gegenseitig schließen
// Diese Logik sorgt dafür, dass immer nur ein Panel offen ist

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtnWrapper = document.getElementById('toggle-layer-panel-wrapper');
  const layerPanel = document.getElementById('topography-panel');
  const educationPanel = document.getElementById('education-panel');
  const toggleTopoBtn = document.getElementById('toggle-topography-panel');
  const toggleEduBtn = document.getElementById('toggle-education-panel');

  // Topography Panel
  if (toggleTopoBtn && toggleBtnWrapper && layerPanel && educationPanel) {
    toggleTopoBtn.addEventListener('click', function() {
      const panelOpen = !layerPanel.classList.contains('open');
      if (panelOpen) {
        layerPanel.classList.add('open');
        educationPanel.classList.remove('open');
        toggleBtnWrapper.style.left = (layerPanel.offsetWidth + 18) + 'px';
      } else {
        layerPanel.classList.remove('open');
        toggleBtnWrapper.style.left = '18px';
      }
      setTimeout(() => {
        if (typeof map !== 'undefined' && map.invalidateSize) map.invalidateSize();
      }, 350);
    });
    // Panel schließen auch über X-Button
    const closeBtn = document.getElementById('close-topography-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        layerPanel.classList.remove('open');
        toggleBtnWrapper.style.left = '18px';
        setTimeout(() => {
          if (typeof map !== 'undefined' && map.invalidateSize) map.invalidateSize();
        }, 350);
      });
    }
  }

  // Education Panel
  if (toggleEduBtn && toggleBtnWrapper && educationPanel && layerPanel) {
    toggleEduBtn.addEventListener('click', function() {
      const panelOpen = !educationPanel.classList.contains('open');
      if (panelOpen) {
        educationPanel.classList.add('open');
        layerPanel.classList.remove('open');
        toggleBtnWrapper.style.left = (educationPanel.offsetWidth + 18) + 'px';
      } else {
        educationPanel.classList.remove('open');
        toggleBtnWrapper.style.left = '18px';
      }
      setTimeout(() => {
        if (typeof map !== 'undefined' && map.invalidateSize) map.invalidateSize();
      }, 350);
    });
    // Panel schließen auch über X-Button
    const closeBtn = document.getElementById('close-education-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        educationPanel.classList.remove('open');
        toggleBtnWrapper.style.left = '18px';
        setTimeout(() => {
          if (typeof map !== 'undefined' && map.invalidateSize) map.invalidateSize();
        }, 350);
      });
    }
  }
});
