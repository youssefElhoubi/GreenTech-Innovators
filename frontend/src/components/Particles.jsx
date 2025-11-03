import React, { useEffect, useRef } from 'react';

function Particles() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const particlesContainer = particlesRef.current;
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = Math.random() * 5 + 2 + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      particlesContainer.appendChild(particle);
    }

    return () => {
      particlesContainer.innerHTML = '';
    };
  }, []);

  return <div className="particles" ref={particlesRef}></div>;
}

export default Particles;

