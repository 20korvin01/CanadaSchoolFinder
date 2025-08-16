// Education Panel: Logik für Schulen und Internate

document.addEventListener('DOMContentLoaded', function() {
  // Panel öffnen/schließen
  const educationPanel = document.getElementById('education-panel');
  const openBtn = document.getElementById('toggle-education-panel-btn');
  const closeBtn = document.getElementById('close-education-panel');

  if (openBtn && educationPanel) {
    openBtn.addEventListener('click', function() {
      educationPanel.style.display = educationPanel.style.display === 'none' ? 'block' : 'none';
    });
  }
  if (closeBtn && educationPanel) {
    closeBtn.addEventListener('click', function() {
      educationPanel.style.display = 'none';
    });
  }

  // Checkbox-Logik (Platzhalter)
  document.getElementById('schoolsCheckbox')?.addEventListener('change', function() {
    // TODO: Schulen Layer anzeigen/verstecken
  });
  document.getElementById('internateCheckbox')?.addEventListener('change', function() {
    // TODO: Internate Layer anzeigen/verstecken
  });
});
