// Get color based on AQI
export function getColor(aqi) {
  if (aqi <= 50) return '#10b981';
  if (aqi <= 100) return '#fbbf24';
  if (aqi <= 150) return '#f97316';
  return '#ef4444';
}

export function getColorWithAlpha(aqi, alpha) {
  const color = getColor(aqi);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getRadius(aqi) {
  return Math.max(10000, aqi * 300);
}

// Generate chart data with fixed pattern (not random)
export function generateHourlyData(baseValue, variance, cityName, sensorType) {
  const data = [];
  const labels = [];

  // Create a deterministic seed based on city and sensor
  const seed = (cityName + sensorType).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 23; i >= 0; i--) {
    labels.push(`${i}h`);

    // Use sine wave with deterministic variation based on hour and seed
    const hourFactor = Math.sin((i / 24) * Math.PI * 2 + seed) * 0.5;
    const variation = hourFactor * variance;

    data.push(Math.max(0, baseValue + variation));
  }
  return { labels: labels.reverse(), data: data.reverse() };
}

// Format date time in French
export function formatDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  return now.toLocaleDateString('fr-FR', options);
}

