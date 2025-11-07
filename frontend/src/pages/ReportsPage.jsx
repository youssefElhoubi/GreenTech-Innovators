import React, { useEffect, useState } from "react"
import Swal from 'sweetalert2';
function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

 useEffect(() => {
  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/reports/data");
      if (!response.ok) throw new Error("Erreur lors du chargement des rapports");
      const data = await response.json();

      const fakeData = [
        {
          name: "Meknès",
          aqiMoyen: 90,
          evolution: "+3%",
          alertesRouges: 1,
          avertissementsJaunes: 2,
          tempMoyen: 21,
          humidityMoyen: 58,
          stationsActives: 5,
          alertColor: "#f59e0b",
        },
        {
          name: "Fès",
          aqiMoyen: 120,
          evolution: "+8%",
          alertesRouges: 3,
          avertissementsJaunes: 4,
          tempMoyen: 19,
          humidityMoyen: 60,
          stationsActives: 7,
          alertColor: "#ef4444",
        },
      ];

      const allCities = [...data.cities, ...fakeData];

      const formatted = allCities.map((city, index) => ({
        id: index + 1,
        date: data.date, // tu peux générer des dates différentes pour les fake data si tu veux
        city: city.name,
        title: `Rapport ${data.date}`,
        aqiMoyen: city.aqiMoyen,
        evolution: city.evolution,
        alertesRouges: city.alertesRouges,
        avertissementsJaunes: city.avertissementsJaunes,
        tempMoyen: city.tempMoyen,
        humidityMoyen: city.humidityMoyen,
        stationsActives: city.stationsActives,
        alertColor: city.alertColor,
      }));

      setReports(formatted);
      setLoading(false);

      // 5️⃣ Statistiques globales
      const totalReports = formatted.length;
      const totalDownloads = formatted.reduce((sum, r) => sum + r.stationsActives, 0);
      const reportDates = formatted.map((r) => new Date(r.date));
      const latestDate = new Date(Math.max(...reportDates));
      const today = new Date();
      const diffTime = Math.abs(today - latestDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const lastReportTime = `${diffDays}j`;
      const avgAqi = formatted.reduce((sum, r) => sum + r.aqiMoyen, 0) / totalReports;
      const aqiTrend = (avgAqi - 100).toFixed(1) + "%";

      setStats({
        generatedReports: totalReports,
        downloads: totalDownloads,
        downloadsTrend: "+12% ce mois",
        lastReportTime,
        lastReportDate: latestDate.toLocaleDateString("fr-FR"),
        aqiTrend,
        aqiTrendLabel: aqiTrend.startsWith("-") ? "Amélioration" : "En hausse",
      });
    } catch (err) {
      console.error(err);
      setError("❌ Impossible de charger les rapports.");
      setLoading(false);
    }
  };

  fetchReports();
}, []);


  const downloadReport = async (reportId, format) => {
  try {
    const report = reports.find((r) => r.id === reportId);
    if (!report) {
      return Swal.fire({
        title: "⚠️ Rapport non trouvé",
        icon: "warning",
      });
    }

    let endpoint = "";
    let fileName = "";

    if (format === "csv") {
      endpoint = "http://localhost:8080/api/reports/download";
      fileName = `weekly-report-${report.date}.csv`;
    } else if (format === "pdf") {
      endpoint = "http://localhost:8080/api/reports/pdf-ai-latest";
      fileName = `weekly-report-ai-${report.date}.pdf`;
    } else {
      throw new Error("Format non supporté");
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement ${format.toUpperCase()}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    Swal.fire({
      title: "🎉 Success!",
      text: "Rapport téléchargé avec succès!",
      icon: "success",
      timer: 5000,
      timerProgressBar: true,
      background: "#f0fff4",
      color: "#155724",
      iconColor: "#28a745",
      showConfirmButton: false,
      html: `
        <div style="font-size:16px; font-weight:500;">
          Operation successful! Closing in <b>5s</b>...
        </div>
      `,
      customClass: {
        popup: "animate__animated animate__fadeInDown",
      },
    });

  } catch (err) {
    console.error("Download error:", err);
    Swal.fire({
      title: "❌ Failed!",
      text: `Impossible de télécharger le rapport. Essayez à nouveau.`,
      icon: "error",
      timer: 5000,
      timerProgressBar: true,
      background: "#fff5f5",
      color: "#721c24",
      iconColor: "#dc3545",
      showConfirmButton: false,
      html: `
        <div style="font-size:16px; font-weight:500;">
          Something went wrong. Closing in <b>5s</b>...
        </div>
      `,
      customClass: {
        popup: "animate__animated animate__shakeX",
      },
    });
  }
};


  if (error) {
    return (
      <div className="page-content active">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="page-content active">
      {/* Next Report Banner */}
      <div className="section-card ai-section">
        <h2 className="section-title">
          <i className="fas fa-clock"></i>
          Prochain Rapport
        </h2>

        <div className="next-report-banner">
          <div className="next-report-icon">🕐</div>
          <div className="next-report-text">
            <div className="next-report-title">Prochain rapport hebdomadaire</div>
            <div className="next-report-time">
              {stats
                ? new Date(
                    new Date(stats.lastReportDate).getTime() + 7 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }) + " à 09:00"
                : "Calcul en cours..."}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Timeline */}
      <div className="section-card ai-section">
        <h2 className="section-title">
          <i className="fas fa-file-lines"></i>
          Rapports Disponibles
        </h2>

        <div className="reports-timeline">
          {loading ? (
            <p>Chargement des rapports...</p>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-icon">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div className="report-content">
                  <div className="report-header">
                    <div>
                      <div className="report-title">{report.city}</div>
                      <div className="report-date">📅 {report.date}</div>
                    </div>
                    <div className="report-actions">
                      <button
                        className="report-btn btn-pdf"
                        onClick={() => downloadReport(report.id, "pdf")}
                      >
                        <i className="fas fa-file-pdf"></i> PDF
                      </button>
                      <button
                        className="report-btn btn-csv"
                        onClick={() => downloadReport(report.id, "csv")}
                      >
                        <i className="fas fa-file-csv"></i> CSV
                      </button>
                    </div>
                  </div>
                  <div className="report-summary">
                    <div className="report-metric">
                      <div className="report-metric-label">AQI Moyen</div>
                      <div
                        className="report-metric-value"
                        style={{ color: report.alertColor || "#f59e0b" }}
                      >
                        {report.aqiMoyen}
                      </div>
                    </div>
                    <div className="report-metric">
                      <div className="report-metric-label">Évolution</div>
                      <div
                        className="report-metric-value"
                        style={{
                          color: report.evolution?.startsWith("-") ? "#10b981" : "#ef4444",
                        }}
                      >
                        {report.evolution}
                      </div>
                    </div>
                    <div className="report-metric">
                      <div className="report-metric-label">🔴 Alertes</div>
                      <div className="report-metric-value">{report.alertesRouges}</div>
                    </div>
                    <div className="report-metric">
                      <div className="report-metric-label">🟡 Avertissements</div>
                      <div className="report-metric-value">{report.avertissementsJaunes}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Aucun rapport disponible.</p>
          )}
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="section-card ai-section">
        <h2 className="section-title">
          <i className="fas fa-chart-bar"></i>
          Statistiques Globales
        </h2>

        <div className="kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card" style={{ "--kpi-color": "#3b82f6" }}>
            <div className="kpi-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Rapports Générés</div>
              <div className="kpi-value">{stats?.generatedReports ?? "-"}</div>
              <div className="kpi-trend">
                <i className="fas fa-calendar"></i> Cette année
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#10b981" }}>
            <div className="kpi-icon">
              <i className="fas fa-download"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Téléchargements</div>
              <div className="kpi-value">{stats?.downloads ?? "-"}</div>
              <div className="kpi-trend">
                <i className="fas fa-arrow-up"></i> {stats?.downloadsTrend ?? "-"}
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#f59e0b" }}>
            <div className="kpi-icon">
              <i className="fas fa-clock-rotate-left"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Dernier Rapport</div>
              <div className="kpi-value">{stats?.lastReportTime ?? "-"}</div>
              <div className="kpi-trend">
                <i className="fas fa-calendar-day"></i> {stats?.lastReportDate ?? "-"}
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ "--kpi-color": "#8b5cf6" }}>
            <div className="kpi-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Tendance AQI</div>
              <div className="kpi-value">{stats?.aqiTrend ?? "-"}</div>
              <div className="kpi-trend">{stats?.aqiTrendLabel ?? "Amélioration"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage