import React, { useState, useEffect } from 'react';

function ScrambleText({ targetText, duration = 1800, intervalSpeed = 40 }) {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/@$#%&*_-+=';

  useEffect(() => {
    let frame = 0;
    const totalFrames = duration / intervalSpeed;
    const length = targetText.length;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const resolvedCount = Math.floor(progress * length);

      let currentStr = '';
      for (let i = 0; i < length; i++) {
        if (i < resolvedCount) {
          currentStr += targetText[i];
        } else {
          if (targetText[i] === ' ') {
            currentStr += ' ';
          } else {
            currentStr += chars[Math.floor(Math.random() * chars.length)];
          }
        }
      }

      setDisplayText(currentStr);

      if (frame >= totalFrames) {
        setDisplayText(targetText);
        clearInterval(timer);
      }
    }, intervalSpeed);

    return () => clearInterval(timer);
  }, [targetText, duration, intervalSpeed]);

  return <span>{displayText}</span>;
}

export default function Hero() {
  return (
    <section className="relative w-full min-height-screen h-screen overflow-hidden" id="hero">
      <style>{`
        @keyframes scroll-dot {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Main Title Block */}
      <div className="absolute left-8 top-[18vh] select-none z-10">
        <h1 
          className="font-black tracking-tight text-[#f0ece4] leading-none"
          style={{
            fontSize: 'clamp(80px, 13vw, 180px)',
            transform: 'rotate(-2deg)',
            transformOrigin: 'left center'
          }}
        >
          AALOK
        </h1>
        <span 
          className="text-outline font-black tracking-tight leading-none block"
          style={{
            fontSize: 'clamp(80px, 13vw, 180px)',
            marginTop: '-0.15em'
          }}
        >
          NIROULA
        </span>
      </div>

      {/* Bio text block */}
      <div 
        className="absolute right-[4vw] top-[35vh] w-[90%] md:w-[38%] text-left z-10"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          fontSize: '15px',
          lineHeight: '1.7',
          color: 'rgba(240, 236, 228, 0.5)'
        }}
      >
        Frontend developer & creative designer based in Kathmandu. BCS student at IIMS, interning at Multichoice Media. Building things that don't look like templates.
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-24 left-8 flex flex-col items-start z-10">
        <div className="relative w-[1px] h-[70px] bg-[#f0ece420] overflow-hidden">
          <div 
            className="absolute w-[3px] h-[3px] bg-[#f0ece4] rounded-full left-0"
            style={{
              animation: 'scroll-dot 2s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* Bottom info section with scramble loader */}
      <div 
        className="absolute bottom-8 left-8 text-[11px] uppercase tracking-wider z-10"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          color: 'rgba(240, 236, 228, 0.25)'
        }}
      >
        <ScrambleText targetText="FRONTEND DEV / KATHMANDU, NP / 2026" />
      </div>
    </section>
  );
}
