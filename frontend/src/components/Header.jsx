import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../utils/helpers';
import { useWebSocket } from '../context/WebSocketContext';

function Header() {
  const [dateTime, setDateTime] = useState('');
  const { isConnected, dataHistory } = useWebSocket();

  useEffect(() => {
    const updateDateTime = () => {
      setDateTime(formatDateTime());
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header>
      <div className="header-left">
        <h1>Surveillance Environnementale en Temps Réel</h1>
        <p>
          <span 
            className="live-dot" 
            style={{ 
              backgroundColor: isConnected ? '#10b981' : '#ef4444',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }}
          ></span>
          {isConnected ? (
            <>29 stations ESP32 actives - {dataHistory.length} données reçues</>
          ) : (
            <>En attente de connexion au serveur...</>
          )}
        </p>
      </div>
      <div className="header-right">
        <div className="datetime">{dateTime}</div>
        <div 
          style={{ 
            fontSize: '0.85rem', 
            marginTop: '5px',
            color: isConnected ? '#10b981' : '#ef4444',
            fontWeight: '600'
          }}
        >
          <i className={`fas ${isConnected ? 'fa-wifi' : 'fa-exclamation-triangle'}`}></i>
          {' '}
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </div>
      </div>
    </header>
  );
}

export default Header;

