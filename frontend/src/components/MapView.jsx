import React, { useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getColor, getRadius } from '../utils/helpers';

// Clé API Mapbox - vous pouvez la configurer via une variable d'environnement
// Pour une utilisation gratuite, vous pouvez obtenir une clé sur https://account.mapbox.com/
// Créez un fichier .env dans le dossier frontend avec : VITE_MAPBOX_TOKEN=votre_cle_api
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Avertissement si pas de token configuré
if (!MAPBOX_TOKEN) {
  console.warn('⚠️ [MapView] Aucune clé API Mapbox configurée. La carte ne fonctionnera pas correctement.');
  console.warn('⚠️ [MapView] Veuillez créer un fichier .env avec VITE_MAPBOX_TOKEN=votre_cle_api');
  console.warn('⚠️ [MapView] Obtenez une clé gratuite sur https://account.mapbox.com/');
}

// Composant pour ajuster automatiquement la vue
function MapBounds({ cities, mapRef }) {
  useEffect(() => {
    if (!cities || cities.length === 0 || !mapRef?.current) return;
    
    const validCities = cities.filter(c => c && c.lat && c.lng && !isNaN(c.lat) && !isNaN(c.lng));
    if (validCities.length === 0) return;
    
    try {
      const map = mapRef.current.getMap();
      if (!map) return;
      
      // Créer des bounds à partir des villes
      const coordinates = validCities.map(city => [city.lng, city.lat]);
      if (coordinates.length === 0) return;
      
      const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
      coordinates.forEach(coord => bounds.extend(coord));
      
      if (bounds && !bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 }, // Plus de padding pour mieux voir
          maxZoom: 6.5, // Ne pas zoomer trop près, garder une vue du Maroc
          duration: 1500 // Animation plus lente pour une transition douce
        });
        console.log('🗺️ [MapView] Vue ajustée pour afficher tout le Maroc avec toutes les villes');
      }
    } catch (error) {
      console.error('❌ [MapView] Erreur lors de l\'ajustement de la vue:', error);
      // Fallback: centrer sur le Maroc
      if (mapRef?.current) {
        const map = mapRef.current.getMap();
        if (map) {
          map.flyTo({
            center: [-7.0926, 31.7917],
            zoom: 5.8,
            duration: 1500
          });
        }
      }
    }
  }, [cities, mapRef]);
  
  return null;
}

// Composant pour les cercles de ville
function CityCircles({ cities }) {
  // Créer les features GeoJSON pour les cercles
  const circleFeatures = useMemo(() => {
    if (!cities || !Array.isArray(cities)) return [];
    
    return cities
      .filter(city => city && city.lat !== undefined && city.lat !== null && 
                      city.lng !== undefined && city.lng !== null &&
                      !isNaN(city.lat) && !isNaN(city.lng))
      .map(city => {
        const baseRadius = getRadius(city.aqi || 0);
        const stationBonus = Math.min((city.activeStations || 0) * 30, 300);
        const finalRadius = baseRadius + stationBonus;
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [city.lng, city.lat]
          },
          properties: {
            id: city.name,
            name: city.name,
            aqi: city.aqi || 0,
            temp: city.temp || 0,
            humidity: city.humidity || 0,
            co2: city.co2 || 0,
            uv: city.uv || 0,
            light: city.light || 0,
            activeStations: city.activeStations || 0,
            stationCount: city.stationCount || 0,
            stations: city.stations || [],
            color: getColor(city.aqi || 0),
            radius: finalRadius
          }
        };
      });
  }, [cities]);

  const circleData = useMemo(() => ({
    type: 'FeatureCollection',
    features: circleFeatures
  }), [circleFeatures]);

  // Log pour debug
  useEffect(() => {
    console.log(`🎯 [CityCircles] ${circleFeatures.length} cercles créés`);
    circleFeatures.forEach(feature => {
      const props = feature.properties;
      console.log(`🎯 [CityCircle] ${props.name} - Rayon: ${Math.round(props.radius)}m, AQI: ${props.aqi}, Couleur: ${props.color}`);
    });
  }, [circleFeatures]);

  const layerStyle = useMemo(() => ({
    id: 'city-circles',
    type: 'circle',
    source: 'cities',
    paint: {
      // Rayon en pixels basé sur l'AQI (pas de conversion de mètres)
      // Le rayon dans les propriétés est en mètres (500-2000m), on le divise pour avoir des pixels
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5, ['/', ['get', 'radius'], 100],  // À zoom 5: rayon / 100 = 5-20 pixels
        6, ['/', ['get', 'radius'], 80],   // À zoom 6: rayon / 80 = 6-25 pixels
        8, ['/', ['get', 'radius'], 40],   // À zoom 8: rayon / 40 = 12-50 pixels
        10, ['/', ['get', 'radius'], 20],  // À zoom 10: rayon / 20 = 25-100 pixels
        12, ['/', ['get', 'radius'], 10]   // À zoom 12: rayon / 10 = 50-200 pixels
      ],
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.4,
      'circle-stroke-width': 3,
      'circle-stroke-color': ['get', 'color'],
      'circle-stroke-opacity': 1
    }
  }), []);

  // Style pour les labels de ville
  const labelStyle = useMemo(() => ({
    id: 'city-labels',
    type: 'symbol',
    source: 'cities',
    layout: {
      'text-field': [
        'format',
        ['get', 'name'],
        { 'font-scale': 1.1, 'text-font': ['literal', ['DIN Pro Bold', 'Arial Unicode MS Bold']] },
        '\n',
        {},
        '🫁 AQI: ',
        { 'font-scale': 0.9 },
        ['get', 'aqi'],
        { 'font-scale': 0.9 },
        '\n',
        {},
        '🌡️ ',
        { 'font-scale': 0.8 },
        ['get', 'temp'],
        { 'font-scale': 0.8 },
        '°C | 💧 ',
        { 'font-scale': 0.8 },
        ['get', 'humidity'],
        { 'font-scale': 0.8 },
        '%',
        { 'font-scale': 0.8 }
      ],
      'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'],
      'text-offset': [0, 0],
      'text-anchor': 'center',
      'text-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5, 10,
        8, 12,
        10, 14
      ]
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 2,
      'text-halo-blur': 1
    }
  }), []);

  // Log des données pour debug
  useEffect(() => {
    console.log('🎯 [CityCircles] Données GeoJSON:', circleData);
    console.log('🎯 [CityCircles] Nombre de features:', circleFeatures.length);
    if (circleFeatures.length > 0) {
      console.log('🎯 [CityCircles] Première feature:', circleFeatures[0]);
    }
  }, [circleData, circleFeatures]);

  if (circleFeatures.length === 0) {
    console.warn('⚠️ [CityCircles] Aucun cercle à afficher');
    return null;
  }

  return (
    <Source id="cities" type="geojson" data={circleData}>
      <Layer {...layerStyle} />
      <Layer {...labelStyle} />
    </Source>
  );
}

