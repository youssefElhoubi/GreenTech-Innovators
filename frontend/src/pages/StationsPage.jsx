import React, { useEffect, useState } from 'react';
import { addStation, getAllStations, updateStation ,deleteStation } from '../api/stationsApi';
import { getAllCities } from '../api/cityApi';

function StationsPage() {
  const [stations, setStations] = useState([]);
  const [cities, setCities] = useState([]);
  const [editingStation, setEditingStation] = useState(null); 
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
    mac: '',
    cityId: '',
    data: []
  });

  const totalStations = stations.length;
  const onlineStations = stations.filter(s => s.status === 'online').length;
  const offlineStations = stations.filter(s => s.status === 'offline').length;

 useEffect(() => {
  const fetchData = async () => {
    try {
      const [stationsData, citiesData] = await Promise.all([
        getAllStations(),
        getAllCities()
      ]);

      // Transform stations: extract sensors as strings
     const stationsWithSensors = stationsData.map(station => {
  const sensors = station.data?.map(d => {
    const list = [];
  if (d.temp !== undefined) list.push(`🌡️ ${d.temp}°C`);
if (d.humidity !== undefined) list.push(`💧 ${d.humidity}%`);
if (d.co2 !== undefined) list.push(`🫁 ${d.co2} ppm`);
if (d.gas !== undefined) list.push(`💨 ${d.gas}`);
if (d.uv !== undefined) list.push(`☀️ ${d.uv}`);

    return list;
  }).flat();
console.log("Sensors extracted for station", station.name, ":", sensors);
        return {
          ...station,
          sensors // <-- array dyal strings ready to render
        };
      });

      setStations(stationsWithSensors);
      setCities(citiesData);

    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
    }
  };

  fetchData();
}, []);


