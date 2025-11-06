import React, { useState, useCallback, useContext, useEffect } from 'react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import MapView from '../components/MapView';
import CityCard from '../components/CityCard';
import SensorChart from '../components/SensorChart';
import { cities } from '../data/cities';
import { sensorConfigs } from '../data/sensors';
import { useWebSocket } from '../context/WebSocketContext';
import { getAllStations } from '../api/stationsApi';

function Dashboard() {
  const { latestData, isConnected } = useWebSocket();

  const [activeTab, setActiveTab] = useState('temp');
  const [selectedCity, setSelectedCity] = useState('Casablanca');
  const [sortedCities, setSortedCities] = useState([...cities].sort((a, b) => b.aqi - a.aqi));

  const handleCityClick = useCallback((city) => {
    const cityCardId = `city-${city.name.toLowerCase().replace(/\s+/g, '-')}`;
    const cityCard = document.getElementById(cityCardId);
    if (cityCard) {
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
  }, []);

  const handleMapCityClick = useCallback((map, city) => {
    map.setView([city.lat, city.lng], 8);
  }, []);

  // Fonction pour calculer l'AQI basé sur co2, gas et uv
  const calculateAQI = (co2, gas, uv) => {
    if (co2 === undefined || co2 === null) co2 = 0;
    if (gas === undefined || gas === null) gas = 0;
    if (uv === undefined || uv === null) uv = 0;
    return (co2 * 0.4) + (gas * 0.3) + (uv * 0.3);
  };

  // Fonction pour calculer la moyenne d'un tableau de valeurs
  const calculateAverage = (values) => {
    const validValues = values.filter(v => v !== undefined && v !== null && !isNaN(v));
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  };

  // Fetch toutes les stations et calculer les moyennes par ville
  useEffect(() => {
    const fetchAndProcessStations = async () => {
      try {
        console.log('🚀 [Dashboard] Début du fetch des stations...');
        const stations = await getAllStations();
        console.log('✅ [Dashboard] Stations récupérées:', stations);
        console.log('📊 [Dashboard] Nombre de stations:', stations?.length || 0);
        
        // Vérifier que stations est un tableau valide
        if (!stations || !Array.isArray(stations)) {
          console.warn("⚠️ [Dashboard] getAllStations n'a pas retourné un tableau valide:", stations);
          return; // Garder les villes par défaut
        }
        
        // Grouper les stations par ville
        const stationsByCity = {};
        let stationsWithCity = 0;
        let stationsWithoutCity = 0;
        let totalDataPoints = 0;
        
        stations.forEach(station => {
          console.log('🔍 [Dashboard] Traitement station:', {
            name: station.name,
            hasCity: !!station.city,
            cityName: station.city?.name,
            hasData: !!(station.data && Array.isArray(station.data) && station.data.length > 0),
            dataCount: station.data?.length || 0
          });
          
          // Si la station n'a pas de ville, on peut essayer de la grouper par coordonnées ou la skip
          // Pour l'instant, on skip les stations sans ville
          if (!station.city || !station.city.name) {
            console.warn("⚠️ [Dashboard] Station sans ville:", station.name);
            stationsWithoutCity++;
            return;
          }
          
          stationsWithCity++;
          const cityName = station.city.name;
          
          if (!stationsByCity[cityName]) {
            stationsByCity[cityName] = {
              name: cityName,
              stations: [],
              allData: [] // Toutes les données de toutes les stations de cette ville
            };
            console.log('🏙️ [Dashboard] Nouvelle ville créée:', cityName);
          }
          
          // Ajouter la station
          stationsByCity[cityName].stations.push(station);
          
          // Collecter toutes les données de cette station
          if (station.data && Array.isArray(station.data) && station.data.length > 0) {
            const dataCount = station.data.length;
            totalDataPoints += dataCount;
            station.data.forEach(dataPoint => {
              if (dataPoint) {
                stationsByCity[cityName].allData.push(dataPoint);
              }
            });
            console.log(`📈 [Dashboard] Ajouté ${dataCount} points de données pour ${cityName} depuis ${station.name}`);
          }
        });
        
        console.log('📊 [Dashboard] Résumé du groupement:', {
          stationsAvecVille: stationsWithCity,
          stationsSansVille: stationsWithoutCity,
          totalDataPoints: totalDataPoints,
          villesUniques: Object.keys(stationsByCity).length,
          villes: Object.keys(stationsByCity)
        });
        
        // Calculer les moyennes pour chaque ville
        console.log('🧮 [Dashboard] Début du calcul des moyennes par ville...');
        const citiesWithAverages = Object.values(stationsByCity).map(cityGroup => {
          const { allData = [], stations: cityStations = [] } = cityGroup;
          
          // S'assurer que allData et cityStations sont des tableaux
          const safeAllData = Array.isArray(allData) ? allData : [];
          const safeCityStations = Array.isArray(cityStations) ? cityStations : [];
          
          console.log(`🏙️ [Dashboard] Calcul pour ${cityGroup.name}:`, {
            stationsCount: safeCityStations.length,
            dataPointsCount: safeAllData.length
          });
          
          // Calculer les coordonnées (moyenne des stations de la ville)
          const validLats = safeCityStations.filter(s => s && s.latitude && s.latitude !== 0).map(s => s.latitude);
          const validLngs = safeCityStations.filter(s => s && s.longitude && s.longitude !== 0).map(s => s.longitude);
          const lat = validLats.length > 0 ? calculateAverage(validLats) : 31.7917;
          const lng = validLngs.length > 0 ? calculateAverage(validLngs) : -7.0926;
          
          console.log(`📍 [Dashboard] Coordonnées pour ${cityGroup.name}:`, { lat, lng });
          
          if (safeAllData.length === 0) {
            // Si pas de données, utiliser les valeurs par défaut
            console.log(`⚠️ [Dashboard] ${cityGroup.name} n'a pas de données de capteurs`);
            return {
              name: cityGroup.name,
              lat: lat,
              lng: lng,
              aqi: 0,
              temp: 0,
              humidity: 0,
              co2: 0,
              uv: 0,
              light: 0,
              pressure: 0,
              gas: 0,
              stationCount: safeCityStations.length,
              activeStations: safeCityStations.filter(s => s && s.data && Array.isArray(s.data) && s.data.length > 0).length,
              stations: safeCityStations.map(s => ({
                id: s && (s.id || s.name),
                status: (s && s.data && Array.isArray(s.data) && s.data.length > 0) ? 'active' : 'offline'
              }))
            };
          }
          
          // Calculer les moyennes
          const avgTemp = calculateAverage(safeAllData.map(d => d && d.temp));
          const avgHumidity = calculateAverage(safeAllData.map(d => d && d.humidity));
          const avgCo2 = calculateAverage(safeAllData.map(d => d && d.co2));
          const avgGas = calculateAverage(safeAllData.map(d => d && d.gas));
          const avgUv = calculateAverage(safeAllData.map(d => d && d.uv));
          const avgLight = calculateAverage(safeAllData.map(d => d && (d.lumiere || d.light)));
          const avgPressure = calculateAverage(safeAllData.map(d => d && (d.pression || d.pressure)));
          
          // Calculer l'AQI
          const aqi = calculateAQI(avgCo2, avgGas, avgUv);
          
          // Compter les stations actives (celles avec des données)
          const activeStations = safeCityStations.filter(s => s && s.data && Array.isArray(s.data) && s.data.length > 0).length;
          
          const cityResult = {
            name: cityGroup.name,
            lat: lat,
            lng: lng,
            aqi: Math.round(aqi),
            temp: Math.round(avgTemp * 10) / 10,
            humidity: Math.round(avgHumidity * 10) / 10,
            co2: Math.round(avgCo2),
            uv: Math.round(avgUv * 10) / 10,
            light: Math.round(avgLight),
            pressure: Math.round(avgPressure),
            gas: Math.round(avgGas),
            stationCount: safeCityStations.length,
            activeStations: activeStations,
            stations: safeCityStations.map(s => ({
              id: s && (s.id || s.name),
              status: (s && s.data && Array.isArray(s.data) && s.data.length > 0) ? 'active' : 'offline'
            }))
          };
          
          console.log(`✅ [Dashboard] Moyennes calculées pour ${cityGroup.name}:`, {
            aqi: cityResult.aqi,
            temp: cityResult.temp,
            humidity: cityResult.humidity,
            co2: cityResult.co2,
            uv: cityResult.uv,
            gas: cityResult.gas,
            stations: cityResult.stationCount,
            activeStations: cityResult.activeStations
          });
          
          return cityResult;
        });
        
        // Trier par AQI décroissant
        const sorted = citiesWithAverages.sort((a, b) => b.aqi - a.aqi);
        
        console.log('🎯 [Dashboard] Villes finales calculées:', sorted);
        console.log('📊 [Dashboard] Nombre de villes:', sorted.length);
        console.log('🏆 [Dashboard] Ville avec le plus haut AQI:', sorted[0]?.name, 'AQI:', sorted[0]?.aqi);
        
        setSortedCities(sorted);
        
        console.log('✅ [Dashboard] État mis à jour avec', sorted.length, 'villes');
        
      } catch (error) {
        console.error("❌ [Dashboard] Erreur lors du chargement des stations:", error);
        console.error("❌ [Dashboard] Stack trace:", error.stack);
        // En cas d'erreur, garder les villes par défaut
        // Ne pas modifier sortedCities, il garde sa valeur initiale
      }
    };
    
    fetchAndProcessStations();
  }, []);

  // Log pour vérifier l'état actuel des villes
  useEffect(() => {
    console.log('🔄 [Dashboard] Render - Villes actuellement affichées:', sortedCities);
    console.log('🔄 [Dashboard] Nombre de villes dans sortedCities:', sortedCities?.length || 0);
    if (sortedCities && sortedCities.length > 0) {
      console.log('🔄 [Dashboard] Première ville:', sortedCities[0]);
      console.log('📤 [Dashboard] Passage des villes à MapView:', {
        count: sortedCities.length,
        cities: sortedCities.map(c => ({ 
          name: c.name, 
          aqi: c.aqi, 
          stations: c.stationCount,
          activeStations: c.activeStations,
          lat: c.lat,
          lng: c.lng
        }))
      });
    }
  }, [sortedCities]);

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
          </h2>
          <div className="cities-grid">
            {sortedCities && Array.isArray(sortedCities) && sortedCities.map((city) => (
              <CityCard
                key={city.name}
                city={city}
                onClick={() => handleMapCityClick(null, city)}
              />
            ))}
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
              {cities.map((city) => (
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
