import React, { useEffect, useRef } from 'react';

export default function NepalBackground() {
  const starsCanvasRef = useRef(null);

  // Twinkling Star Canvas overlay logic
  useEffect(() => {
    const canvas = starsCanvasRef.current;
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
    <div style={{position:'fixed',inset:0,zIndex:0,overflow:'hidden',background:'#06060f'}}>
      {/* Video 1: nepal-bg.mp4 (Base background animations) */}
      <video
        autoPlay muted loop playsInline
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.35,filter:'brightness(0.22) saturate(0.7)'}}
        onError={e=>e.target.style.display='none'}
      >
        <source src="/videos/nepal-bg.mp4" type="video/mp4"/>
      </video>

      {/* Video 2: nepal-bg1.mp4 (Overlay details blended simultaneously) */}
      <video
        autoPlay muted loop playsInline
        style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.25,mixBlendMode:'screen',filter:'brightness(0.22) saturate(0.7)'}}
        onError={e=>e.target.style.display='none'}
      >
        <source src="/videos/nepal-bg1.mp4" type="video/mp4"/>
      </video>

      <canvas ref={starsCanvasRef}
        style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.6,mixBlendMode:'screen',pointerEvents:'none'}}
      />
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(6,6,15,0.1) 0%,rgba(6,6,15,0.5) 60%,rgba(6,6,15,0.95) 100%)',pointerEvents:'none'}}/>
    </div>
  );
}
