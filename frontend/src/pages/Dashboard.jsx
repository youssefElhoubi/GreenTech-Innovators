import React, { useState, useCallback, useEffect } from 'react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import MapView from '../components/MapView';
import CityCard from '../components/CityCard';
import SensorChart from '../components/SensorChart';
import { sensorConfigs } from '../data/sensors';
import { useWebSocket } from '../context/WebSocketContext';
import { fetchCitiesWithStats } from '../api/citiesApi';

function Dashboard() {
  const { latestData, isConnected } = useWebSocket();

  const [activeTab, setActiveTab] = useState('temp');
  const [selectedCity, setSelectedCity] = useState('Casablanca');
  const [sortedCities, setSortedCities] = useState([]); // Start with empty array
  const [isLoadingCities, setIsLoadingCities] = useState(true); // Start loading immediately

  const handleCityClick = useCallback((cityNameOrObj) => {
    // Handle both string (city name) and object (full city data)
    const cityName = typeof cityNameOrObj === 'string' ? cityNameOrObj : cityNameOrObj.name;
    const city = typeof cityNameOrObj === 'object' ? cityNameOrObj : sortedCities.find(c => c.name === cityNameOrObj);
    
    const cityCardId = `city-${cityName.toLowerCase().replace(/\s+/g, '-')}`;
    const cityCard = document.getElementById(cityCardId);
    if (cityCard && city) {
      cityCard.style.transition = 'all 0.5s ease';
      cityCard.style.transform = 'scale(1.05)';
      cityCard.style.boxShadow = `0 0 30px ${
        city.aqi <= 50
          ? '#10b981'
          : city.aqi <= 100
          ? '#fbbf24'
          : city.aqi <= 150
          ? '#f97316'
          : '#ef4444'
      }`;

      cityCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => {
        cityCard.style.transform = '';
        cityCard.style.boxShadow = '';
      }, 2000);
    }
  }, [sortedCities]);

  // Load cities with live statistics from backend
  useEffect(() => {
    const loadCitiesStats = async () => {
      setIsLoadingCities(true);
      try {
        const citiesStats = await fetchCitiesWithStats();
        console.log(' Fetching cities from backend...');
        
        if (citiesStats && citiesStats.length > 0) {
          console.log('  Loaded live cities stats:', citiesStats);
          // Sort by AQI (highest first)
          const sorted = citiesStats.sort((a, b) => b.aqi - a.aqi);
          setSortedCities(sorted);
        } else {
          console.warn('  No cities data received from backend');
          setSortedCities([]); // Keep empty instead of using static data
        }
      } catch (error) {
        console.error('  Error loading cities stats:', error);
        setSortedCities([]); // Keep empty on error
      } finally {
        setIsLoadingCities(false);
      }
    };

    // Load immediately on mount
    loadCitiesStats();
    
    // Refresh cities data every 1 second
    const interval = setInterval(loadCitiesStats, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-content active">
      <Header />

      <div className="stats-grid">
        <StatCard
          icon="fa-temperature-high"
          label="Température (BMP280)"
          value={
            latestData
              ? `${latestData.temp.toFixed(1)}°C`
              : isConnected
              ? '...'
              : 'Offline'
          }
          color="#ef4444"
          gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          shadow="rgba(239, 68, 68, 0.3)"
          tooltip="Température actuelle provenant du capteur BMP280"
        />

        <StatCard
          icon="fa-droplet"
          label="Humidité (DHT22)"
          value={
            latestData
              ? `${latestData.humidity.toFixed(1)}%`
              : isConnected
              ? '...'
              : 'Offline'
          }
          color="#3b82f6"
          gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          shadow="rgba(59, 130, 246, 0.3)"
          tooltip="Humidité actuelle provenant du capteur DHT22"
        />

        <StatCard
          icon="fa-gauge-high"
          label="Pression (BMP280)"
          value={
            latestData
              ? `${latestData.pression} hPa`
              : isConnected
              ? '...'
              : 'Offline'
          }
          color="#10b981"
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          shadow="rgba(16, 185, 129, 0.3)"
          tooltip="Pression atmosphérique mesurée par BMP280"
        />

        <StatCard
          icon="fa-lungs"
          label="CO₂ (MQ-135)"
          value={
            latestData
              ? `${latestData.co2} ppm`
              : isConnected
              ? '...'
              : 'Offline'
          }
          color="#8b5cf6"
          gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          shadow="rgba(139, 92, 246, 0.3)"
          tooltip="Concentration de CO₂ détectée par MQ-135"
        />

        <StatCard
          icon="fa-smog"
          label="CO / Gaz (MICS-5524)"
          value={
            latestData
              ? `${latestData.gas} ppm`
              : isConnected
              ? '...'
              : 'Offline'
          }
          color="#ec4899"
          gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
          shadow="rgba(236, 72, 153, 0.3)"
          tooltip="Détection de gaz et CO via MICS-5524"
        />

        <StatCard
          icon="fa-sun"
          label="UV (ML8511)"
          value={
            latestData && latestData.uv !== undefined && latestData.uv !== null
              ? latestData.uv.toFixed(2)
              : isConnected
              ? '...'
              : 'Offline'
          }
          color="#f59e0b"
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          shadow="rgba(245, 158, 11, 0.3)"
          tooltip="Indice UV détecté par ML8511"
        />
      </div>

      <div className="main-grid">
        <MapView cities={sortedCities} onCityClick={handleCityClick} />

        <div className="section-card">
          <h2 className="section-title">
            <i className="fas fa-city"></i> Villes en Direct
            {isLoadingCities && (
              <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#10b981' }}>
                <i className="fas fa-sync fa-spin"></i> Chargement...
              </span>
            )}
          </h2>
          <div className="cities-grid">
            {sortedCities.length > 0 ? (
              sortedCities.map((city) => (
                <CityCard
                  key={city.name}
                  city={city}
                  onClick={() => handleCityClick(city.name)}
                />
              ))
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <i className="fas fa-database" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                <p>Aucune donnée de ville disponible</p>
                <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                  Assurez-vous que le backend est en cours d'exécution
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="graphs-section">
        <h2 className="section-title">
          <i className="fas fa-chart-line"></i> Graphiques Détaillés (24 heures)
        </h2>

        <div className="city-selector">
          <div className="city-selector-header">
            <i className="fas fa-map-marker-alt"></i>
            <span>Sélectionnez une ville :</span>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(30, 30, 50, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
                outline: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              {sortedCities.map((city) => (
                <option
                  key={city.name}
                  value={city.name}
                  style={{ background: '#1a1a2e', color: '#fff' }}
                >
                  {city.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSelectedCity('moyenne')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              }}
            >
              <i className="fas fa-chart-line"></i> Moyenne Nationale
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {Object.entries(sensorConfigs).map(([key, config]) => (
            <button
              key={key}
              className={`tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <i className={`fas ${config.icon}`}></i>{' '}
              {config.label.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {Object.keys(sensorConfigs).map((key) => (
          <div
            key={key}
            className={`tab-content ${activeTab === key ? 'active' : ''}`}
          >
            <SensorChart sensorType={key} cityName={selectedCity} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
