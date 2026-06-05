import React, { useState, useEffect } from 'react';
import useHandGesture from '../hooks/useHandGesture';

export default function GestureOverlay({ gestureState }) {
  // If no gestureState is passed as a prop, call the hook internally
  const internalGestureState = useHandGesture();
  const state = gestureState || internalGestureState;

  const {
    isActive,
    gesture,
    enableGesture,
    disableGesture,
    videoRef,
    canvasRef
  } = state;

  const [isMobile, setIsMobile] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Monitor screen size and touch support for mobile layouts
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || 
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    if (isActive) {
      disableGesture();
    } else {
      const seen = sessionStorage.getItem('gesture_tutorial_seen');
      if (seen) {
        enableGesture();
      } else {
        setShowTutorial(true);
      }
    }
  };

  const handleCloseTutorial = () => {
    setIsFading(true);
    // Modal fades out for 800ms before camera permission popup triggers
    setTimeout(() => {
      setShowTutorial(false);
      setIsFading(false);
      sessionStorage.setItem('gesture_tutorial_seen', 'true');
      enableGesture();
    }, 800);
  };

  const getGestureDisplay = (g) => {
    switch (g) {
      case 'SCROLL_DOWN':
        return { text: '✌️ SCROLL DOWN', color: '#10b981' };
      case 'SCROLL_UP':
        return { text: '🤟 SCROLL UP', color: '#10b981' };
      case 'CLICK':
        return { text: '🤌 CLICK', color: '#00ffff' };
      case 'TOP':
        return { text: '✊ TOP', color: '#a78bfa' };
      default:
        return { text: '—', color: 'rgba(240, 236, 228, 0.4)' };
    }
  };

  const display = getGestureDisplay(gesture);
  const previewWidth = isMobile ? 80 : 140;
  const previewHeight = isMobile ? 60 : 100;
  const labelFontSize = isMobile ? '10px' : '11px';

  const tutorialModal = showTutorial && (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(6, 6, 15, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: isFading ? 0 : 1,
        transition: 'opacity 0.4s ease-in-out',
        padding: '20px',
        pointerEvents: 'auto',
        cursor: 'default'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'rgba(15, 15, 36, 0.95)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
          padding: '30px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          pointerEvents: 'auto'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '20px', color: '#f0ece4', marginBottom: '4px' }}>
            Hand Gesture Controls
          </h3>
          <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'rgba(240, 236, 228, 0.5)' }}>
            Works on laptop, desktop & mobile
          </p>
        </div>

        {/* Gesture visual mapping table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '10px 0' }}>
          {[
            { emoji: '✌️', name: 'Two fingers', desc: 'Scroll down' },
            { emoji: '🤟', name: 'Three fingers', desc: 'Scroll up' },
            { emoji: '🤌', name: 'Pinch', desc: 'Click / select' },
            { emoji: '✊', name: 'Fist (hold)', desc: 'Back to top' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '0.5px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '24px' }}>{item.emoji}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f0ece4', fontFamily: 'Inter, sans-serif' }}>{item.name}</span>
                <span style={{ fontSize: '11px', color: 'rgba(240, 236, 228, 0.5)', fontFamily: 'Inter, sans-serif' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bullet point instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(240, 236, 228, 0.4)', lineHeight: '1.5' }}>
          <span>· Hold gesture steady for 0.2s to activate</span>
          <span>· Drop hand from frame to stop scrolling</span>
          {isMobile && (
            <span>· On mobile: hold phone in one hand, gesture with other in front of front camera</span>
          )}
        </div>

        {/* Confirmation got it cta */}
        <button
          onClick={handleCloseTutorial}
          style={{
            width: '100%',
            backgroundColor: '#f0ece4',
            color: '#06060f',
            border: 'none',
            padding: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'background-color 0.2s',
            marginTop: '8px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#d6d2cb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f0ece4'}
        >
          GOT IT — ENABLE CAMERA
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end',
          gap: '8px',
          pointerEvents: 'auto'
        }}
      >
        {isActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '6px' }}>
            <div 
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: labelFontSize,
                color: display.color,
                backgroundColor: '#06060f',
                padding: '2px 8px',
                border: `1px solid ${display.color}33`,
                textTransform: 'uppercase',
                transition: 'color 0.2s, border-color 0.2s',
                fontWeight: 500
              }}
            >
              {display.text}
            </div>
            <div 
              style={{
                position: 'relative',
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                border: '1px solid rgba(240, 236, 228, 0.2)',
                backgroundColor: '#06060f',
                overflow: 'hidden'
              }}
            >
              <video
                ref={videoRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </div>
        )}
        <button
          onClick={handleToggle}
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: isMobile ? '10px' : '11px',
            color: '#f0ece4',
            backgroundColor: 'rgba(6, 6, 15, 0.8)',
            border: '1px solid rgba(240, 236, 228, 0.25)',
            padding: isMobile ? '6px 12px' : '8px 14px',
            cursor: 'none',
            borderRadius: '20px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s'
          }}
        >
          {isActive ? '✋ DISABLE GESTURE' : '✋ GESTURE MODE'}
        </button>
      </div>

      {tutorialModal}
    </>
  );
}
