import React,{ useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getColor, getRadius } from '../utils/helpers';

// Fix for default markers in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapView({ cities, onCityClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([31.7917, -7.0926], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers except tile layer
    map.eachLayer(layer => {
      if (layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add circles for cities
    cities.forEach(city => {
      const circle = L.circle([city.lat, city.lng], {
        color: getColor(city.aqi),
        fillColor: getColor(city.aqi),
        fillOpacity: 0.4,
        radius: getRadius(city.aqi),
        weight: 2
      }).addTo(map);

      // Build stations list HTML
      let stationsHTML = '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">';
      stationsHTML += '<strong style="color: #2563eb;">📡 Stations ESP32:</strong><br>';
      city.stations.forEach(station => {
        const statusIcon = station.status === 'active' ? '🟢' : (station.status === 'offline' ? '🔴' : '🟡');
        const statusText = station.status === 'active' ? 'Actif' : (station.status === 'offline' ? 'Hors ligne' : 'Maintenance');
        stationsHTML += `<small>${statusIcon} ${station.id} - ${statusText}</small><br>`;
      });
      stationsHTML += '</div>';

      circle.bindPopup(`
        <div style="color: #000; font-family: 'Poppins', sans-serif; min-width: 220px;">
          <strong style="font-size: 1.3rem; color: ${getColor(city.aqi)};">${city.name}</strong><br>
          <small style="color: #666;">🏢 ${city.activeStations}/${city.stationCount} stations actives</small>
          <br><br>
          <strong style="color: ${getColor(city.aqi)};">AQI: ${city.aqi}</strong><br>
          🌡️ Temp: ${city.temp}°C<br>
          💧 Humidité: ${city.humidity}%<br>
          🫁 CO₂: ${city.co2} ppm<br>
          ☀️ UV: ${city.uv}<br>
          💡 Lumière: ${city.light} lux
          ${stationsHTML}
        </div>
      `);

      // Auto-scroll to city card when circle is clicked
      circle.on('click', () => {
        if (onCityClick) {
          onCityClick(city);
        }
      });
    });

    return () => {
      // Cleanup is handled on component unmount
    };
  }, [cities, onCityClick]);

  return (
    <div className="section-card">
      <h2 className="section-title">
        <i className="fas fa-map-marked-alt"></i>
        Carte de Pollution du Maroc
      </h2>
      <div id="map" ref={mapRef}></div>
      <div className="legend">
        <div className="legend-title">🎨 Légende - Indice de Qualité Air (AQI)</div>
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
            <span>Très élevé (>150)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;

