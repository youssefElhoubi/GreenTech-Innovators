import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { sensorConfigs } from '../data/sensors';
import { useWebSocket } from '../context/WebSocketContext';

Chart.register(...registerables);
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

function SensorChart({ sensorType, cityName, maxPoints = 30 }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { dataHistory } = useWebSocket();

  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    const config = sensorConfigs[sensorType];

    // Create chart only once
    if (!chartInstanceRef.current) {
      console.log('[SensorChart] Creating new chart for:', sensorType);
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: `${config.label} - ${cityName === 'moyenne' ? 'Temps Réel' : cityName}`,
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
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 750,
            easing: 'easeInOutQuart'
          },
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

    // Update chart data
    const chart = chartInstanceRef.current;
    const latestData = dataHistory.slice(-maxPoints);

    const labels = latestData.map(d =>
      d.timestamp ? new Date(d.timestamp).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) : new Date().toLocaleTimeString('fr-FR')
    );
    
    const chartData = latestData.map(d => {
      const value = d[sensorType];
      return value !== undefined && value !== null ? value : 0;
    });

    console.log(`[SensorChart] Updating ${sensorType} chart with ${chartData.length} points`);

    // Update chart data and configuration
    chart.data.labels = labels;
    chart.data.datasets[0].data = chartData;
    chart.data.datasets[0].label = `${config.label} - ${cityName === 'moyenne' ? 'Temps Réel' : cityName}`;
    chart.data.datasets[0].borderColor = config.color;
    chart.data.datasets[0].backgroundColor = config.color + '20';
    chart.data.datasets[0].pointBackgroundColor = config.color;

    // Force chart update with animation
    chart.update('active');

  }, [sensorType, cityName, dataHistory, maxPoints]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        console.log('[SensorChart] Destroying chart:', sensorType);
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
