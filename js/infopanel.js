// Info Panel Management ##########################################################################
const infoPanel = document.getElementById('info-panel');
const closeInfoBtn = document.getElementById('close-info-panel');

// Info Panel schließen
closeInfoBtn.addEventListener('click', function() {
  infoPanel.classList.remove('open');
  mapContainer.classList.remove('info-open');
  setTimeout(() => map.invalidateSize(), 300);
});

// Bildergalerie Daten für Provinzen
const provinceImages = {
  'Yukon': [
    './img/yukon/yukon9.jpg',
    './img/yukon/yukon1.jpg',
    './img/yukon/yukon2.jpg',
    './img/yukon/yukon3.jpg',
    './img/yukon/yukon4.jpg',
    './img/yukon/yukon5.jpg',
    './img/yukon/yukon6.jpg',
    './img/yukon/yukon7.jpg',
    './img/yukon/yukon10.jpg',
    './img/yukon/yukon8.jpg'
  ]
  // Weitere Provinzen können hier hinzugefügt werden
};

// Aktueller Galerie-Status
let currentImageIndex = 0;
let currentImages = [];
let autoPlayInterval = null;

// Bildergalerie erstellen
function createImageGallery(images) {
  if (!images || images.length === 0) {
    return `<div style="text-align: center; padding: 20px; color: #666;">
              <i class="bi bi-image" style="font-size: 3em; margin-bottom: 10px;"></i>
              <p>Keine Bilder verfügbar</p>
            </div>`;
  }

  currentImages = images;
  currentImageIndex = 0;

  return `
    <div class="image-gallery">
      <div class="gallery-main">
        <img id="gallery-main-img" src="${images[0]}" alt="Galerie Bild" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div style="display: none; text-align: center; padding: 50px; color: #666;">
          <i class="bi bi-exclamation-triangle" style="font-size: 2em;"></i>
          <p>Bild konnte nicht geladen werden</p>
        </div>
        
        <!-- Navigation Buttons -->
        <button id="prev-btn" class="gallery-btn">
          <i class="bi bi-chevron-left"></i>
        </button>
        <button id="next-btn" class="gallery-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
        
        <!-- Indikator Striche -->
        <div class="gallery-indicators">
          ${images.map((_, index) => 
            `<div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
          ).join('')}
        </div>
      </div>
    </div>
  `;
}

// Galerie Navigation (Endlos-Carousel)
function updateGalleryImage(index) {
  if (!currentImages || currentImages.length === 0) return;
  
  // Endlos-Navigation: Wrap around
  if (index >= currentImages.length) {
    index = 0;
  } else if (index < 0) {
    index = currentImages.length - 1;
  }
  
  currentImageIndex = index;
  const mainImg = document.getElementById('gallery-main-img');
  const indicators = document.querySelectorAll('.indicator');
  
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = currentImages[index];
      mainImg.style.opacity = '1';
    }, 150);
  }
  
  // Indikator Aktivierung
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
  });
}

// Event Listeners für Galerie
function addGalleryEventListeners() {
  // Vorheriges Bild (Endlos)
  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateGalleryImage(currentImageIndex - 1);
    });
  }
  
  // Nächstes Bild (Endlos)
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateGalleryImage(currentImageIndex + 1);
    });
  }
  
  // Indikator Klicks
  const indicators = document.querySelectorAll('.indicator');
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      updateGalleryImage(index);
    });
  });
  
  // Keyboard Navigation (Endlos)
  document.addEventListener('keydown', function(e) {
    if (infoPanel.classList.contains('open')) {
      if (e.key === 'ArrowLeft') {
        updateGalleryImage(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        updateGalleryImage(currentImageIndex + 1);
      }
    }
  });
}

// Feature Info anzeigen
function showFeatureInfo(feature) {
  const title = document.getElementById('feature-title');
  const details = document.getElementById('feature-details');
  const imageContainer = document.getElementById('feature-image');
  
  if (feature.properties) {
    const props = feature.properties;
    const provinceName = props.prov_name_en || 'Unbekannte Region';
    title.textContent = provinceName;
    
    // Debug: Provinzname in Console ausgeben
    console.log('Provinzname:', provinceName);
    console.log('Verfügbare Provinzen:', Object.keys(provinceImages));
    
    // Bilder für die Provinz laden
    const images = provinceImages[provinceName] || [];
    console.log('Gefundene Bilder:', images);
    
    // Bildergalerie erstellen
    imageContainer.innerHTML = createImageGallery(images);
    
    // Informationen anzeigen
    details.innerHTML = `
      <h4>${provinceName}</h4>
      ${props.prov_name_fr ? `<p><strong>Französischer Name:</strong> ${props.prov_name_fr}</p>` : ''}
      <p><strong>Typ:</strong> ${props.prov_type || 'Nicht verfügbar'}</p>
      <p><strong>Provinzcode:</strong> ${props.prov_code || 'Nicht verfügbar'}</p>
      <p><strong>Jahr:</strong> ${props.year || 'Nicht verfügbar'}</p>
      <p><strong>Externer Link:</strong> <a href="https://www.breidenbach-education.com/" target="_blank" rel="noopener noreferrer">https://www.breidenbach-education.com/</a></p>
      <p>Weitere Informationen über diese Region werden hier angezeigt...</p>
    `;
    
    // Event Listeners für Galerie hinzufügen
    setTimeout(() => {
      addGalleryEventListeners();
    }, 100);
  }
  
  // Info Panel öffnen
  infoPanel.classList.add('open');
  mapContainer.classList.add('info-open');
  setTimeout(() => map.invalidateSize(), 300);
}