const MapView = forwardRef(({ cities, onCityClick }, ref) => {
  console.log('🗺️ [MapView] Render - Villes reçues:', cities);
  console.log('🗺️ [MapView] Nombre de villes:', cities?.length || 0);
  
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: -7.0926, // Centre du Maroc (longitude)
    latitude: 31.7917,  // Centre du Maroc (latitude)
    zoom: 5.8  // Zoom pour voir tout le Maroc confortablement
  });

  // Exposer la méthode flyToCity au parent via ref
  useImperativeHandle(ref, () => ({
    flyToCity: (city) => {
      if (!city || !mapRef.current) return;
      
      console.log(`🗺️ [MapView] Zoom sur la ville: ${city.name}`);
      
      // Utiliser flyTo pour une animation fluide
      const map = mapRef.current.getMap();
      if (map) {
        map.flyTo({
          center: [city.lng, city.lat],
          zoom: 9, // Zoom plus proche pour voir la ville
          duration: 2000, // Animation de 2 secondes
          essential: true
        });
      }
    }
  }), []);

  // Mémoriser les villes valides pour éviter les recalculs
  const validCities = useMemo(() => {
    if (!cities || !Array.isArray(cities)) return [];
    return cities.filter(city => 
      city && 
      city.lat !== undefined && 
      city.lat !== null && 
      city.lng !== undefined && 
      city.lng !== null &&
      !isNaN(city.lat) && 
      !isNaN(city.lng)
    );
  }, [cities]);
  
  console.log('🗺️ [MapView] Villes valides:', validCities.length);
  
  // Calculer le centre par défaut (moyenne des villes ou Maroc)
  const defaultCenter = useMemo(() => {
    if (validCities.length > 0) {
      const avgLat = validCities.reduce((sum, c) => sum + c.lat, 0) / validCities.length;
      const avgLng = validCities.reduce((sum, c) => sum + c.lng, 0) / validCities.length;
      return { longitude: avgLng, latitude: avgLat };
    }
    return { longitude: -7.0926, latitude: 31.7917 }; // Centre du Maroc par défaut
  }, [validCities]);

  // Mettre à jour la vue initiale
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      ...defaultCenter
    }));
  }, [defaultCenter]);


  // Build stations list HTML
  const buildStationsHTML = (stations) => {
    if (!stations || !Array.isArray(stations)) {
      return '<small>Aucune station disponible</small>';
    }
    
    let html = '';
    stations.forEach(station => {
      const statusIcon = station.status === 'active' ? '🟢' : (station.status === 'offline' ? '🔴' : '🟡');
      const statusText = station.status === 'active' ? 'Actif' : (station.status === 'offline' ? 'Hors ligne' : 'Maintenance');
      html += `<small>${statusIcon} ${station.id} - ${statusText}</small><br>`;
    });
    return html;
  };

  return (
    <div className="section-card">
      <h2 className="section-title">
        <i className="fas fa-map-marked-alt"></i>
        Carte de Pollution du Maroc
      </h2>
      <div style={{ position: 'relative', height: '550px', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={() => {
            console.log('✅ [MapView] Carte chargée avec succès');
            setMapLoaded(true);
          }}
          onError={(error) => {
            console.error('❌ [MapView] Erreur de chargement de la carte:', error);
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          // Activer tous les contrôles de navigation
          scrollZoom={true}
          doubleClickZoom={true}
          dragRotate={true}
          dragPan={true}
          keyboard={true}
          touchZoomRotate={true}
          interactiveLayerIds={['city-circles']}
          onClick={(event) => {
            const feature = event.features?.[0];
            if (!feature) return;
            
            const props = feature.properties;
            console.log(`🗺️ [MapView] Cercle cliqué pour ${props.name}`);
            
            setPopupInfo({
              longitude: event.lngLat.lng,
              latitude: event.lngLat.lat,
              city: {
                name: props.name,
                aqi: props.aqi,
                temp: props.temp,
                humidity: props.humidity,
                co2: props.co2,
                uv: props.uv,
                light: props.light,
                activeStations: props.activeStations,
                stationCount: props.stationCount,
                stations: props.stations,
                color: props.color
              }
            });
            
            if (onCityClick) {
              onCityClick({
                name: props.name,
                lat: event.lngLat.lat,
                lng: event.lngLat.lng,
                aqi: props.aqi,
                temp: props.temp,
                humidity: props.humidity,
                co2: props.co2,
                uv: props.uv,
                light: props.light,
                activeStations: props.activeStations,
                stationCount: props.stationCount,
                stations: props.stations
              });
            }
          }}
          cursor="pointer"
        >
          {/* Contrôles de navigation (boutons +/- pour zoomer) */}
          <NavigationControl position="top-right" showCompass={true} />
          
          <MapBounds cities={validCities} mapRef={mapRef} />
          {mapLoaded && <CityCircles cities={validCities} />}
          
          {popupInfo && (
            <Popup
              longitude={popupInfo.longitude}
              latitude={popupInfo.latitude}
              anchor="bottom"
              onClose={() => setPopupInfo(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div style={{ color: '#000', fontFamily: "'Poppins', sans-serif", minWidth: '220px' }}>
                <strong style={{ fontSize: '1.3rem', color: popupInfo.city.color }}>
                  {popupInfo.city.name}
                </strong>
                <br />
                <small style={{ color: '#666' }}>
                  🏢 {popupInfo.city.activeStations || 0}/{popupInfo.city.stationCount || 0} stations actives
                </small>
                <br /><br />
                <strong style={{ color: popupInfo.city.color }}>
                  AQI: {popupInfo.city.aqi || 0}
                </strong>
                <br />
                🌡️ Temp: {popupInfo.city.temp || 0}°C
                <br />
                💧 Humidité: {popupInfo.city.humidity || 0}%
                <br />
                🫁 CO₂: {popupInfo.city.co2 || 0} ppm
                <br />
                ☀️ UV: {popupInfo.city.uv || 0}
                <br />
                💡 Lumière: {popupInfo.city.light || 0} lux
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                  <strong style={{ color: '#2563eb' }}>📡 Stations ESP32:</strong>
                  <br />
                  <div dangerouslySetInnerHTML={{ __html: buildStationsHTML(popupInfo.city.stations) }} />
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
      <div className="legend">
        <div className="legend-title">🎨 Légende - Indice de Qualité Air (AQI)</div>
        <div style={{ 
          fontSize: '0.85rem', 
          marginBottom: '10px', 
          padding: '8px', 
          background: 'rgba(59, 130, 246, 0.1)', 
          borderRadius: '8px',
          borderLeft: '3px solid #3b82f6'
        }}>
          <strong>🔵 Les cercles représentent :</strong><br/>
          📊 <strong>AQI</strong> = Qualité de l'air (CO₂ 40% + Gaz 30% + UV 30%)<br/>
          📏 <strong>Taille</strong> = Plus l'AQI est élevé, plus le cercle est grand<br/>
          🎨 <strong>Couleur</strong> = Niveau de pollution (voir ci-dessous)
        </div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#10b981' }}></div>
            <span>Bon (0-50)</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#fbbf24' }}></div>
            <span>Moyen (51-100)</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#f97316' }}></div>
            <span>Élevé (101-150)</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#ef4444' }}></div>
            <span>Très élevé (&gt;150)</span>
          </div>
        </div>
        <div style={{ 
          fontSize: '0.8rem', 
          marginTop: '10px', 
          color: '#94a3b8',
          fontStyle: 'italic'
        }}>
          💡 Astuce : Utilisez la molette pour zoomer, cliquez sur un cercle pour voir les détails
        </div>
      </div>
    </div>
  );
});

MapView.displayName = 'MapView';

export default MapView;
