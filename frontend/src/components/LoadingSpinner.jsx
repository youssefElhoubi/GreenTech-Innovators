import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ size = 48, message = 'Chargement...', fullScreen = false }) {
  const content = (
    <div className={`loading-spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loading-spinner">
        <svg 
          width={size} 
          height={size * 52/48} 
          viewBox="0 0 48 52" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="spinner-logo"
        >
          <g clipPath="url(#clip0_371_326)">
            <path d="M29.2881 26.0682C29.2881 26.0682 38.4058 7.40368 44.2583 0.111059C44.4662 -0.14588 44.8787 0.0793381 44.7668 0.390202C43.3724 4.3109 39.6019 14.8644 38.2075 18.1412C37.9741 18.69 37.5839 19.1594 37.0818 19.483C35.7034 20.3712 32.5821 22.7407 31.1078 26.7502L29.2881 26.0682Z" fill="currentColor"/>
            <path d="M31.2932 26.6709C31.2932 26.6709 44.0248 43.1245 47.9712 51.5813C48.1119 51.8795 47.7218 52.1459 47.4915 51.908C44.5844 48.9167 36.7651 40.8374 34.4337 38.1348C34.0436 37.6812 33.7973 37.1261 33.7302 36.5361C33.5479 34.9183 32.8123 31.0864 29.8605 27.9841L31.2932 26.6709Z" fill="currentColor"/>
            <path d="M29.9309 28.1936C29.9309 28.1936 9.6966 33.4275 0.307037 33.7416C-0.0255638 33.7511 -0.118308 33.2943 0.191906 33.1769C4.10316 31.686 14.6472 27.6829 18.066 26.6044C18.6384 26.4236 19.2493 26.414 19.8249 26.5853C21.3984 27.0485 25.2457 27.8669 29.2753 26.376L29.9309 28.1936Z" fill="currentColor"/>
            <path d="M31.8849 26.9849C31.8849 27.9619 31.0854 28.7517 30.1036 28.7517C29.1186 28.7517 28.3223 27.9587 28.3223 26.9849C28.3223 26.011 29.1218 25.218 30.1036 25.218C31.0886 25.2149 31.8849 26.0079 31.8849 26.9849Z" fill="#E5FBFF"/>
          </g>
          <defs>
            <clipPath id="clip0_371_326">
              <rect width="48" height="52" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        
        {/* Cercles d'animation autour du logo */}
        <div className="spinner-ring ring-1"></div>
        <div className="spinner-ring ring-2"></div>
        <div className="spinner-ring ring-3"></div>
      </div>
      
      {message && (
        <div className="loading-message">
          <p>{message}</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );

  return content;
}

export default LoadingSpinner;

