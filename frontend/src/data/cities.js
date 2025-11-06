export const cityCodes = {
  'Safi': 'SAF'
};

// Generate stations for each city
function generateStations(cityName, count) {
  const code = cityCodes[cityName];
  const stations = [];
  const statuses = ['active', 'active', 'active', 'offline', 'maintenance'];

  for (let i = 1; i <= count; i++) {
    const statusIndex = Math.floor(Math.random() * 10);
    stations.push({
      id: `${code}-${String(i).padStart(3, '0')}`,
      status: statusIndex < 8 ? 'active' : (statusIndex === 8 ? 'offline' : 'maintenance'),
      lastUpdate: new Date(Date.now() - Math.random() * 300000).toLocaleTimeString('fr-FR')
    });
  }
  return stations;
}

export const cities = [
  { name: 'Safi', lat: 32.2994, lng: -9.2372, aqi: 81, temp: 25, co2: 430, humidity: 66, uv: 6.8, light: 8500, pressure: 1011, gas: 37, stationCount: 2 }
].map(city => ({
  ...city,
  stations: generateStations(city.name, city.stationCount),
  activeStations: 0
})).map(city => ({
  ...city,
  activeStations: city.stations.filter(s => s.status === 'active').length
}));

export const cityDataBases = {
  'temp': { 'moyenne': 25, 'Casablanca': 26, 'Rabat': 25, 'Marrakech': 32, 'Fès': 28, 'Tanger': 23, 'Agadir': 24, 'Meknès': 27, 'Oujda': 29, 'Tétouan': 24, 'Safi': 25 },
  'humidity': { 'moyenne': 65, 'Casablanca': 72, 'Rabat': 65, 'Marrakech': 45, 'Fès': 58, 'Tanger': 70, 'Agadir': 68, 'Meknès': 60, 'Oujda': 52, 'Tétouan': 69, 'Safi': 66 },
  'co2': { 'moyenne': 425, 'Casablanca': 480, 'Rabat': 425, 'Marrakech': 510, 'Fès': 445, 'Tanger': 410, 'Agadir': 395, 'Meknès': 438, 'Oujda': 465, 'Tétouan': 418, 'Safi': 430 },
  'pressure': { 'moyenne': 1013, 'Casablanca': 1012, 'Rabat': 1013, 'Marrakech': 1015, 'Fès': 1014, 'Tanger': 1011, 'Agadir': 1010, 'Meknès': 1013, 'Oujda': 1016, 'Tétouan': 1012, 'Safi': 1011 },
  'gas': { 'moyenne': 38, 'Casablanca': 42, 'Rabat': 38, 'Marrakech': 45, 'Fès': 40, 'Tanger': 35, 'Agadir': 33, 'Meknès': 39, 'Oujda': 41, 'Tétouan': 36, 'Safi': 37 },
  'uv': { 'moyenne': 6.2, 'Casablanca': 7.2, 'Rabat': 6.5, 'Marrakech': 9.1, 'Fès': 7.8, 'Tanger': 5.5, 'Agadir': 8.2, 'Meknès': 7.0, 'Oujda': 8.5, 'Tétouan': 6.0, 'Safi': 6.8 },
  'light': { 'moyenne': 8524, 'Casablanca': 9200, 'Rabat': 8800, 'Marrakech': 11500, 'Fès': 9600, 'Tanger': 7200, 'Agadir': 10200, 'Meknès': 8900, 'Oujda': 10800, 'Tétouan': 7800, 'Safi': 8500 }
};

export const sensorVariances = {
  'temp': 8, 'humidity': 15, 'co2': 60, 'pressure': 5, 'gas': 15, 'uv': 3, 'light': 2000
};

