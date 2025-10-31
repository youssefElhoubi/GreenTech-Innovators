import React ,{ useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import AIPage from './pages/AIPage';
import ReportsPage from './pages/ReportsPage';
import StationsPage from './pages/StationsPage';
import Particles from './components/Particles';
import { themes } from './data/themes';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    localStorage.setItem('selectedTheme', themeName);
  };

  return (
    <>
      <div 
        className="animated-bg" 
        style={{ background: themes[theme] }}
      />
      <Particles />
      
      <div className="container">
        <Navigation 
          activePage={activePage}
          onPageChange={setActivePage}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'ai' && <AIPage />}
        {activePage === 'reports' && <ReportsPage />}
        {activePage === 'stations' && <StationsPage />}
      </div>
    </>
  );
}

export default App;

