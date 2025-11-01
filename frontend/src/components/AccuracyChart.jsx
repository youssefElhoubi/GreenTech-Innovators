import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js";

function AccuracyChart({ weeklyData }) {
  const accuracyChartRef = useRef(null);
  const accuracyChartInstance = useRef(null);

  const calculateStdDev = (data) => {
    const n = data.length;
    if (n === 0) return 0;
    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return Math.sqrt(variance);
  };

  useEffect(() => {
    if (!weeklyData || weeklyData.length === 0) return;

    const ctx = accuracyChartRef.current.getContext("2d");

    if (accuracyChartInstance.current) {
      accuracyChartInstance.current.destroy();
    }

    const stdDev = calculateStdDev(weeklyData);

    accuracyChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: weeklyData.map((_, i) => `Sem ${i + 1}`),
        datasets: [
          {
            label: "Précision ML (%)",
            data: weeklyData,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: `Std Dev: ${stdDev.toFixed(2)}`,
            data: Array(weeklyData.length).fill(stdDev),
            borderColor: "#f59e0b",
            borderDash: [5, 5],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: "#fff" },
          },
        },
        scales: {
          y: { min: 0, max: 100, ticks: { color: "#fff" } },
          x: { ticks: { color: "#fff" } },
        },
      },
    });
  }, [weeklyData]);

  return <canvas ref={accuracyChartRef}></canvas>;
}

export default AccuracyChart;
