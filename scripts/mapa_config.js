window.map = new maplibregl.Map({
  container: 'map',
  style: 'https://www.mapabase.atdt.gob.mx/style_white.json',
  center: [-102.5528, 23.6345], 
  zoom: 4.2
});

window.loadedImages = {
  escuela: false,
  parque: false
};

// Variable para controlar el popup actual
window.currentPopup = null;

map.on('load', () => {
  // 1. Capa de calles
  map.addSource('calles', {
    type: 'geojson',
    data: 'data/calles.geojson'
  });
  
  map.addLayer({
    id: 'calles',
    type: 'line',
    source: 'calles',
    paint: {
      'line-color': ['match', ['get', 'colores'],
        '#207BF5', '#207BF5',
        '#77B2DB', '#77B2DB',
        '#F7ECFA', '#F7ECFA',
        '#F58F7A', '#F58F7A',
        '#F5011E', '#F5011E',
        '#B0B0B0', '#B0B0B0',
        '#000000'
      ],
      'line-width': 3,
      'line-opacity': 0.2
    },
    layout: {
      visibility: 'visible'
    }
  });

  // 5. Capa de AGEBs
  map.addSource('municipio', {
    type: 'geojson',
    data: 'data/municip.geojson',
    promoteId: 'CVEGEO' // Usar CVEGEO como ID único
  });
  
  map.addLayer({
    id: 'municipio-bordes',
    type: 'line',
    source: 'municipio',
    paint: {
      'line-color': '#5D5D5D',
      'line-width': 1,
      'line-opacity': 0.8
    },
    layout: {
      visibility: 'none'
    }
  });

  // 2. Capa de escuelas (PNG)
  map.loadImage('imagenes/school1.png', (error, image) => {
    if (error) {
      console.error('Error cargando escuela:', error);
      return;
    }

    if (!map.hasImage('school1')) {
      map.addImage('school1', image);
    }
    window.loadedImages.escuela = true;
    
    map.addSource('escuelas', {
      type: 'geojson',
      data: 'data/escuelas.geojson'
    });
    
    map.addLayer({
      id: 'escuelas',
      type: 'symbol',
      source: 'escuelas',
      layout: {
        'icon-image': 'school1',
        'icon-size': 0.2,
        'visibility': 'none'
      }
    });
  });

  // 3. Capa de parques (PNG)
  map.loadImage('imagenes/tree-fill.png', (error, image) => {
    if (error) {
      console.error('Error cargando parque:', error);
      return;
    }

    map.addImage('parque', image);
    window.loadedImages.parque = true;
    
    map.addSource('parques', {
      type: 'geojson',
      data: 'data/parques.geojson'
    });
    
    map.addLayer({
      id: 'parques',
      type: 'symbol',
      source: 'parques',
      layout: {
        'icon-image': 'parque',
        'icon-size': 0.2,
        'visibility': 'none'
      }
    });
  });

  // 4. Capa de homicidios
  map.addSource('homicidios', {
    type: 'geojson',
    data: 'data/homicidios.geojson'
  });
  
  map.addLayer({
    id: 'homicidios',
    type: 'circle',
    source: 'homicidios',
    paint: {
      'circle-color': '#F9EFA5',
      'circle-radius': 6,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 0.5
    },
    layout: {
      visibility: 'none'
    }
  });

  // Función para detectar AGEBs
  const getClosestAGEB = (lngLat) => {
    const features = map.querySourceFeatures('agebs');
    let closest = null;
    let minDistance = Infinity;

    features.forEach(feature => {
      const center = turf.centerOfMass(feature.geometry);
      const distance = turf.distance(
        turf.point([lngLat.lng, lngLat.lat]),
        center
      );
      
      if (distance < minDistance && distance < 0.3) { // 300m de tolerancia
        minDistance = distance;
        closest = feature;
      }
    });
    return closest;
  };

  // Interacción con AGEBs - Versión corregida con popup minimalista
  map.on('click', (e) => {
    if (window.currentPopup) {
      window.currentPopup.remove();
    }

    const clicked = map.queryRenderedFeatures(e.point, {
      layers: ['municipio-bordes']
    })[0];
    
    const feature = clicked || getClosestAGEB(e.lngLat);
    
    if (feature) {
      // Crear contenedor del popup
      const popupContainer = document.createElement('div');
      popupContainer.className = 'popup-visible-container';
      
      // Crear botón de cierre MUY visible
      const closeButton = document.createElement('button');
      closeButton.className = 'visible-close-btn';
      closeButton.innerHTML = '×'; // Esto hace una X grande
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 50%;
        font-size: 18px;
        line-height: 24px;
        text-align: center;
        cursor: pointer;
        z-index: 1000;
      `;
      
      // Crear contenido
      const content = document.createElement('div');
      content.className = 'popup-visible-content';
      content.innerHTML = `
        <h4>${feature.properties.NOM_LOC || 'AGEB'}</h4>
        <p><strong>Código:</strong> ${feature.properties.cve_ageb}</p>
        <p><strong>Municipio:</strong> ${feature.properties.NOM_MUN}</p>
        <p><strong>Homicidios:</strong> ${feature.properties.homicidios || '0'}</p>
      `;
      content.style.padding = '20px';
      content.style.paddingTop = '40px'; // Espacio para el botón
      
      // Ensamblar
      popupContainer.appendChild(closeButton);
      popupContainer.appendChild(content);
      
      // Crear popup
      const popup = new maplibregl.Popup({
        closeButton: false,
        className: 'visible-popup',
        maxWidth: '300px'
      })
      .setLngLat(e.lngLat)
      .setDOMContent(popupContainer)
      .addTo(map);
      
      window.currentPopup = popup;
      
      // Evento para cerrar
      closeButton.addEventListener('click', () => {
        popup.remove();
        window.currentPopup = null;
      });
    }
  });

  // Cambiar cursor al pasar sobre AGEBs
  map.on('mouseenter', 'agebs-bordes', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'agebs-bordes', () => {
    map.getCanvas().style.cursor = '';
  });

  // Inicializar controles UI
  if (window.initializeLayerControls) {
    setTimeout(() => initializeLayerControls(), 500);
  }
});

let municipiosGeoJSON = null;

fetch('data/municip.geojson')
  .then(res => res.json())
  .then(data => {
    municipiosGeoJSON = data;
    llenarSelectorEstados(data);
  });

function llenarSelectorEstados(geojson) {
  const estados = new Set();
  geojson.features.forEach(f => estados.add(f.properties.NOM_ENT));

  const selectorEstado = document.getElementById('selector-estado');
  selectorEstado.innerHTML = '<option value="">-- Estado --</option>';

  [...estados].sort().forEach(e => {
    const option = document.createElement('option');
    option.value = e;
    option.textContent = e;
    selectorEstado.appendChild(option);
  });
}

document.getElementById('selector-estado').addEventListener('change', function () {
  const estado = this.value;

  if (estado === "") {
    //Vista nacional
    map.flyTo({
      center: [-102.5528, 23.6345],
      zoom: 4.2,
      speed: 1.2
    });
    return;
  }

  if (!municipiosGeoJSON) return; 

  const estadoFeatures = municipiosGeoJSON.features.filter(f =>
    f.properties.NOM_ENT === estado
  );

  if (estadoFeatures.length > 0) {
    //Vista del estado seleccionado
    const union = turf.union(...estadoFeatures.map(f => f.geometry));
    const bbox = turf.bbox(union);
    map.fitBounds(bbox, { padding: 40 });
  }
});

// Manejo de errores globales
map.on('error', (e) => {
  console.error('Map error:', e.error);
});