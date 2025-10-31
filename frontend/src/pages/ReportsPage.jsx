import React from 'react';
function ReportsPage() {
  const downloadReport = (reportId, format) => {
    alert(`📥 Téléchargement du rapport ${reportId} au format ${format.toUpperCase()}...\n\nCette fonctionnalité sera connectée à votre backend pour générer les vrais rapports.`);
  };

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
            <div className="next-report-time">Lundi 4 Novembre 2025 à 09:00</div>
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
          {/* Report 1 */}
          <div className="report-item">
            <div className="report-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <div className="report-content">
              <div className="report-header">
                <div>
                  <div className="report-title">Rapport Hebdomadaire #42</div>
                  <div className="report-date">📅 21 - 27 Octobre 2025</div>
                </div>
                <div className="report-actions">
                  <button className="report-btn btn-pdf" onClick={() => downloadReport('week42', 'pdf')}>
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                  <button className="report-btn btn-csv" onClick={() => downloadReport('week42', 'csv')}>
                    <i className="fas fa-file-csv"></i> CSV
                  </button>
                </div>
              </div>
              <div className="report-summary">
                <div className="report-metric">
                  <div className="report-metric-label">AQI Moyen</div>
                  <div className="report-metric-value" style={{ color: '#f59e0b' }}>82</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">Évolution</div>
                  <div className="report-metric-value" style={{ color: '#ef4444' }}>+5%</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🔴 Alertes</div>
                  <div className="report-metric-value">3</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🟡 Avertissements</div>
                  <div className="report-metric-value">12</div>
                </div>
              </div>
            </div>
          </div>

          {/* Report 2 */}
          <div className="report-item">
            <div className="report-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <div className="report-content">
              <div className="report-header">
                <div>
                  <div className="report-title">Rapport Hebdomadaire #41</div>
                  <div className="report-date">📅 14 - 20 Octobre 2025</div>
                </div>
                <div className="report-actions">
                  <button className="report-btn btn-pdf" onClick={() => downloadReport('week41', 'pdf')}>
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                  <button className="report-btn btn-csv" onClick={() => downloadReport('week41', 'csv')}>
                    <i className="fas fa-file-csv"></i> CSV
                  </button>
                </div>
              </div>
              <div className="report-summary">
                <div className="report-metric">
                  <div className="report-metric-label">AQI Moyen</div>
                  <div className="report-metric-value" style={{ color: '#fbbf24' }}>78</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">Évolution</div>
                  <div className="report-metric-value" style={{ color: '#10b981' }}>-3%</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🔴 Alertes</div>
                  <div className="report-metric-value">2</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🟡 Avertissements</div>
                  <div className="report-metric-value">8</div>
                </div>
              </div>
            </div>
          </div>

          {/* Report 3 */}
          <div className="report-item">
            <div className="report-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <div className="report-content">
              <div className="report-header">
                <div>
                  <div className="report-title">Rapport Mensuel - Septembre 2025</div>
                  <div className="report-date">📅 1 - 30 Septembre 2025</div>
                </div>
                <div className="report-actions">
                  <button className="report-btn btn-pdf" onClick={() => downloadReport('sept2025', 'pdf')}>
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                  <button className="report-btn btn-csv" onClick={() => downloadReport('sept2025', 'csv')}>
                    <i className="fas fa-file-csv"></i> CSV
                  </button>
                </div>
              </div>
              <div className="report-summary">
                <div className="report-metric">
                  <div className="report-metric-label">AQI Moyen</div>
                  <div className="report-metric-value" style={{ color: '#10b981' }}>68</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">Évolution</div>
                  <div className="report-metric-value" style={{ color: '#10b981' }}>-8%</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🔴 Alertes</div>
                  <div className="report-metric-value">5</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🟡 Avertissements</div>
                  <div className="report-metric-value">18</div>
                </div>
              </div>
            </div>
          </div>

          {/* Report 4 */}
          <div className="report-item">
            <div className="report-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <div className="report-content">
              <div className="report-header">
                <div>
                  <div className="report-title">Rapport Mensuel - Août 2025</div>
                  <div className="report-date">📅 1 - 31 Août 2025</div>
                </div>
                <div className="report-actions">
                  <button className="report-btn btn-pdf" onClick={() => downloadReport('aug2025', 'pdf')}>
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                  <button className="report-btn btn-csv" onClick={() => downloadReport('aug2025', 'csv')}>
                    <i className="fas fa-file-csv"></i> CSV
                  </button>
                </div>
              </div>
              <div className="report-summary">
                <div className="report-metric">
                  <div className="report-metric-label">AQI Moyen</div>
                  <div className="report-metric-value" style={{ color: '#10b981' }}>65</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">Évolution</div>
                  <div className="report-metric-value" style={{ color: '#10b981' }}>-4%</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🔴 Alertes</div>
                  <div className="report-metric-value">4</div>
                </div>
                <div className="report-metric">
                  <div className="report-metric-label">🟡 Avertissements</div>
                  <div className="report-metric-value">15</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="section-card ai-section">
        <h2 className="section-title">
          <i className="fas fa-chart-bar"></i>
          Statistiques Globales
        </h2>

        <div className="kpi-grid">
          <div className="kpi-card" style={{ '--kpi-color': '#3b82f6' }}>
            <div className="kpi-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Rapports Générés</div>
              <div className="kpi-value">48</div>
              <div className="kpi-trend">
                <i className="fas fa-calendar"></i> Cette année
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ '--kpi-color': '#10b981' }}>
            <div className="kpi-icon">
              <i className="fas fa-download"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Téléchargements</div>
              <div className="kpi-value">324</div>
              <div className="kpi-trend">
                <i className="fas fa-arrow-up"></i> +12% ce mois
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' }}>
            <div className="kpi-icon">
              <i className="fas fa-clock-rotate-left"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Dernier Rapport</div>
              <div className="kpi-value">2j</div>
              <div className="kpi-trend">
                <i className="fas fa-calendar-day"></i> 27 Oct 2025
              </div>
            </div>
          </div>

          <div className="kpi-card" style={{ '--kpi-color': '#8b5cf6' }}>
            <div className="kpi-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Tendance AQI</div>
              <div className="kpi-value">-5.2%</div>
              <div className="kpi-trend">
                <i className="fas fa-arrow-down"></i> Amélioration
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;

