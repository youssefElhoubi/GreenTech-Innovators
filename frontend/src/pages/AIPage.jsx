import React,{ useEffect,useState , useRef } from "react"
import { Chart } from "chart.js"
const API_URL = "http://localhost:8080/api/predictions";
import axios from "axios";

    function AIPage() {
      const accuracyChartRef = useRef(null)
      const eventTypesChartRef = useRef(null)
      const accuracyChartInstance = useRef(null)
      const eventTypesChartInstance = useRef(null)
        const [predictions, setPredictions] = useState([]);
 useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get(API_URL);
        setPredictions(response.data);
        console.log(response.data)
      } catch (error) {
        console.error(" Erreur lors du chargement des prédictions :", error);
      }
    };
    fetchPredictions();
  }, []);

  const groupedByDay = predictions.reduce((acc, event) => {
    const key = `${event.day} ${event.date}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
      useEffect(() => {
        // Accuracy Chart
        if (accuracyChartRef.current) {
          const ctx = accuracyChartRef.current.getContext("2d")

          if (accuracyChartInstance.current) {
            accuracyChartInstance.current.destroy()
          }

          accuracyChartInstance.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"],
              datasets: [
                {
                  label: "Précision ML (%)",
                  data: [82.5, 84.2, 86.1, 87.8, 88.9, 89.3],
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
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    font: { size: 14, family: "'Poppins', sans-serif" },
                    color: "#fff",
                    padding: 20,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                  min: 80,
                  max: 100,
                  grid: { color: "rgba(255, 255, 255, 0.1)" },
                  ticks: { color: "#fff" },
                },
                x: {
                  grid: { color: "rgba(255, 255, 255, 0.05)" },
                  ticks: { color: "#fff" },
                },
              },
            },
          })
        }


        // Event Types Chart
        if (eventTypesChartRef.current) {
          const ctx = eventTypesChartRef.current.getContext("2d")

          if (eventTypesChartInstance.current) {
            eventTypesChartInstance.current.destroy()
          }

          eventTypesChartInstance.current = new Chart(ctx, {
            type: "doughnut",
            data: {
              labels: ["Critiques", "Avertissements", "Normaux"],
              datasets: [
                {
                  data: [15, 32, 95],
                  backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(245, 158, 11, 0.8)", "rgba(16, 185, 129, 0.8)"],
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
          })
        }

        return () => {
          if (accuracyChartInstance.current) {
            accuracyChartInstance.current.destroy()
          }
          if (eventTypesChartInstance.current) {
            eventTypesChartInstance.current.destroy()
          }
        }
      }, [])

      const formatTitle = (title) => {
        return title.replace(/([A-Z])/g, " $1").trim();
      }


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
     }


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
                <div className="kpi-value">3</div>
                <div className="kpi-trend">
                  <i className="fas fa-arrow-up"></i> +2 vs semaine dernière
                </div>
              </div>
            </div>

            <div className="kpi-card" style={{ "--kpi-color": "#f59e0b" }}>
              <div className="kpi-icon">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Avertissements (7j)</div>
                <div className="kpi-value">5</div>
                <div className="kpi-trend">
                  <i className="fas fa-arrow-down"></i> -1 vs semaine dernière
                </div>
              </div>
            </div>

            <div className="kpi-card" style={{ "--kpi-color": "#10b981" }}>
              <div className="kpi-icon">
                <i className="fas fa-brain"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Précision Modèle ML</div>
                <div className="kpi-value">89.3%</div>
                <div className="kpi-trend">
                  <i className="fas fa-arrow-up"></i> +1.2% ce mois
                </div>
              </div>
            </div>

            <div className="kpi-card" style={{ "--kpi-color": "#3b82f6" }}>
              <div className="kpi-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Prédictions Générées</div>
                <div className="kpi-value">142</div>
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
              <canvas ref={accuracyChartRef}></canvas>
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
                        <div className="calendar-event-time">{prediction.predictionStatus}</div>
                        <div className="calendar-event-title">
                          {getEventIcon(prediction.predictionStatus)}{" "}
                          {formatTitle(prediction.predictionTitle)}
                        </div>
                        <div className="calendar-event-location">{prediction.city}</div>
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
              <div className="legend-event-color" style={{ background: "#10b981" }}></div>
              <span>Normal - Conditions stables</span>
            </div>
            <div className="legend-event-item">
              <div className="legend-event-color" style={{ background: "#f59e0b" }}></div>
              <span>Attention - Surveillance recommandée</span>
            </div>
            <div className="legend-event-item">
              <div className="legend-event-color" style={{ background: "#ef4444" }}></div>
              <span>Critique - Action nécessaire</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default AIPage
