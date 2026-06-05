import React from 'react';
import useHandGesture from '../hooks/useHandGesture';

export default function GestureOverlay() {
  const {
    isActive,
    gesture,
    enableGesture,
    disableGesture,
    videoRef,
    canvasRef
  } = useHandGesture();

  const handleToggle = () => {
    if (isActive) {
      disableGesture();
    } else {
      enableGesture();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9000] flex flex-col items-end gap-3 pointer-events-auto">
      {isActive && (
        <div className="flex flex-col items-end gap-1.5">
          <div 
            className="font-mono text-[11px] text-[#00ffff] bg-[#06060f] px-2 py-0.5 border border-[#00ffff]/20 uppercase"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            Gesture: {gesture}
          </div>
          <div className="relative w-[140px] h-[100px] border border-[#f0ece420] bg-[#06060f] overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}
      <button
        onClick={handleToggle}
        className="bg-transparent text-[#f0ece4] transition-colors duration-200"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '11px',
          border: '1px solid rgba(240, 236, 228, 0.25)',
          padding: '8px 14px',
          cursor: 'none',
          borderRadius: '0px'
        }}
      >
        {isActive ? '✋ DISABLE GESTURE' : '✋ GESTURE MODE'}
      </button>
    </div>
  );
}