const handleSubmit = async (e) => {
  e.preventDefault();

  const newStation = {
    name: formData.name,
    latitude: parseFloat(formData.lat),
    longitude: parseFloat(formData.lng),
    adresseMAC: formData.mac,
    cityId: formData.cityId,
    data: formData.data
  };

  if (editingStation) {
    // Optimistic update: update f state direct
    const tempStation = {
      ...editingStation,
      ...newStation,
      city: cities.find(c => c.id === newStation.cityId) || null
    };
    setStations(prev =>
      prev.map(s => s.id === editingStation.id ? tempStation : s)
    );

    try {
      const updated = await updateStation(editingStation.id, newStation);
      alert(`✅ Station "${updated.name}" mise à jour avec succès !`);
      setEditingStation(null);
    } catch (error) {
      console.error(error);
      // rollback f case erreur
      setStations(prev =>
        prev.map(s => s.id === editingStation.id ? editingStation : s)
      );
      alert("❌ Erreur lors de la mise à jour. Rollback appliqué.");
    }
  } else {
    // Ajouter station f front direct
    const tempStation = {
      ...newStation,
      id: Math.random().toString(36).substr(2, 9), // id temporaire
      city: cities.find(c => c.id === newStation.cityId) || null
    };
    setStations(prev => [...prev, tempStation]);

    try {
      const saved = await addStation(newStation);
      setStations(prev =>
        prev.map(s => s.id === tempStation.id ? { ...saved, city: tempStation.city } : s)
      );
      alert(`✅ Station "${saved.name}" ajoutée avec succès !`);
    } catch (error) {
      console.error(error);
      // setStations(prev => prev.filter(s => s.id !== tempStation.id));
      
    }
  }

  setFormData({ name: '', lat: '', lng: '', mac: '', cityId: '', data: [] });
};



  const handleEditStation = (id) => {
    const station = stations.find(s => s.id === id);
    if (!station) return alert("Station non trouvée !");
    setEditingStation(station);
    setFormData({
      name: station.name,
      lat: station.latitude,
      lng: station.longitude,
      mac: station.adresseMAC,
      cityId: station.city?.id || '',
      data: station.data || []
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleDeleteStation = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette station ?')) {
    try {
      await deleteStation(id); 
      setStations(prev => prev.filter(s => s.id !== id)); 
      alert('🗑️ Station supprimée avec succès !');
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("❌ Impossible de supprimer la station. Réessayez !");
    }
  }
};

  const handleToggleStatus = (id) => {
    setStations(prev =>
      prev.map(station => {
        if (station.id === id) {
          return { ...station, status: station.status === 'online' ? 'offline' : 'online' };
        }
        return station;
      })
    );
  };


 return (
  <div className="page-content active">
    <div className="container">
      <h1
        className="page-title"
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}
      >
        <i className="fas fa-microchip"></i>
        Gestion des Stations ESP32
      </h1>

      {/* Stats Cards */}
      <div className="stations-kpi-grid">
        <div className="kpi-card" style={{ '--kpi-color': '#667eea' }}>
          <div className="kpi-icon">
            <i className="fas fa-microchip"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Stations</div>
            <div className="kpi-value">{totalStations}</div>
            <div className="kpi-trend">
              <i className="fas fa-server"></i> Actives
            </div>
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#10b981' }}>
          <div className="kpi-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">En Ligne</div>
            <div className="kpi-value">{onlineStations}</div>
            <div className="kpi-trend">
              <i className="fas fa-arrow-up"></i>{' '}
              {totalStations ? Math.round((onlineStations / totalStations) * 100) : 0}%
            </div>
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#ef4444' }}>
          <div className="kpi-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Hors Ligne</div>
            <div className="kpi-value">{offlineStations}</div>
            <div className="kpi-trend">
              <i className="fas fa-power-off"></i>{' '}
              {totalStations ? Math.round((offlineStations / totalStations) * 100) : 0}%
            </div>
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' }}>
          <div className="kpi-icon">
            <i className="fas fa-city"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Villes Couvertes</div>
            <div className="kpi-value">{cities.length}</div>
            <div className="kpi-trend">
              <i className="fas fa-map-marker-alt"></i> Maroc
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="stations-grid">
        {/* Add/Edit Station Form */}
<div className="section-card">
  <h2 className="section-title">
    <i className="fas fa-plus-circle"></i>{' '}
    {editingStation ? 'Modifier la Station' : 'Ajouter une Nouvelle Station'}
  </h2>
  <form onSubmit={handleSubmit} className="station-form">
    {/* Station Name */}
    <div className="form-group">
      <label htmlFor="station-name">
        <i className="fas fa-tag"></i> Nom de la Station
      </label>
      <input
        type="text"
        id="station-name"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ex: ESP32-CAS-001"
        required
      />
    </div>

    {/* City */}
    <div className="form-group">
      <label htmlFor="station-city">
        <i className="fas fa-map-marker-alt"></i> Ville
      </label>
      <select
        id="station-city"
        name="city"
        value={formData.cityId}
        onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
        required
      >
        <option value="">Sélectionnez une ville</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
    </div>

    {/* Latitude & Longitude */}
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="station-lat">
          <i className="fas fa-location-arrow"></i> Latitude
        </label>
        <input
          type="number"
          id="station-lat"
          name="lat"
          step="0.000001"
          value={formData.lat}
          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
          placeholder="33.5731"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="station-lng">
          <i className="fas fa-location-arrow"></i> Longitude
        </label>
        <input
          type="number"
          id="station-lng"
          name="lng"
          step="0.000001"
          value={formData.lng}
          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
          placeholder="-7.5898"
          required
        />
      </div>
    </div>

    {/* MAC Address */}
    <div className="form-group">
      <label htmlFor="station-mac">
        <i className="fas fa-network-wired"></i> Adresse MAC
      </label>
      <input
        type="text"
        id="station-mac"
        name="mac"
        value={formData.mac}
        onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
        placeholder="AA:BB:CC:DD:EE:FF"
        pattern="([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}"
        required
      />
    </div>

    {/* Sensors */}
    <div className="form-group">
      <label>
        <i className="fas fa-microchip"></i> Capteurs Installés
      </label>
      <div className="sensors-checkboxes">
        {['DHT22', 'MQ-135', 'BMP280', 'MICS-5524', 'ML8511'].map((sensor) => (
          <label key={sensor} className="sensor-checkbox">
            <input
              type="checkbox"
              value={sensor}
              checked={formData.data.includes(sensor)}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({ ...formData, data: [...formData.data, sensor] });
                } else {
                  setFormData({ ...formData, data: formData.data.filter(s => s !== sensor) });
                }
              }}
            />
            <span>
              {sensor === 'DHT22' && '🌡️ DHT22 (Temp/Humid)'}
              {sensor === 'MQ-135' && '🫁 MQ-135 (CO₂)'}
              {sensor === 'BMP280' && '📊 BMP280 (Pression)'}
              {sensor === 'MICS-5524' && '💨 MICS-5524 (Gaz)'}
              {sensor === 'ML8511' && '☀️ ML8511 (UV)'}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* Submit Button */}
    <button type="submit" className="btn-add-station">
      <i className="fas fa-plus-circle"></i>{' '}
      {editingStation ? 'Mettre à jour la Station' : 'Ajouter la Station'}
    </button>
  </form>
</div>


        {/* Stations List */}
        <div className="section-card">
          <h2 className="section-title">
            <i className="fas fa-list"></i> Liste des Stations ({totalStations})
          </h2>
          <div className="stations-list">
            {stations.map((station) => (
              <div key={station.id} className="station-item">
                <div className="station-header">
                  <div className="station-name">{station.name}</div>
                  <div className="station-status-wrapper">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={station.status === 'online'}
                        onChange={() => handleToggleStatus(station.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`station-status-text ${station.status}`}>
                      {station.status === 'online' ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </div>

                <div className="station-info">
                  <div className="station-info-item">
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    <span>{station.city?.name || 'Ville inconnue'}</span>
                  </div>
                  <div className="station-info-item">
                    <i className="fas fa-network-wired"></i>{' '}
                    <span>{station.adresseMAC}</span>
                  </div>
                  <div className="station-info-item">
                    <i className="fas fa-location-arrow"></i>{' '}
                    <span>
                      {station.latitude}, {station.longitude}
                    </span>
                  </div>
                  <div className="station-info-item">
                    <i className="fas fa-microchip"></i>{' '}
                    <span>{station.data.length} capteurs</span>
                  </div>
                </div>



                <div className="station-actions">
                          <button
          className="btn-station-action btn-edit"
          onClick={() => handleEditStation(station.id)}
        >
          <i className="fas fa-edit"></i> Modifier
        </button>

                  <button
                    className="btn-station-action btn-delete"
                    onClick={() => handleDeleteStation(station.id)}
                  >
                    <i className="fas fa-trash"></i> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default StationsPage;

