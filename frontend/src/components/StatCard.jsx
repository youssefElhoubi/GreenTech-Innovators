import React from 'react';
function StatCard({ icon, label, value, trend, trendIcon, trendText, color, gradient, shadow, tooltip }) {
  return (
    <div 
      className="stat-card" 
      style={{
        '--card-color': color,
        '--card-gradient': gradient,
        '--card-shadow': shadow
      }}
      title={tooltip}
    >
      <div className="stat-icon-wrapper">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-trend ${trend}`}>
        <i className={`fas ${trendIcon} trend-icon`}></i>
        <span>{trendText}</span>
      </div>
    </div>
  );
}

export default StatCard;

