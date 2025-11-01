import React from 'react';
import { getColor, getColorWithAlpha } from '../utils/helpers';
import { cityCodes } from '../data/cities';

function CityCard({ city, onClick }) {
  const cityColor = getColor(city.aqi);
  const cityShadow = getColorWithAlpha(city.aqi, 0.3);

  return (
    <div 
      className="city-card"
      id={`city-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        '--city-color': cityColor,
        '--city-shadow': cityShadow
      }}
      onClick={onClick}
    >
      <div className="city-header">
        <div className="city-name">{city.name}</div>
        <div className="city-aqi">{city.aqi}</div>
      </div>
      <div className="city-stations">
        <span className="station-status"></span>
        <span>{city.activeStations}/{city.stationCount} stations ESP32</span>
      </div>
      <div className="city-data">
        <div className="city-data-item">
          <div className="city-data-label">🌡️ Temp</div>
          <div className="city-data-value">{city.temp}°C</div>
        </div>
        <div className="city-data-item">
          <div className="city-data-label">💧 Humid</div>
          <div className="city-data-value">{city.humidity}%</div>
        </div>
        <div className="city-data-item">
          <div className="city-data-label">🫁 CO₂</div>
          <div className="city-data-value">{city.co2}</div>
        </div>
        <div className="city-data-item">
          <div className="city-data-label">☀️ UV</div>
          <div className="city-data-value">{city.uv}</div>
        </div>
        <div className="city-data-item">
          <div className="city-data-label">💡 Lux</div>
          <div className="city-data-value">{city.light}</div>
        </div>
        <div className="city-data-item">
          <div className="city-data-label">🏢 Code</div>
          <div className="city-data-value">{cityCodes[city.name]}</div>
        </div>
      </div>
    </div>
  );
}

export default CityCard;

