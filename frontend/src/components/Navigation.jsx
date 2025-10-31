import React from 'react';
import { themes, themeNames } from '../data/themes';

function Navigation({ activePage, onPageChange, theme, onThemeChange }) {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'ai', icon: 'fa-robot', label: 'IA & Prévisions' },
    { id: 'reports', icon: 'fa-file-lines', label: 'Rapports' },
    { id: 'stations', icon: 'fa-microchip', label: 'Stations ESP32' }
  ];

  return (
    <nav>
      <div className="nav-container">
        <div className="nav-brand">
          EcoMorocco Monitor
        </div>
        <div className="nav-center">
          <ul className="nav-menu">
            {menuItems.map(item => (
              <li key={item.id} className="nav-item">
                <a 
                  href="#" 
                  className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(item.id);
                  }}
                >
                  <i className={`fas ${item.icon}`}></i>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="nav-right">
          <div className="theme-selector">
            <span className="theme-selector-label">
              <i className="fas fa-palette"></i> Thème
            </span>
            <div className="theme-options">
              {Object.keys(themes).map(themeName => (
                <div
                  key={themeName}
                  className={`theme-option theme-${themeName} ${theme === themeName ? 'active' : ''}`}
                  onClick={() => onThemeChange(themeName)}
                  title={themeNames[themeName]}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

