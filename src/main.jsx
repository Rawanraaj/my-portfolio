import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Inject custom cursor in vanilla JS
if (typeof window !== 'undefined') {
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  const target = { x: -100, y: -100 };
  const ringPos = { x: -100, y: -100 };

  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
    dot.style.left = `${target.x}px`;
    dot.style.top = `${target.y}px`;
  });

  const tick = () => {
    ringPos.x += (target.x - ringPos.x) * 0.12;
    ringPos.y += (target.y - ringPos.y) * 0.12;
    ring.style.left = `${ringPos.x}px`;
    ring.style.top = `${ringPos.y}px`;
    requestAnimationFrame(tick);
  };
  tick();

  document.addEventListener('mouseover', (e) => {
    if (e.target && (e.target.closest('a') || e.target.closest('button'))) {
      ring.style.width = '60px';
      ring.style.height = '60px';
      ring.style.filter = 'blur(2px)';
      ring.style.borderColor = 'rgba(240,236,228,0.8)';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target && (e.target.closest('a') || e.target.closest('button'))) {
      ring.style.width = '40px';
      ring.style.height = '40px';
      ring.style.filter = 'none';
      ring.style.borderColor = 'rgba(240,236,228,0.5)';
    }
  });

  window.__setCursorPos = (x, y) => {
    target.x = x;
    target.y = y;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
  };
}

