import React,{ useState } from 'react';
import { initialStations } from '../data/stations';

function StationsPage() {
  const [stations, setStations] = useState(initialStations);

  const totalStations = stations.length;
  const onlineStations = stations.filter(s => s.status === 'online').length;
  const offlineStations = stations.filter(s => s.status === 'offline').length;

  const handleAddStation = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const selectedSensors = [];
    
    // Get all checked sensors
    const checkboxes = e.target.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(cb => selectedSensors.push(cb.value));

    const newStation = {
      id: stations.length + 1,
      name: formData.get('name'),
      city: formData.get('city'),
      lat: parseFloat(formData.get('lat')),
      lng: parseFloat(formData.get('lng')),
      mac: formData.get('mac'),
      status: 'online',
      sensors: selectedSensors
    };

    setStations([...stations, newStation]);
    e.target.reset();
    alert(`✅ Station "${newStation.name}" ajoutée avec succès!`);
  };

  const handleEditStation = (id) => {
    const station = stations.find(s => s.id === id);
    if (station) {
      alert(`Modification de la station: ${station.name}\n(Fonctionnalité à implémenter)`);
    }
  };

  const handleDeleteStation = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette station?')) {
      setStations(stations.filter(s => s.id !== id));
      alert('✅ Station supprimée avec succès!');
    }
  };

  const handleToggleStatus = (id) => {
    setStations(stations.map(station => {
      if (station.id === id) {
        return {
          ...station,
          status: station.status === 'online' ? 'offline' : 'online'
        };
      }
      return station;
    }));
  };

  return (
    <div className="page-content active">
      <div className="container">
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                <i className="fas fa-arrow-up"></i> {Math.round((onlineStations / totalStations) * 100)}%
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
                <i className="fas fa-power-off"></i> {Math.round((offlineStations / totalStations) * 100)}%
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' }}>
            <div className="kpi-icon">
              <i className="fas fa-city"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Villes Couvertes</div>
              <div className="kpi-value">10</div>
              <div className="kpi-trend">
                <i className="fas fa-map-marker-alt"></i> Maroc
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="stations-grid">
          {/* Add New Station Form */}
          <div className="section-card">
            <h2 className="section-title">
              <i className="fas fa-plus-circle"></i>
              Ajouter une Nouvelle Station
            </h2>
            <form onSubmit={handleAddStation} className="station-form">
              <div className="form-group">
                <label htmlFor="station-name">
                  <i className="fas fa-tag"></i>
                  Nom de la Station
                </label>
                <input type="text" id="station-name" name="name" placeholder="Ex: ESP32-CAS-001" required />
              </div>

              <div className="form-group">
                <label htmlFor="station-city">
                  <i className="fas fa-map-marker-alt"></i>
                  Ville
                </label>
                <select id="station-city" name="city" required>
                  <option value="">Sélectionnez une ville</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Fès">Fès</option>
                  <option value="Tanger">Tanger</option>
                  <option value="Agadir">Agadir</option>
                  <option value="Meknès">Meknès</option>
                  <option value="Oujda">Oujda</option>
                  <option value="Tétouan">Tétouan</option>
                  <option value="Safi">Safi</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="station-lat">
                    <i className="fas fa-location-arrow"></i>
                    Latitude
                  </label>
                  <input type="number" id="station-lat" name="lat" step="0.000001" placeholder="33.5731" required />
                </div>

                <div className="form-group">
                  <label htmlFor="station-lng">
                    <i className="fas fa-location-arrow"></i>
                    Longitude
                  </label>
                  <input type="number" id="station-lng" name="lng" step="0.000001" placeholder="-7.5898" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="station-mac">
                  <i className="fas fa-network-wired"></i>
                  Adresse MAC
                </label>
                <input 
                  type="text" 
                  id="station-mac" 
                  name="mac"
                  placeholder="AA:BB:CC:DD:EE:FF" 
                  pattern="([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-microchip"></i>
                  Capteurs Installés
                </label>
                <div className="sensors-checkboxes">
                  <label className="sensor-checkbox">
                    <input type="checkbox" value="DHT22" defaultChecked />
                    <span>🌡️ DHT22 (Temp/Humid)</span>
                  </label>
                  <label className="sensor-checkbox">
                    <input type="checkbox" value="MQ-135" defaultChecked />
                    <span>🫁 MQ-135 (CO₂)</span>
                  </label>
                  <label className="sensor-checkbox">
                    <input type="checkbox" value="BMP280" defaultChecked />
                    <span>📊 BMP280 (Pression)</span>
                  </label>
                  <label className="sensor-checkbox">
                    <input type="checkbox" value="MICS-5524" defaultChecked />
                    <span>💨 MICS-5524 (Gaz)</span>
                  </label>
                  <label className="sensor-checkbox">
                    <input type="checkbox" value="ML8511" defaultChecked />
                    <span>☀️ ML8511 (UV)</span>
                  </label>
                  <label className="sensor-checkbox">
                    <input type="checkbox" value="BH1750" defaultChecked />
                    <span>💡 BH1750 (Lumière)</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-add-station">
                <i className="fas fa-plus-circle"></i>
                Ajouter la Station
              </button>
            </form>
          </div>

          {/* Stations List */}
          <div className="section-card">
            <h2 className="section-title">
              <i className="fas fa-list"></i>
              Liste des Stations ({totalStations})
            </h2>
            <div className="stations-list">
              {stations.map(station => (
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
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{station.city}</span>
                    </div>
                    <div className="station-info-item">
                      <i className="fas fa-network-wired"></i>
                      <span>{station.mac}</span>
                    </div>
                    <div className="station-info-item">
                      <i className="fas fa-location-arrow"></i>
                      <span>{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</span>
                    </div>
                    <div className="station-info-item">
                      <i className="fas fa-microchip"></i>
                      <span>{station.sensors.length} capteurs</span>
                    </div>
                  </div>
                  <div className="station-sensors">
                    {station.sensors.map(sensor => (
                      <span key={sensor} className="sensor-badge">{sensor}</span>
                    ))}
                  </div>
                  <div className="station-actions">
                    <button className="btn-station-action btn-edit" onClick={() => handleEditStation(station.id)}>
                      <i className="fas fa-edit"></i>
                      Modifier
                    </button>
                    <button className="btn-station-action btn-delete" onClick={() => handleDeleteStation(station.id)}>
                      <i className="fas fa-trash"></i>
                      Supprimer
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

