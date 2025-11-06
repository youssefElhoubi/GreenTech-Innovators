import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/index.css'

// console.log(' main.jsx loaded');
// console.log(' React version:', React.version);

const rootElement = document.getElementById('root');
// console.log(' Root element found:', rootElement);

if (!rootElement) {
  // console.error(' Root element not found!');
  throw new Error('Root element #root not found in DOM');
}

try {
  // console.log(' Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  // console.log(' Rendering application...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  // console.log(' React application rendered');
} catch (error) {
  console.error(' Error during React initialization:', error);
  rootElement.innerHTML = `
    <div style="padding:40px;background:#1a1f3a;color:#ef4444;min-height:100vh;font-family:Arial">
      <h1>Application Failed to Start</h1>
      <p>Check the browser console for details.</p>
      <pre>${error.message}\n${error.stack}</pre>
    </div>
  `;
}

