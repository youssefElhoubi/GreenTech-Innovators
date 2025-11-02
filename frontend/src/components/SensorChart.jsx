import React, { useEffect, useRef, useContext } from 'react';
import { Chart, registerables } from 'chart.js';
import { sensorConfigs } from '../data/sensors';
import { useWebSocket } from '../context/WebSocketContext';

Chart.register(...registerables);
Chart.defaults.color = '#fff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

function SensorChart({ sensorType, cityName }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const { dataHistory } = useWebSocket();

  useEffect(() => {
    const config = sensorConfigs[sensorType];
    
    const labels = dataHistory.map(d => {
      return d.timestamp ? new Date(d.timestamp).toLocaleTimeString('fr-FR') : new Date().toLocaleTimeString('fr-FR');
    });
    const chartData = dataHistory.map(d => d[sensorType]);

    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${config.label} - ${cityName === 'moyenne' ? 'Temps Réel' : cityName}`,
          data: chartData,
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
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [sensorType, cityName, dataHistory]);

  return (
    <div className="graph-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default SensorChart;