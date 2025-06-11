function toggleLayer(layerId, checkbox) {
    if (!window.map || typeof window.map.getLayer !== 'function') {
      console.warn(`El mapa no está listo o la capa ${layerId} no existe.`);
      if (checkbox) checkbox.checked = false;
      return;
    }
  
    const visibility = window.map.getLayoutProperty(layerId, 'visibility');
    const newVisibility = visibility === 'visible' ? 'none' : 'visible';
    window.map.setLayoutProperty(layerId, 'visibility', newVisibility);
  
    if (checkbox) {
      checkbox.checked = newVisibility === 'visible';
      const slider = checkbox.nextElementSibling;
      if (slider) {
        slider.classList.toggle('active', newVisibility === 'visible');
      }
    }
  }
  
  function initializeLayerControls() {
    if (!window.map) return;
  
    const layers = ['calles', 'escuelas', 'parques', 'homicidios', 'municipio-bordes'];
    layers.forEach(layerId => {
      const checkbox = document.querySelector(`input[onchange*="${layerId}"]`);
      if (checkbox && window.map.getLayer(layerId)) {
        const isVisible = window.map.getLayoutProperty(layerId, 'visibility') === 'visible';
        checkbox.checked = isVisible;
        const slider = checkbox.nextElementSibling;
        if (slider) {
          slider.classList.toggle('active', isVisible);
        }
      }
    });
  }
  
  window.toggleLayer = toggleLayer;
  window.initializeLayerControls = initializeLayerControls;
 
// Hacer funciones disponibles globalmente
window.toggleLayer = toggleLayer;
window.initializeLayerControls = initializeLayerControls;

// Inicialización automática
if (window.map && window.map.isStyleLoaded()) {
    initializeLayerControls();
} else {
    window.addEventListener('map-loaded', initializeLayerControls);
}