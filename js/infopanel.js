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
  "Alberta": [
    './img/alberta/alberta1.jpeg',
    './img/alberta/alberta2.jpeg',
    './img/alberta/alberta3.jpg',
    './img/alberta/alberta4.jpg',
    './img/alberta/alberta5.jpg',
    './img/alberta/alberta6.jpeg',
    './img/alberta/alberta7.jpeg',
    './img/alberta/alberta8.jpg',
    './img/alberta/alberta9.jpg',
    './img/alberta/alberta10.jpeg'
  ],
  "Manitoba": [
    './img/manitoba/manitoba1.jpeg',
    './img/manitoba/manitoba2.jpg',
    './img/manitoba/manitoba3.jpg',
    './img/manitoba/manitoba4.jpg',
    './img/manitoba/manitoba5.jpeg',
    './img/manitoba/manitoba6.jpeg',
    './img/manitoba/manitoba7.jpg',
    './img/manitoba/manitoba8.jpg',
    './img/manitoba/manitoba9.jpeg',
    './img/manitoba/manitoba10.jpeg'
  ],
  "Newfoundland and Labrador": [
    './img/newfoundland_labrador/newfoundland_labrador1.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador2.jpg',
    './img/newfoundland_labrador/newfoundland_labrador3.jpg',
    './img/newfoundland_labrador/newfoundland_labrador4.jpg',
    './img/newfoundland_labrador/newfoundland_labrador5.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador6.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador7.jpg',
    './img/newfoundland_labrador/newfoundland_labrador8.jpg',
    './img/newfoundland_labrador/newfoundland_labrador9.jpeg',
    './img/newfoundland_labrador/newfoundland_labrador10.jpeg'
  ],
  "New Brunswick": [
    './img/new_brunswick/new_brunswick1.jpeg',
    './img/new_brunswick/new_brunswick2.jpg',
    './img/new_brunswick/new_brunswick3.jpg',
    './img/new_brunswick/new_brunswick4.jpg',
    './img/new_brunswick/new_brunswick5.jpeg',
    './img/new_brunswick/new_brunswick6.jpg',
    './img/new_brunswick/new_brunswick7.jpg',
    './img/new_brunswick/new_brunswick8.jpg',
    './img/new_brunswick/new_brunswick9.jpg',
    './img/new_brunswick/new_brunswick10.jpg'
  ],
  "Nova Scotia": [
    './img/nova_scotia/nova_scotia1.jpeg',
    './img/nova_scotia/nova_scotia2.jpg',
    './img/nova_scotia/nova_scotia3.jpg',
    './img/nova_scotia/nova_scotia4.jpg',
    './img/nova_scotia/nova_scotia5.jpeg',
    './img/nova_scotia/nova_scotia6.jpeg',
    './img/nova_scotia/nova_scotia7.jpg',
    './img/nova_scotia/nova_scotia8.jpg',
    './img/nova_scotia/nova_scotia9.jpeg',
    './img/nova_scotia/nova_scotia10.jpg'
  ],
  "Ontario": [
    './img/ontario/ontario1.jpeg',
    './img/ontario/ontario2.jpg',
    './img/ontario/ontario3.jpg',
    './img/ontario/ontario4.jpg',
    './img/ontario/ontario5.jpeg',
    './img/ontario/ontario6.jpeg',
    './img/ontario/ontario7.jpg',
    './img/ontario/ontario8.jpg',
    './img/ontario/ontario9.jpeg',
    './img/ontario/ontario10.jpeg'
  ],
  "Prince Edward Island": [
    './img/prince_edward_island/prince_edward_island1.jpeg',
    './img/prince_edward_island/prince_edward_island2.jpg',
    './img/prince_edward_island/prince_edward_island3.jpg',
    './img/prince_edward_island/prince_edward_island4.jpg',
    './img/prince_edward_island/prince_edward_island5.jpeg',
    './img/prince_edward_island/prince_edward_island6.jpeg',
    './img/prince_edward_island/prince_edward_island7.jpg',
    './img/prince_edward_island/prince_edward_island8.jpg',
    './img/prince_edward_island/prince_edward_island9.jpeg',
    './img/prince_edward_island/prince_edward_island10.jpeg'
  ],
  "Quebec": [
    './img/quebec/quebec1.jpeg',
    './img/quebec/quebec2.jpg',
    './img/quebec/quebec3.jpg',
    './img/quebec/quebec4.jpg',
    './img/quebec/quebec5.jpeg',
    './img/quebec/quebec6.jpeg',
    './img/quebec/quebec7.jpg',
    './img/quebec/quebec8.jpg',
    './img/quebec/quebec9.jpg',
    './img/quebec/quebec10.jpg'
  ],
  "Saskatchewan": [
    './img/saskatchewan/saskatchewan1.jpeg',
    './img/saskatchewan/saskatchewan2.jpg',
    './img/saskatchewan/saskatchewan3.jpg',
    './img/saskatchewan/saskatchewan4.jpg',
    './img/saskatchewan/saskatchewan5.jpg',
    './img/saskatchewan/saskatchewan6.jpg',
    './img/saskatchewan/saskatchewan7.jpg',
    './img/saskatchewan/saskatchewan8.jpg',
    './img/saskatchewan/saskatchewan9.jpg',
    './img/saskatchewan/saskatchewan10.jpg'
  ],
  "British Columbia": [
    './img/british_columbia/bc1.jpeg',
    './img/british_columbia/bc2.jpg',
    './img/british_columbia/bc3.jpg',
    './img/british_columbia/bc4.jpg',
    './img/british_columbia/bc5.jpeg',
    './img/british_columbia/bc6.jpeg',
    './img/british_columbia/bc7.jpg',
    './img/british_columbia/bc8.jpg',
    './img/british_columbia/bc9.jpeg',
    './img/british_columbia/bc10.jpeg'
  ],
  "Nunavut": [
    './img/nunavut/nunavut1.jpeg',
    './img/nunavut/nunavut2.jpg',
    './img/nunavut/nunavut3.png',
    './img/nunavut/nunavut4.jpg',
    './img/nunavut/nunavut5.jpeg',
    './img/nunavut/nunavut6.jpeg',
    './img/nunavut/nunavut7.jpg',
    './img/nunavut/nunavut8.png',
    './img/nunavut/nunavut9.jpeg',
    './img/nunavut/nunavut10.jpg'
  ],
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
  ],
  'Northwest Territories': [
    './img/northwest_territories/nwt1.jpeg',
    './img/northwest_territories/nwt2.png',
    './img/northwest_territories/nwt3.jpg',
    './img/northwest_territories/nwt4.jpg',
    './img/northwest_territories/nwt5.jpg',
    './img/northwest_territories/nwt6.jpg',
    './img/northwest_territories/nwt7.jpg',
    './img/northwest_territories/nwt8.jpg',
    './img/northwest_territories/nwt9.jpg',
    './img/northwest_territories/nwt10.jpg'
  ],
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