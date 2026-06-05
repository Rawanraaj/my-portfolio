import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

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
  useEffect(() => {
    // Stagger animate AALOK & NIROULA on page load
    gsap.fromTo(
      '.hero-word',
      {
        opacity: 0,
        y: 60
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      }
    );
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden" id="hero">
      <style>{`
        @keyframes scroll-dot {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Main Title Block */}
      <div className="absolute left-8 top-[20vh] select-none z-10">
        <h1 
          className="hero-word font-black tracking-tight text-[#f0ece4] leading-none"
          style={{
            fontSize: 'clamp(80px, 13vw, 180px)',
            transform: 'rotate(-2deg)',
            transformOrigin: 'left center',
            display: 'block'
          }}
        >
          AALOK
        </h1>
        <span 
          className="hero-word text-outline font-black tracking-tight leading-none block"
          style={{
            fontSize: 'clamp(80px, 13vw, 180px)',
            marginTop: '-0.15em',
            display: 'block'
          }}
        >
          NIROULA
        </span>
      </div>

      {/* Bio text block: position absolute right 5vw, top 35vh, width 35% */}
      <div 
        className="absolute right-[5vw] top-[35vh] w-[90%] md:w-[35%] text-left z-10"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          fontSize: '15px',
          lineHeight: '1.7',
          color: '#f0ece470'
        }}
      >
        Frontend developer & creative designer from Kathmandu. BCS student at IIMS. Interning at Multichoice Media. Building things that don't look like templates.
      </div>

      {/* Scroll indicator: thin 1px line 70px tall, bottom-left, inner 4px dot slides down infinite 2s */}
      <div className="absolute bottom-24 left-8 flex flex-col items-start z-10">
        <div className="relative w-[1px] h-[70px] bg-[#f0ece420] overflow-hidden">
          <div 
            className="absolute w-[4px] h-[4px] bg-[#f0ece4] rounded-full -left-[1.5px]"
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
