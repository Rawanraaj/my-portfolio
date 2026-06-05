import React, { useEffect, useRef } from 'react';

export default function NepalBackground() {
  const canvasRef = useRef(null);

  // Twinkling Star Canvas overlay logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create stars
    const starCount = 120;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        baseOpacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.20 ? '#a8c4ff' : '#ffffff', // 20% blue-ish, 80% white
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw each star with twinkling opacity
      stars.forEach((star) => {
        star.phase += star.twinkleSpeed;
        const opacity = star.baseOpacity + Math.sin(star.phase) * 0.25;
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, opacity));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundColor: '#06060f',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {/* Video 1: nepal-bg.mp4 (Base background animations) */}
      <video
        src="/videos/nepal-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
        }}
      />

      {/* Video 2: nepal-bg1.mp4 (Overlay details blended simultaneously) */}
      <video
        src="/videos/nepal-bg1.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.25,
          mixBlendMode: 'screen',
        }}
      />

      {/* Readability filters: vignette radial gradient + solid black overlays */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(6, 6, 15, 0.4) 0%, #06060f 90%)',
          zIndex: 1
        }}
      />
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(6, 6, 15, 0.65)',
          zIndex: 1
        }}
      />

      {/* Twinkling Star Canvas overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
