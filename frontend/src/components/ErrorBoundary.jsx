import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f172a 100%)',
          minHeight: '100vh',
          color: '#fff',
          fontFamily: 'Poppins, sans-serif'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }}></i>
            <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#ef4444' }}>
              Une erreur s'est produite
            </h1>
            <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.8 }}>
              L'application a rencontré une erreur inattendue.
            </p>
            <details style={{ 
              textAlign: 'left', 
              background: 'rgba(0, 0, 0, 0.3)', 
              padding: '20px', 
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
                Détails de l'erreur
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '14px', 
                color: '#ef4444',
                overflow: 'auto'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '15px 40px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <i className="fas fa-refresh" style={{ marginRight: '10px' }}></i>
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
