import React,{ useState, useEffect } from 'react';
import { formatDateTime } from '../utils/helpers';

function Header() {
  const [dateTime, setDateTime] = useState('');

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
          <span className="live-dot"></span>
          29 stations ESP32 actives à travers le Maroc
        </p>
      </div>
      <div className="header-right">
        <div className="datetime">{dateTime}</div>
      </div>
    </header>
  );
}

export default Header;

