import React, { useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { sensorConfigs } from '../data/sensors';
import { useWebSocket } from '../context/WebSocketContext';

Chart.register(...registerables);
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

function SensorChart({ sensorType, cityName, cityStations = [] }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { stationsData } = useWebSocket();

  // Prepare data: aggregate and calculate average for selected stations only
  const chartData = useMemo(() => {
    // 1. Determine which MAC addresses to display
    let targetMacs = [];
    
    if (cityName === 'moyenne' || !cityStations.length) {
      // If we selected average or no specific stations, take all available stations
      targetMacs = Object.keys(stationsData);
    } else {
      // Otherwise, take only MAC addresses of stations belonging to this city
      // cityStations is the list of station objects passed from Dashboard
      targetMacs = cityStations
        .map(s => s.adresseMAC || s.mac) // Handle different possible naming conventions
        .filter(mac => stationsData[mac]); // Ensure we have data for them
    }

    if (targetMacs.length === 0) return { labels: [], data: [] };

    // 2. Unify timestamps - assume data is roughly synchronized
    // We'll take timestamps from the first station as reference
    const referenceMac = targetMacs[0];
    const referenceHistory = stationsData[referenceMac] || [];
    
    const labels = referenceHistory.map(d => 
      d.timestamp ? new Date(d.timestamp).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      }) : ''
    );

    // 3. Calculate average for each time point across all selected stations
    const data = referenceHistory.map((_, index) => {
      let sum = 0;
      let count = 0;

      targetMacs.forEach(mac => {
        const point = stationsData[mac]?.[index];
        if (point && point[sensorType] !== undefined) {
          sum += point[sensorType];
          count++;
        }
      });

      return count > 0 ? sum / count : 0;
    });

    return { labels, data };
  }, [stationsData, cityName, cityStations, sensorType]);

  // Draw and update chart
  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    const config = sensorConfigs[sensorType];

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: `${config.label} - ${cityName === 'moyenne' ? 'Moyenne Nationale' : cityName}`,
            data: [],
            borderColor: config.color,
            backgroundColor: config.color + '20',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: config.color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false, // Disable animation for better performance
          plugins: {
            legend: { 
              display: true,
              labels: {
                color: '#fff',
                font: {
                  size: 12,
                  family: "'Poppins', sans-serif"
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: config.color,
              borderWidth: 1
            }
          },
          scales: {
            y: { 
              beginAtZero: false,
              ticks: { color: '#fff' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
              ticks: { color: '#fff', maxRotation: 45, minRotation: 45 },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          }
        }
      });
    }

    const chart = chartInstanceRef.current;
    chart.data.labels = chartData.labels;
    chart.data.datasets[0].data = chartData.data;
    chart.data.datasets[0].label = `${config.label} - ${cityName === 'moyenne' ? 'Moyenne Nationale' : cityName}`;
    chart.data.datasets[0].borderColor = config.color;
    chart.data.datasets[0].backgroundColor = config.color + '20';
    chart.data.datasets[0].pointBackgroundColor = config.color;
    chart.update();

  }, [chartData, sensorType, cityName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [sensorType]);

  return (
    <div className="graph-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default SensorChart;
