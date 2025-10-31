export const cityCodes = {
  'Casablanca': 'CAS',
  'Rabat': 'RAB',
  'Marrakech': 'MAR',
  'Fès': 'FES',
  'Tanger': 'TAN',
  'Agadir': 'AGA',
  'Meknès': 'MEK',
  'Oujda': 'OUJ',
  'Tétouan': 'TET',
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
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898, aqi: 125, temp: 26, co2: 480, humidity: 72, uv: 7.2, light: 9200, pressure: 1012, gas: 42, stationCount: 5 },
  { name: 'Rabat', lat: 34.0209, lng: -6.8416, aqi: 78, temp: 25, co2: 425, humidity: 65, uv: 6.5, light: 8800, pressure: 1013, gas: 38, stationCount: 4 },
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811, aqi: 142, temp: 32, co2: 510, humidity: 45, uv: 9.1, light: 11500, pressure: 1015, gas: 45, stationCount: 4 },
  { name: 'Fès', lat: 34.0331, lng: -5.0003, aqi: 95, temp: 28, co2: 445, humidity: 58, uv: 7.8, light: 9600, pressure: 1014, gas: 40, stationCount: 3 },
  { name: 'Tanger', lat: 35.7595, lng: -5.8340, aqi: 68, temp: 23, co2: 410, humidity: 70, uv: 5.5, light: 7200, pressure: 1011, gas: 35, stationCount: 3 },
  { name: 'Agadir', lat: 30.4278, lng: -9.5981, aqi: 52, temp: 24, co2: 395, humidity: 68, uv: 8.2, light: 10200, pressure: 1010, gas: 33, stationCount: 2 },
  { name: 'Meknès', lat: 33.8935, lng: -5.5473, aqi: 88, temp: 27, co2: 438, humidity: 60, uv: 7.0, light: 8900, pressure: 1013, gas: 39, stationCount: 2 },
  { name: 'Oujda', lat: 34.6814, lng: -1.9086, aqi: 105, temp: 29, co2: 465, humidity: 52, uv: 8.5, light: 10800, pressure: 1016, gas: 41, stationCount: 2 },
  { name: 'Tétouan', lat: 35.5889, lng: -5.3626, aqi: 72, temp: 24, co2: 418, humidity: 69, uv: 6.0, light: 7800, pressure: 1012, gas: 36, stationCount: 2 },
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

