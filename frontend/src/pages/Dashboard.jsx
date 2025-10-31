import React,{ useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import MapView from '../components/MapView';
import CityCard from '../components/CityCard';
import SensorChart from '../components/SensorChart';
import { cities } from '../data/cities';
import { sensorConfigs } from '../data/sensors';

function Dashboard() {
  const [sensorData, setSensorData] = useState({
    temp: 25.3,
    humidity: 65,
    pressure: 1013,
    co2: 425,
    gas: 38,
    uv: 6.2,
    light: 8524
  });

  const [activeTab, setActiveTab] = useState('temp');
  const [selectedCity, setSelectedCity] = useState('Casablanca');
  const [sortedCities] = useState([...cities].sort((a, b) => b.aqi - a.aqi));

  // Real-time updates simulation
  useEffect(() => {
    const sensors = [
      { id: 'temp', base: 25, variance: 0.5, unit: '°C' },
      { id: 'humidity', base: 65, variance: 3, unit: '%', isInt: true },
      { id: 'pressure', base: 1013, variance: 2, unit: '', isInt: true },
      { id: 'co2', base: 425, variance: 10, unit: '', isInt: true },
      { id: 'gas', base: 38, variance: 5, unit: '', isInt: true },
      { id: 'uv', base: 6.2, variance: 0.5, unit: '' },
      { id: 'light', base: 8524, variance: 500, unit: '', isInt: true }
    ];

    const interval = setInterval(() => {
      setSensorData(prevData => {
        const newData = { ...prevData };
        sensors.forEach(sensor => {
          const change = (Math.random() - 0.5) * sensor.variance;
          let newValue = prevData[sensor.id] + change;
          
          if (sensor.isInt) {
            newValue = Math.round(newValue);
          } else {
            newValue = parseFloat(newValue.toFixed(1));
          }
          
          newData[sensor.id] = newValue;
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCityClick = useCallback((city) => {
    const cityCardId = `city-${city.name.toLowerCase().replace(/\s+/g, '-')}`;
    const cityCard = document.getElementById(cityCardId);
    if (cityCard) {
      cityCard.style.transition = 'all 0.5s ease';
      cityCard.style.transform = 'scale(1.05)';
      cityCard.style.boxShadow = `0 0 30px ${city.aqi <= 50 ? '#10b981' : city.aqi <= 100 ? '#fbbf24' : city.aqi <= 150 ? '#f97316' : '#ef4444'}`;
      
      cityCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        cityCard.style.transform = '';
        cityCard.style.boxShadow = '';
      }, 2000);
    }
  }, []);

  const handleMapCityClick = useCallback((map, city) => {
    map.setView([city.lat, city.lng], 8);
  }, []);

  return (
    <div className="page-content active">
      <Header />

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon="fa-temperature-high"
          label="Température (BMP280)"
          value={`${sensorData.temp}°C`}
          trend="trend-up"
          trendIcon="fa-arrow-up"
          trendText="+2.1°C"
          color="#ef4444"
          gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          shadow="rgba(239, 68, 68, 0.3)"
          tooltip="Moyenne = Somme des températures / Nombre total de villes"
        />
        <StatCard
          icon="fa-droplet"
          label="Humidité (DHT22)"
          value={`${sensorData.humidity}%`}
          trend="trend-down"
          trendIcon="fa-arrow-down"
          trendText="-5%"
          color="#3b82f6"
          gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          shadow="rgba(59, 130, 246, 0.3)"
          tooltip="Moyenne = Somme des humidités / Nombre total de villes"
        />
        <StatCard
          icon="fa-gauge-high"
          label="Pression (BMP280)"
          value={sensorData.pressure}
          trend=""
          trendIcon="fa-minus"
          trendText="hPa"
          color="#10b981"
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          shadow="rgba(16, 185, 129, 0.3)"
          tooltip="Moyenne = Somme des pressions / Nombre total de villes"
        />
        <StatCard
          icon="fa-lungs"
          label="CO₂ (MQ-135)"
          value={sensorData.co2}
          trend="trend-up"
          trendIcon="fa-arrow-up"
          trendText="ppm"
          color="#8b5cf6"
          gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          shadow="rgba(139, 92, 246, 0.3)"
          tooltip="Moyenne = Somme des CO₂ / Nombre total de villes"
        />
        <StatCard
          icon="fa-smog"
          label="CO / Gaz (MICS-5524)"
          value={sensorData.gas}
          trend="trend-up"
          trendIcon="fa-arrow-up"
          trendText="ppm"
          color="#ec4899"
          gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
          shadow="rgba(236, 72, 153, 0.3)"
          tooltip="Moyenne = Somme des CO/Gaz / Nombre total de villes"
        />
        <StatCard
          icon="fa-sun"
          label="UV (ML8511)"
          value={sensorData.uv}
          trend="trend-up"
          trendIcon="fa-arrow-up"
          trendText="Index"
          color="#f59e0b"
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          shadow="rgba(245, 158, 11, 0.3)"
          tooltip="Moyenne = Somme des index UV / Nombre total de villes"
        />
        <StatCard
          icon="fa-lightbulb"
          label="Lumière (BH1750)"
          value={sensorData.light}
          trend=""
          trendIcon="fa-sun"
          trendText="lux"
          color="#fbbf24"
          gradient="linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
          shadow="rgba(251, 191, 36, 0.3)"
          tooltip="Moyenne = Somme de la lumière / Nombre total de villes"
        />
      </div>

      {/* Main Content */}
      <div className="main-grid">
        <MapView cities={sortedCities} onCityClick={handleCityClick} />

        {/* Cities Sidebar */}
        <div className="section-card">
          <h2 className="section-title">
            <i className="fas fa-city"></i>
            Villes en Direct
          </h2>
          <div className="cities-grid">
            {sortedCities.map(city => (
              <CityCard 
                key={city.name} 
                city={city}
                onClick={() => handleMapCityClick(null, city)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="graphs-section">
        <h2 className="section-title">
          <i className="fas fa-chart-line"></i>
          Graphiques Détaillés (24 heures)
        </h2>

        {/* City Selector */}
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
                backdropFilter: 'blur(10px)' 
              }}
            >
              {cities.map(city => (
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
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' 
              }}
            >
              <i className="fas fa-chart-line"></i> Moyenne Nationale
            </button>
          </div>
        </div>

        {/* Sensor Tabs */}
        <div className="tabs">
          {Object.entries(sensorConfigs).map(([key, config]) => (
            <button 
              key={key}
              className={`tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <i className={`fas ${config.icon}`}></i> {config.label.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {Object.keys(sensorConfigs).map(key => (
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

