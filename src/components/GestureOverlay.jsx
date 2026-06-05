import React from 'react';
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

  const handleToggle = () => {
    if (isActive) {
      disableGesture();
    } else {
      enableGesture();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        gap: '12px',
        pointerEvents: 'auto'
      }}
    >
      {isActive && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '6px' }}>
          <div 
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: '#00ffff',
              backgroundColor: '#06060f',
              padding: '2px 8px',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              textTransform: 'uppercase'
            }}
          >
            Gesture: {gesture}
          </div>
          <div 
            style={{
              position: 'relative',
              width: '140px',
              height: '100px',
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
          fontSize: '11px',
          color: '#f0ece4',
          backgroundColor: 'rgba(6, 6, 15, 0.8)',
          border: '1px solid rgba(240, 236, 228, 0.25)',
          padding: '8px 14px',
          cursor: 'none',
          borderRadius: '20px',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s'
        }}
      >
        {isActive ? '✋ DISABLE GESTURE' : '✋ GESTURE MODE'}
      </button>
    </div>
  );
}
