import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js";
import { fetchPredictions } from "../api/predictionsApi";
import { fetchingKpis } from "../api/kpis";
import { fetchWeekly } from "../api/weeklyApi";
import AccuracyChart from "../components/AccuracyChart";

function AIPage() {
  const eventTypesChartRef = useRef(null);
  const eventTypesChartInstance = useRef(null);

  const [predictions, setPredictions] = useState([]);
  const [kpis, setKpis] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);

  // Load data
  useEffect(() => {
    const loadPredictions = async () => {
      const data = await fetchPredictions();
      setPredictions(data);
    };

    const loadKpis = async () => {
      const data = await fetchingKpis();
      setKpis(data);
      console.log(data);
    };

    fetchWeekly().then((data) => setWeeklyData(data));

    loadKpis();
    loadPredictions();
  }, []);

useEffect(() => {
  if (!eventTypesChartRef.current) return;
  const ctx = eventTypesChartRef.current.getContext("2d");

  const eventCounts = predictions.reduce(
    (acc, pred) => {
      switch (pred.predictionStatus) {
        case "DANGER":
          acc.Critiques += 1;
          break;
        case "WARNING":
          acc.Avertissements += 1;
          break;
        case "NORMAL":
          acc.Normaux += 1;
          break;
        default:
          break;
      }
      return acc;
    },
    { Critiques: 0, Avertissements: 0, Normaux: 0 }
  );

  if (eventTypesChartInstance.current) {
    eventTypesChartInstance.current.destroy();
  }

  eventTypesChartInstance.current = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Critiques", "Avertissements", "Normaux"],
      datasets: [
        {
          data: [
            eventCounts.Critiques,
            eventCounts.Avertissements,
            eventCounts.Normaux,
          ],
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(16, 185, 129, 0.8)",
          ],
          borderColor: ["#ef4444", "#f59e0b", "#10b981"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 14, family: "'Poppins', sans-serif" },
            color: "#fff",
            padding: 15,
          },
        },
      },
    },
  });

  return () => {
    if (eventTypesChartInstance.current) {
      eventTypesChartInstance.current.destroy();
    }
  };
}, [predictions]);


  // Helpers
  const formatTitle = (title) => title.replace(/([A-Z])/g, " $1").trim();

  const getEventIcon = (predictionStatus) => {
    switch (predictionStatus) {
      case "DANGER":
        return "⚠";
      case "WARNING":
        return "⚡";
      case "NORMAL":
        return "✓";
      default:
        return "•";
    }
  };

  return (
    <div className="page-content active">
      {/* KPIs Section */}
      <div className="section-card ai-section">
        <h2 className="section-title">
          <i className="fas fa-chart-line"></i>
          Métriques de Prédiction ML
        </h2>

        <div className="kpi-grid">
          <div className="kpi-card" style={{ "--kpi-color": "#ef4444" }}>
            <div className="kpi-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Alertes Critiques (7j)</div>
              <div className="kpi-value">{kpis.criticalAlerts ?? 0}</div>
              <div className="kpi-trend">
                <i
                  className={`fas ${
                    kpis.criticalDiff != null && kpis.criticalDiff < 0
                      ? "fa-arrow-down"
                      : "fa-arrow-up"
                  }`}
                ></i>{" "}
                {kpis.criticalDiff ?? 0} vs semaine dernière
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#f59e0b" }}>
            <div className="kpi-icon">
              <i className="fas fa-triangle-exclamation"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Avertissements (7j)</div>
              <div className="kpi-value">{kpis.warnings ?? 0}</div>
              <div className="kpi-trend">
                <i
                  className={`fas ${
                    kpis.warningsDiff != null && kpis.warningsDiff < 0
                      ? "fa-arrow-down"
                      : "fa-arrow-up"
                  }`}
                ></i>{" "}
                {kpis.warningsDiff ?? 0} vs semaine dernière
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#10b981" }}>
            <div className="kpi-icon">
              <i className="fas fa-brain"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Précision Modèle ML</div>
              <div className="kpi-value">
                {kpis.accuracy != null ? kpis.accuracy.toFixed(2) : 0}%
              </div>
              <div className="kpi-trend">
                <i
                  className={`fas ${
                    kpis.accuracyDiff != null && kpis.accuracyDiff < 0
                      ? "fa-arrow-down"
                      : "fa-arrow-up"
                  }`}
                ></i>{" "}
                {kpis.accuracyDiff != null
                  ? kpis.accuracyDiff.toFixed(2)
                  : 0}
                %
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#3b82f6" }}>
            <div className="kpi-icon">
              <i className="fas fa-chart-pie"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Prédictions Générées</div>
              <div className="kpi-value">{kpis.predictions ?? 0}</div>
              <div className="kpi-trend">
                <i className="fas fa-clock"></i> Ce mois
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="metrics-grid">
        <div className="section-card">
          <h2 className="section-title">
            <i className="fas fa-bullseye"></i>
            Précision des Prédictions
          </h2>
          <div className="metric-chart">
            <AccuracyChart weeklyData={weeklyData} />
          </div>
        </div>

        <div className="section-card">
          <h2 className="section-title">
            <i className="fas fa-chart-pie"></i>
            Types d'Événements
          </h2>
          <div className="metric-chart">
            <canvas ref={eventTypesChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="section-card ai-section">
        <h2 className="section-title">
          <i className="fas fa-calendar-alt"></i>
          Calendrier des Prédictions - 7 Jours
        </h2>

        {predictions.length === 0 ? (
          <p>Chargement des prédictions...</p>
        ) : (
          <div className="calendar-view">
            {Object.entries(
              predictions.reduce((acc, event) => {
                const key = `${event.day} ${event.date}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(event);
                return acc;
              }, {})
            ).map(([key, events], index) => (
              <div key={index} className="calendar-day">
                <div className="calendar-day-header">
                  <div className="calendar-day-name">{events[0].day}</div>
                  <div className="calendar-day-date">{events[0].date}</div>
                </div>

                <div className="calendar-day-events">
                  {events.map((prediction, i) => (
                    <div
                      key={i}
                      className={`calendar-event event-${prediction.predictionStatus.toLowerCase()}`}
                    >
                      <div className="calendar-event-time">
                        {prediction.predictionStatus}
                      </div>
                      <div className="calendar-event-title">
                        {getEventIcon(prediction.predictionStatus)}{" "}
                        {formatTitle(prediction.predictionTitle)}
                      </div>
                      <div className="calendar-event-location">
                        {prediction.city}
                      </div>
                      <div className="calendar-event-confidence">
                        ML: {prediction.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="section-card ai-section">
        <h2 className="section-title">
          <i className="fas fa-info-circle"></i>
          Légende
        </h2>
        <div className="legend-events">
          <div className="legend-event-item">
            <div
              className="legend-event-color"
              style={{ background: "#10b981" }}
            ></div>
            <span>Normal - Conditions stables</span>
          </div>
          <div className="legend-event-item">
            <div
              className="legend-event-color"
              style={{ background: "#f59e0b" }}
            ></div>
            <span>Attention - Surveillance recommandée</span>
          </div>
          <div className="legend-event-item">
            <div
              className="legend-event-color"
              style={{ background: "#ef4444" }}
            ></div>
            <span>Critique - Action nécessaire</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIPage;
