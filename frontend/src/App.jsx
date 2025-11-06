import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import AIPage from './pages/AIPage';
import ReportsPage from './pages/ReportsPage';
import StationsPage from './pages/StationsPage';
import Particles from './components/Particles';
import { themes } from './data/themes';
import { WebSocketProvider } from './context/WebSocketContext';

// console.log('App.jsx loaded');

function App() {
  // console.log(' App component rendering...');
  
  const [activePage, setActivePage] = useState( localStorage.getItem("page")||'dashboard');
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // console.log('App useEffect running');
    try {
      const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
      setTheme(savedTheme);
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      setTheme('dark');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleThemeChange = (themeName) => {
    try {
      setTheme(themeName);
      localStorage.setItem('selectedTheme', themeName);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  };
  

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: themes.dark,
        color: '#fff',
        fontSize: '24px',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '20px' }}></i>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <WebSocketProvider>
      <div
        className="animated-bg"
        style={{ background: themes[theme] || themes.dark }}
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
    </WebSocketProvider>
  );
}

export default App;