import React,{ useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { generateHourlyData } from '../utils/helpers';
import { cityDataBases, sensorVariances } from '../data/cities';
import { sensorConfigs } from '../data/sensors';

Chart.register(...registerables);

// Chart defaults
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

function SensorChart({ sensorType, cityName }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const config = sensorConfigs[sensorType];
    const baseValue = cityDataBases[sensorType][cityName];
    const variance = sensorVariances[sensorType];
    const data = generateHourlyData(baseValue, variance, cityName, sensorType);

    const ctx = chartRef.current.getContext('2d');

    // Destroy previous chart instance if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: `${config.label} - ${cityName === 'moyenne' ? 'Moyenne Nationale' : cityName}`,
          data: data.data,
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
        plugins: {
          legend: {
            display: true,
            labels: {
              font: { size: 14, family: "'Poppins', sans-serif" },
              padding: 20,
              color: 'rgba(255, 255, 255, 0.8)'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          },
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [sensorType, cityName]);

  return (
    <div className="graph-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default SensorChart;

